import { NextResponse } from "next/server";
import { fetchBotConfig, logTrade, fetchActivePositions } from "@/lib/db";
import { fetchGammaMarkets, fetchPriceHistory, fetchOrderbook } from "@/lib/polymarket";
import { fetchNewsForMarket } from "@/lib/news";
import { fetchLiveCityWeather, parseWeatherTarget } from "@/lib/weather";
import { generateSignal } from "@/lib/signals";
import { placeLimitOrder } from "@/lib/trading";

export async function GET(req: Request) {
  try {
    const config = await fetchBotConfig();
    
    // Untuk testing manual, kita ijinkan scan walaupun bot STOPPED, tapi HANYA report hasilnya
    const isTestRun = new URL(req.url).searchParams.get("test") === "true";
    
    if (config.status !== 'RUNNING' && !isTestRun) {
      return NextResponse.json({ message: "Bot is currently STOPPED. Use ?test=true to force a test scan." });
    }

    const activePositions = await fetchActivePositions();
    if (activePositions.length >= config.max_positions && !isTestRun) {
      return NextResponse.json({ message: "Max positions reached. Waiting for trades to close." });
    }

    // 1. Fetch Top Weather Markets
    const rawMarkets = await fetchGammaMarkets(30, '24h', true);
    
    let scannedCount = 0;
    const allSignals = [];

    for (const m of rawMarkets) {
      const question = String(m.question || "");
      const tids = Array.isArray(m.clobTokenIds) ? m.clobTokenIds : (typeof m.clobTokenIds === 'string' ? JSON.parse(m.clobTokenIds) : []);
      if (!tids.length) continue;

      const isAlreadyIn = activePositions.some(p => p.market_id === m.conditionId);
      if (isAlreadyIn) continue;

      const weatherTarget = parseWeatherTarget(question);

      // 2. Fetch required data concurrently
      const [news, weatherReport, orderbook, priceHistory] = await Promise.all([
        fetchNewsForMarket(question),
        weatherTarget.city ? fetchLiveCityWeather(weatherTarget.city) : Promise.resolve(null),
        fetchOrderbook(tids[0]),
        fetchPriceHistory(tids[0])
      ]);
      
      // 3. Generate AI Signal
      const signal = generateSignal(
        question,
        priceHistory,
        orderbook,
        Number(m.volume24hr || 0),
        news,
        weatherReport
      );

      scannedCount++;
      allSignals.push({ market: question, signal });

      // Jika kita mode Test Run, jangan execute trade. Cukup kumpulkan sinyal.
      if (isTestRun) continue;

      // 4. Execute (hanya jika RUNNING normal)
      if (signal.confidence >= config.min_confidence && (signal.action.includes("STRONG BUY") || signal.action === "BUY YES")) {
        const side = signal.action.includes("NO") ? "SELL" : "BUY";
        const curPrice = priceHistory[priceHistory.length - 1] || 0.5;
        
        let sizeUsdc = 10;
        if (config.mode === 'live') {
          const multiplier = signal.confidence >= 90 ? 1.5 : (signal.confidence >= 80 ? 1.2 : 1.0);
          const balance = 100; 
          sizeUsdc = (balance * (config.trade_size_pct / 100)) * multiplier;
        }

        let execStatus = 'OPEN';
        const tradeId = tids[0]; 

        if (config.mode === 'live') {
          const res = await placeLimitOrder(tradeId, side, curPrice, sizeUsdc / curPrice);
          if (!res.success) {
            console.error("Order failed:", res.error);
            execStatus = 'FAILED';
          }
        }

        if (execStatus === 'OPEN') {
          await logTrade({
            market_id: m.conditionId,
            question: question,
            action: signal.action,
            side: side,
            entry_price: curPrice,
            current_price: curPrice,
            size_usdc: sizeUsdc,
            pnl: 0,
            status: 'OPEN',
            mode: config.mode
          });

          return NextResponse.json({ 
            message: `Trade executed: ${signal.action} on ${question}`,
            trade: { market: question, action: signal.action, confidence: signal.confidence }
          });
        }
      }
    }

    if (isTestRun) {
      allSignals.sort((a, b) => b.signal.confidence - a.signal.confidence);
      return NextResponse.json({ 
        message: `Test scan complete. Analyzed ${scannedCount} weather markets.`,
        top_signals: allSignals.slice(0, 5)
      });
    }

    return NextResponse.json({ message: `Scan complete (${scannedCount} markets). No high-confidence signals met threshold (${config.min_confidence}%).` });
  } catch (error) {
    console.error("Cron Error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
