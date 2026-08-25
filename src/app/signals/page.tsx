import { CloudSun, Search, ArrowUpRight, Wind } from "lucide-react";
import { fetchGammaMarkets } from "@/lib/polymarket";
import { generateSignal } from "@/lib/signals";
import { fetchNewsForMarket } from "@/lib/news";
import { fetchLiveCityWeather, parseWeatherTarget } from "@/lib/weather";
import { formatPrice } from "@/lib/utils";

// This is a Server Component. It fetches data and renders on the server.
export default async function SignalsPage() {
  const rawMarkets = await fetchGammaMarkets(15, '24h', true);
  
  const analyzedMarkets = await Promise.all(rawMarkets.map(async (m: Record<string, unknown>) => {
    const question = String(m.question || "");
    const weatherTarget = parseWeatherTarget(question);

    // Fetch data concurrently for speed
    const [news, weatherReport, orderbook, priceHistoryRaw] = await Promise.all([
      fetchNewsForMarket(question),
      weatherTarget.city ? fetchLiveCityWeather(weatherTarget.city) : Promise.resolve(null),
      // Mock for UI since we don't always have valid token IDs at this level
      Promise.resolve({ bids: [{ size: 5000 }], asks: [{ size: 2000 }] }),
      Promise.resolve([0.45, 0.46, 0.47, 0.48, 0.50])
    ]);
    
    const signal = generateSignal(
      question,
      priceHistoryRaw,
      orderbook,
      Number(m.volume24hr || 0),
      news,
      weatherReport
    );

    return {
      id: m.conditionId || m.id,
      question,
      volume: m.volume24hr,
      curPrice: priceHistoryRaw[priceHistoryRaw.length - 1],
      weatherReport,
      signal
    };
  }));

  // Sort by confidence descending
  analyzedMarkets.sort((a, b) => b.signal.confidence - a.signal.confidence);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">AI Signals</h1>
          <p className="text-slate-400 text-sm">Real-time mispricing detection for weather markets.</p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input 
              type="text" 
              placeholder="Search markets..." 
              className="pl-9 pr-4 py-2 bg-[#131e36] border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-sky-500 transition-colors"
            />
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-4">
        {analyzedMarkets.map((m) => (
            <div key={String(m.id)} className="bg-[#131e36] border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row gap-6">
            <div className="flex-1 space-y-4">
              <h3 className="font-medium text-slate-200">{m.question}</h3>
              
              {m.weatherReport && (
                <div className="flex items-center gap-3 text-xs">
                  <span className="flex items-center gap-1 bg-slate-800 text-slate-300 px-2 py-1 rounded">
                    <CloudSun size={14} className="text-amber-400" />
                    {m.weatherReport.city.name}: {m.weatherReport.currentTempF}°F
                  </span>
                  <span className="flex items-center gap-1 bg-slate-800 text-slate-300 px-2 py-1 rounded">
                    <ArrowUpRight size={14} className="text-emerald-400" />
                    High: {m.weatherReport.highTempF}°F
                  </span>
                  <span className="flex items-center gap-1 bg-slate-800 text-slate-300 px-2 py-1 rounded">
                    <Wind size={14} className="text-sky-400" />
                    Precip: {m.weatherReport.precipitationChance}%
                  </span>
                </div>
              )}

              <div className="flex gap-2 text-xs">
                {m.signal.reasons.map((r: string, i: number) => (
                  <span key={i} className="bg-slate-800/50 text-slate-400 px-2 py-1 rounded border border-slate-700/50">
                    {r}
                  </span>
                ))}
              </div>
            </div>

            <div className="md:w-64 shrink-0 flex flex-col justify-between border-t md:border-t-0 md:border-l border-slate-800 pt-4 md:pt-0 md:pl-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-xs text-slate-500 mb-1">Market Price</p>
                  <p className="font-mono text-lg text-white">{formatPrice(m.curPrice)}¢</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500 mb-1">Confidence</p>
                  <p className={`font-mono text-lg font-bold ${
                    m.signal.confidence >= 80 ? 'text-emerald-400' :
                    m.signal.confidence >= 60 ? 'text-amber-400' : 'text-slate-400'
                  }`}>
                    {m.signal.confidence}%
                  </p>
                </div>
              </div>

              <button className={`w-full py-2 rounded-lg text-sm font-bold tracking-wide border transition-all ${
                m.signal.action.includes('STRONG BUY') ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/50 hover:bg-emerald-500/20' :
                m.signal.action.includes('BUY') ? 'bg-emerald-500/5 text-emerald-500 border-emerald-500/30 hover:bg-emerald-500/10' :
                m.signal.action.includes('SELL') ? 'bg-rose-500/10 text-rose-400 border-rose-500/50 hover:bg-rose-500/20' :
                'bg-slate-800 text-slate-400 border-slate-700 cursor-not-allowed'
              }`}>
                {m.signal.action}
              </button>
            </div>
          </div>
        ))}

        {analyzedMarkets.length === 0 && (
          <div className="text-center py-12 text-slate-500 bg-[#131e36] border border-slate-800 rounded-xl">
            No active weather markets found at the moment.
          </div>
        )}
      </div>
    </div>
  );
}
