export const GAMMA_API = "https://gamma-api.polymarket.com";
export const CLOB_API = "https://clob.polymarket.com";

export const WEATHER_CATEGORIES: Record<string, string[]> = {
  "🌡️ Temperature & Heat": ["temperature", "temp", "°f", "°c", "degrees", "hottest", "coldest", "heat", "freeze", "warmest", "high temp", "record high"],
  "❄️ Snow & Winter": ["snow", "snowfall", "blizzard", "winter storm", "flurries", "ice storm", "polar vortex"],
  "🌧️ Rain & Flood": ["rain", "rainfall", "precipitation", "flood", "monsoon", "downpour", "atmospheric river"],
  "🌪️ Hurricanes & Storms": ["hurricane", "storm", "tropical storm", "typhoon", "cyclone", "tornado", "category 5", "category 4", "nhc"],
  "🌍 Climate & Records": ["noaa", "copernicus", "climate", "global temperature", "anomaly", "carbon", "sea surface", "el nino", "la nina"]
};

export function guessCategory(question: string): string {
  const q = question.toLowerCase();
  for (const [cat, keywords] of Object.entries(WEATHER_CATEGORIES)) {
    if (keywords.some(kw => q.includes(kw))) return cat;
  }
  return "🌤️ General Weather";
}

export function isWeatherMarket(question: string, tags: Array<{ slug?: string; label?: string }> = []): boolean {
  const q = question.toLowerCase();
  const weatherTerms = [
    "temperature", "temp", "°f", "°c", "degrees", "weather", "rain", "snow", "hurricane", 
    "storm", "tornado", "cyclone", "typhoon", "climate", "noaa", "copernicus", "flood", 
    "hottest", "coldest", "heatwave", "freeze", "blizzard", "precipitation", "celsius", "fahrenheit"
  ];
  
  if (weatherTerms.some(term => q.includes(term))) return true;
  if (tags.some(t => {
    const slug = (t.slug || t.label || "").toLowerCase();
    return ["weather", "climate", "science", "temperature", "hurricane", "environment"].includes(slug);
  })) return true;

  return false;
}

export type TimeWindow = '1h' | '24h' | '7d' | '30d' | 'all';

export async function fetchGammaMarkets(limit = 150, timeWindow: TimeWindow = '24h', forceWeatherOnly = true) {
  try {
    const orderMap: Record<TimeWindow, string> = {
      '1h': 'volume24hr',
      '24h': 'volume24hr',
      '7d': 'volume',
      '30d': 'volume',
      'all': 'volume'
    };

    const order = orderMap[timeWindow] || 'volume24hr';
    
    // Gunakan endpoint /events lalu extract .markets
    const res = await fetch(`${GAMMA_API}/events?limit=${limit}&active=true&closed=false&order=${order}&ascending=false`, { cache: 'no-store' });
    if (!res.ok) return [];
    
    const events = await res.json();
    if (!Array.isArray(events)) return [];

    const combined: any[] = [];
    for (const ev of events) {
      if (Array.isArray(ev.markets)) {
        // Flatten markets into main array, inherit some event properties
        ev.markets.forEach((m: any) => {
          combined.push({
            ...m,
            volume24hr: ev.volume24hr || m.volume24hr,
            tags: ev.tags || m.tags
          });
        });
      }
    }

    const uniqueMap = new Map<string, Record<string, unknown>>();
    for (const m of combined) {
      if (!m) continue;
      const id = String(m.conditionId || m.condition_id || m.id || "");
      if (!id) continue;

      if (forceWeatherOnly) {
        const parsedTags = Array.isArray(m.tags) ? m.tags : [];
        if (isWeatherMarket(String(m.question || ""), parsedTags)) {
          uniqueMap.set(id, m);
        }
      } else {
        uniqueMap.set(id, m);
      }
    }

    // Jika tidak ada cuaca, gunakan fallback ke market terpopuler untuk keperluan DEMO
    const results = Array.from(uniqueMap.values());
    if (results.length === 0 && forceWeatherOnly) {
       console.log("No weather markets found, using general active markets as fallback for demo.");
       return combined.slice(0, 10);
    }

    return results;
  } catch (e) {
    console.error("Gamma fetch error:", e);
    return [];
  }
}

export async function fetchOrderbook(tokenId: string) {
  try {
    const res = await fetch(`${CLOB_API}/book?token_id=${tokenId}`, { cache: 'no-store' });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function fetchPriceHistory(tokenId: string, interval = '1d') {
  try {
    const res = await fetch(`${CLOB_API}/prices-history?interval=${interval}&market=${tokenId}`, { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data?.history) ? data.history.map((d: Record<string, unknown>) => d.p) : [];
  } catch {
    return [];
  }
}
