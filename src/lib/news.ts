const GOOGLE_NEWS_RSS = "https://news.google.com/rss/search?q=";
const RSS_TO_JSON = "https://api.rss2json.com/v1/api.json?rss_url=";

export interface NewsItem {
  title: string;
  pubDate: string;
  link: string;
  source: string;
}

export async function fetchNewsForMarket(question: string): Promise<NewsItem[]> {
  const keywords = extractKeywords(question);
  if (!keywords) return [];

  try {
    const encoded = encodeURIComponent(`${keywords} weather OR temperature OR NOAA OR "National Weather Service" OR storm OR hurricane OR climate`);
    const res = await fetch(`${RSS_TO_JSON}${encodeURIComponent(GOOGLE_NEWS_RSS + encoded)}&count=5`, {
      cache: 'no-store'
    });
    
    if (!res.ok) return [];
    const data = await res.json();
    
    if (data.items && Array.isArray(data.items)) {
      return data.items.slice(0, 5).map((item: Record<string, string>) => ({
        title: item.title,
        pubDate: item.pubDate,
        link: item.link,
        source: extractDomain(item.link) || 'News'
      }));
    }
    return [];
  } catch (e) {
    console.error("News fetch error:", e);
    return [];
  }
}

function extractDomain(url: string): string {
  try { return new URL(url).hostname.replace('www.', ''); }
  catch { return ''; }
}

function extractKeywords(question: string): string {
  const stopwords = new Set(["will","the","a","an","in","on","by","to","of","for","be","is","are","was","were","has","have","had","do","does","did","at","from","with","this","that","it","its","as","or","and","but","if","not","no","yes","before","after","than","more","most","what","when","where","who","how","which","each","every","all","any","few","much","many","some","other","new","old","first","last","next"]);
  const words = question
    .replace(/[?!.,;:'"()\[\]{}]/g, "")
    .split(/\s+/)
    .filter(w => w.length > 2 && !stopwords.has(w.toLowerCase()));
  return words.slice(0, 4).join(" ");
}

export function scoreNewsSentiment(news: NewsItem[]): { score: number; catalyst: string; newsCount: number } {
  if (!news.length) return { score: 0, catalyst: "Tidak ada buletin cuaca terbaru.", newsCount: 0 };

  let positiveHits = 0;
  let negativeHits = 0;
  const topCatalyst = news[0]?.title || "";

  const positiveWords = ["exceed", "record", "heatwave", "surge", "warm", "hottest", "intensify", "strengthen", "high", "confirm", "heavy rain", "blizzard warning", "warning", "landfall"];
  const negativeWords = ["cool", "drop", "weaken", "dissipate", "below", "miss", "cold", "cancel", "downgrade", "calm", "clear"];

  for (const item of news) {
    const title = (item.title || "").toLowerCase();
    for (const w of positiveWords) { if (title.includes(w)) positiveHits++; }
    for (const w of negativeWords) { if (title.includes(w)) negativeHits++; }
  }

  const total = positiveHits + negativeHits;
  let score = 0;
  if (total > 0) {
    score = (positiveHits - negativeHits) / total;
  }

  const newestDate = news[0]?.pubDate ? new Date(news[0].pubDate).getTime() : 0;
  const hoursAgo = newestDate ? (Date.now() - newestDate) / (1000 * 60 * 60) : 999;
  
  if (hoursAgo < 12) score *= 1.2;

  return {
    score: Math.max(-1, Math.min(1, score)),
    catalyst: total > 0 ? topCatalyst : "Berita netral / tidak ada kata kunci meteorologi.",
    newsCount: news.length
  };
}
