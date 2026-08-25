import { scoreNewsSentiment, type NewsItem } from "./news";
import { type LiveWeatherReport, evaluateWeatherEdge } from "./weather";

export function calcRSI(prices: number[], period = 14) {
  if (prices.length < period + 1) return 50;
  let gains = 0, losses = 0;
  for (let i = 1; i <= period; i++) {
    const diff = prices[i] - prices[i - 1];
    if (diff > 0) gains += diff;
    else losses -= diff;
  }
  let avgGain = gains / period;
  let avgLoss = losses / period;
  for (let i = period + 1; i < prices.length; i++) {
    const diff = prices[i] - prices[i - 1];
    avgGain = (avgGain * (period - 1) + (diff > 0 ? diff : 0)) / period;
    avgLoss = (avgLoss * (period - 1) + (diff < 0 ? -diff : 0)) / period;
  }
  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return 100 - (100 / (1 + rs));
}

export function calcBollingerBands(prices: number[], period = 14, stdDev = 2) {
  if (prices.length < period) return { upper: 1, mid: 0.5, lower: 0 };
  const slice = prices.slice(-period);
  const mid = slice.reduce((a, b) => a + b, 0) / period;
  const variance = slice.reduce((a, b) => a + Math.pow(b - mid, 2), 0) / period;
  const sd = Math.sqrt(variance);
  return {
    upper: Math.min(0.99, mid + (sd * stdDev)),
    mid,
    lower: Math.max(0.01, mid - (sd * stdDev))
  };
}

export function calcEMA(prices: number[], period: number) {
  if (prices.length < period) return prices[prices.length - 1] || 0.5;
  const k = 2 / (period + 1);
  let ema = prices[0];
  for (let i = 1; i < prices.length; i++) {
    ema = (prices[i] * k) + (ema * (1 - k));
  }
  return ema;
}

export function generateSignal(
  question: string,
  priceHistory: number[],
  orderbook: Record<string, unknown>,
  volume24h: number,
  newsItems: NewsItem[],
  weatherReport: LiveWeatherReport | null
) {
  const cur = priceHistory.length > 0 ? priceHistory[priceHistory.length - 1] : 0.5;
  
  if (priceHistory.length < 5) {
    return { action: "NEUTRAL", confidence: 50, reasons: ["Data historis CLOB belum mencukupi."], metrics: {} };
  }

  let bullishPoints = 0;
  let bearishPoints = 0;
  let maxPoints = 0;
  const reasons: string[] = [];
  let alignedPillars = 0;

  // 1. Weather Edge (Bobot Utama)
  const weatherEval = evaluateWeatherEdge(question, cur, weatherReport);
  const wWeather = 4.0;
  maxPoints += wWeather;

  if (weatherEval.verdict === 'STRONG_BUY_YES' || weatherEval.verdict === 'BUY_YES') {
    bullishPoints += wWeather;
    alignedPillars++;
    reasons.push(`Weather Edge: ${weatherEval.explanation}`);
  } else if (weatherEval.verdict === 'STRONG_BUY_NO' || weatherEval.verdict === 'BUY_NO') {
    bearishPoints += wWeather;
    alignedPillars++;
    reasons.push(`Weather Edge: ${weatherEval.explanation}`);
  } else {
    reasons.push(`Weather: ${weatherEval.explanation}`);
  }

  // 2. Orderbook Imbalance
  const bids = Array.isArray(orderbook?.bids) ? orderbook.bids : [];
  const asks = Array.isArray(orderbook?.asks) ? orderbook.asks : [];
  const bidVol = bids.slice(0, 10).reduce((s: number, b: Record<string, unknown>) => s + Number(b?.size || 0), 0);
  const askVol = asks.slice(0, 10).reduce((s: number, b: Record<string, unknown>) => s + Number(b?.size || 0), 0);
  const totalOB = bidVol + askVol;
  
  const wOB = 2.5;
  maxPoints += wOB;
  
  if (totalOB > 0) {
    const obImbalance = (bidVol - askVol) / totalOB;
    if (obImbalance > 0.3) {
      bullishPoints += wOB;
      alignedPillars++;
      reasons.push(`CLOB Imbalance: +${(obImbalance * 100).toFixed(0)}% Bids (Buy Pressure).`);
    } else if (obImbalance < -0.3) {
      bearishPoints += wOB;
      alignedPillars++;
      reasons.push(`CLOB Imbalance: ${(Math.abs(obImbalance) * 100).toFixed(0)}% Asks (Sell Pressure).`);
    }
  }

  // 3. News Sentiment
  const news = scoreNewsSentiment(newsItems);
  const wNews = 2.0;
  maxPoints += wNews;

  if (news.score > 0.25) {
    bullishPoints += wNews;
    alignedPillars++;
    reasons.push(`News Sentiment: Bullish (${news.catalyst})`);
  } else if (news.score < -0.25) {
    bearishPoints += wNews;
    alignedPillars++;
    reasons.push(`News Sentiment: Bearish (${news.catalyst})`);
  }

  // 4. Trend (EMA & RSI)
  const wTrend = 1.5;
  maxPoints += wTrend;
  
  const emaFast = calcEMA(priceHistory, 5);
  const emaSlow = calcEMA(priceHistory, 14);
  const rsi = calcRSI(priceHistory, 14);

  if (emaFast > emaSlow && rsi < 65) {
    bullishPoints += wTrend;
    alignedPillars++;
    reasons.push(`Trend: Uptrend (EMA5 > EMA14) & RSI ${rsi.toFixed(0)}`);
  } else if (emaFast < emaSlow && rsi > 35) {
    bearishPoints += wTrend;
    alignedPillars++;
    reasons.push(`Trend: Downtrend (EMA5 < EMA14) & RSI ${rsi.toFixed(0)}`);
  }

  const net = (bullishPoints - bearishPoints) / Math.max(maxPoints, 1.0);
  let confidence = 50 + Math.abs(net) * 45;
  if (alignedPillars >= 3) confidence = Math.max(confidence, 85);
  confidence = Math.min(98, Math.max(0, Math.round(confidence)));

  let action = "NEUTRAL";
  if (net >= 0.4 && alignedPillars >= 2) action = alignedPillars >= 3 ? "STRONG BUY YES" : "BUY YES";
  else if (net <= -0.4 && alignedPillars >= 2) action = alignedPillars >= 3 ? "STRONG BUY NO" : "BUY NO";
  else if (net >= 0.2) action = "BUY YES";
  else if (net <= -0.2) action = "BUY NO";

  return {
    action,
    confidence,
    reasons,
    metrics: {
      weatherEdgePct: weatherEval.edgePct,
      modelProb: weatherEval.meteorologyProbability,
      impliedProb: weatherEval.impliedProbability,
      rsi: Math.round(rsi)
    }
  };
}
