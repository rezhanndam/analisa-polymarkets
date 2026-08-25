import { Search } from "lucide-react";
import { fetchGammaMarkets } from "@/lib/polymarket";
import { generateSignal } from "@/lib/signals";
import { fetchNewsForMarket } from "@/lib/news";
import { fetchLiveCityWeather, parseWeatherTarget } from "@/lib/weather";
import { SignalCard } from "@/components/SignalCard";
import { supabaseAdmin } from "@/lib/supabase";

export const revalidate = 0;

export default async function SignalsPage() {
  const rawMarkets = await fetchGammaMarkets(15, '24h', true);
  
  // Fetch bot config to pass down for default sizes & mode
  let config = null;
  try {
    const { data } = await supabaseAdmin.from('bot_config').select('*').eq('id', 1).single();
    config = data;
  } catch (e) {
    console.error(e);
  }
  
  const analyzedMarkets = await Promise.all(rawMarkets.map(async (m: Record<string, unknown>) => {
    const question = String(m.question || "");
    const weatherTarget = parseWeatherTarget(question);

    const [news, weatherReport, orderbook, priceHistoryRaw] = await Promise.all([
      fetchNewsForMarket(question),
      weatherTarget.city ? fetchLiveCityWeather(weatherTarget.city) : Promise.resolve(null),
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

  analyzedMarkets.sort((a, b) => b.signal.confidence - a.signal.confidence);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
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
          <SignalCard key={String(m.id)} market={m} config={config} />
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
