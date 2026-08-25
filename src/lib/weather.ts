export interface CityCoordinate {
  name: string;
  slug: string;
  aliases: string[];
  lat: number;
  lon: number;
  country: string;
  timezone: string;
}

export const SUPPORTED_CITIES: CityCoordinate[] = [
  { name: "New York City (Central Park)", slug: "nyc", aliases: ["nyc", "new york", "central park", "manhattan"], lat: 40.7829, lon: -73.9654, country: "USA", timezone: "America/New_York" },
  { name: "Chicago", slug: "chicago", aliases: ["chicago", "ohare", "o'hare", "midway"], lat: 41.8781, lon: -87.6298, country: "USA", timezone: "America/Chicago" },
  { name: "London", slug: "london", aliases: ["london", "heathrow"], lat: 51.5074, lon: -0.1278, country: "UK", timezone: "Europe/London" },
  { name: "Phoenix", slug: "phoenix", aliases: ["phoenix", "sky harbor"], lat: 33.4484, lon: -112.0740, country: "USA", timezone: "America/Phoenix" },
  { name: "Miami", slug: "miami", aliases: ["miami", "south florida", "florida"], lat: 25.7617, lon: -80.1918, country: "USA", timezone: "America/New_York" },
  { name: "Los Angeles", slug: "la", aliases: ["los angeles", "la", "dtla", "lax"], lat: 34.0522, lon: -118.2437, country: "USA", timezone: "America/Los_Angeles" },
  { name: "Las Vegas", slug: "las-vegas", aliases: ["las vegas", "vegas"], lat: 36.1699, lon: -115.1398, country: "USA", timezone: "America/Los_Angeles" },
  { name: "Tokyo", slug: "tokyo", aliases: ["tokyo", "haneda", "narita"], lat: 35.6762, lon: 139.6503, country: "Japan", timezone: "Asia/Tokyo" },
  { name: "Paris", slug: "paris", aliases: ["paris", "cdg"], lat: 48.8566, lon: 2.3522, country: "France", timezone: "Europe/Paris" },
  { name: "Seoul", slug: "seoul", aliases: ["seoul", "incheon"], lat: 37.5665, lon: 126.9780, country: "South Korea", timezone: "Asia/Seoul" },
  { name: "Atlanta", slug: "atlanta", aliases: ["atlanta", "hartsfield"], lat: 33.7490, lon: -84.3880, country: "USA", timezone: "America/New_York" },
  { name: "Dallas", slug: "dallas", aliases: ["dallas", "dfw", "fort worth"], lat: 32.7767, lon: -96.7970, country: "USA", timezone: "America/Chicago" },
  { name: "Seattle", slug: "seattle", aliases: ["seattle", "seatac"], lat: 47.6062, lon: -122.3321, country: "USA", timezone: "America/Los_Angeles" },
  { name: "Denver", slug: "denver", aliases: ["denver"], lat: 39.7392, lon: -104.9903, country: "USA", timezone: "America/Denver" },
  { name: "Houston", slug: "houston", aliases: ["houston", "bush"], lat: 29.7604, lon: -95.3698, country: "USA", timezone: "America/Chicago" },
  { name: "Boston", slug: "boston", aliases: ["boston", "logan"], lat: 42.3601, lon: -71.0589, country: "USA", timezone: "America/New_York" },
];

export interface LiveWeatherReport {
  city: CityCoordinate;
  currentTempF: number;
  currentTempC: number;
  highTempF: number;
  lowTempF: number;
  precipitationChance: number;
  weatherCode: number;
  weatherDescription: string;
  hourlyForecast: Array<{ time: string; tempF: number; precipProb: number }>;
}

export function findCityInQuestion(question: string): CityCoordinate | null {
  const q = question.toLowerCase();
  for (const city of SUPPORTED_CITIES) {
    if (city.aliases.some(alias => new RegExp(`\\b${alias}\\b`, 'i').test(q))) {
      return city;
    }
  }
  return null;
}

export function parseWeatherTarget(question: string): {
  city: CityCoordinate | null;
  targetTempF?: number;
  comparison?: 'above' | 'below' | 'reach' | 'exact';
  weatherType: 'temperature' | 'snow' | 'rain' | 'hurricane' | 'climate' | 'general';
} {
  const city = findCityInQuestion(question);
  const q = question.toLowerCase();

  let weatherType: 'temperature' | 'snow' | 'rain' | 'hurricane' | 'climate' | 'general' = 'general';
  if (q.includes('hurricane') || q.includes('storm') || q.includes('cyclone') || q.includes('typhoon') || q.includes('tornado')) {
    weatherType = 'hurricane';
  } else if (q.includes('snow') || q.includes('blizzard') || q.includes('flurries') || q.includes('ice')) {
    weatherType = 'snow';
  } else if (q.includes('rain') || q.includes('precipitation') || q.includes('rainfall') || q.includes('flood')) {
    weatherType = 'rain';
  } else if (q.includes('hottest') || q.includes('warmest') || q.includes('record') || q.includes('noaa') || q.includes('climate') || q.includes('anomaly')) {
    weatherType = 'climate';
  } else if (q.includes('temp') || q.includes('°f') || q.includes('°c') || q.includes('degrees') || q.includes('reach') || q.includes('heat') || q.includes('cold')) {
    weatherType = 'temperature';
  }

  const tempMatch = question.match(/(\d{1,3}(?:\.\d+)?)\s*(?:°\s*[fF]|degrees\s*(?:fahrenheit|[fF])?|deg\s*[fF]?|[fF]\b)/i)
    || question.match(/(?:reach|hit|exceed|above|over|under|below)\s*(\d{1,3}(?:\.\d+)?)/i);

  let targetTempF: number | undefined = undefined;
  if (tempMatch && tempMatch[1]) {
    targetTempF = parseFloat(tempMatch[1]);
  }

  let comparison: 'above' | 'below' | 'reach' | 'exact' = 'reach';
  if (q.includes('above') || q.includes('over') || q.includes('exceed') || q.includes('higher') || q.includes('at least') || q.includes('or more')) {
    comparison = 'above';
  } else if (q.includes('below') || q.includes('under') || q.includes('less than') || q.includes('lower') || q.includes('at most')) {
    comparison = 'below';
  }

  return {
    city,
    targetTempF,
    comparison,
    weatherType
  };
}

export function getWeatherConditionDescription(code: number): string {
  if (code === 0) return "Clear Sky ☀️";
  if (code === 1 || code === 2) return "Mainly Clear / Partly Cloudy ⛅";
  if (code === 3) return "Overcast ☁️";
  if (code >= 45 && code <= 48) return "Foggy 🌫️";
  if (code >= 51 && code <= 55) return "Drizzle 🌦️";
  if (code >= 61 && code <= 65) return "Rain 🌧️";
  if (code >= 71 && code <= 77) return "Snowfall ❄️";
  if (code >= 80 && code <= 82) return "Rain Showers 🌧️";
  if (code >= 85 && code <= 86) return "Snow Showers 🌨️";
  if (code >= 95 && code <= 99) return "Thunderstorm / Severe ⛈️";
  return "Variable Weather 🌡️";
}

export async function fetchLiveCityWeather(city: CityCoordinate): Promise<LiveWeatherReport | null> {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current=temperature_2m,relative_humidity_2m,precipitation,weather_code&hourly=temperature_2m,precipitation_probability,weather_code&temperature_unit=fahrenheit&forecast_days=3&timezone=${encodeURIComponent(city.timezone)}`;
    
    const res = await fetch(url, { next: { revalidate: 300 } });
    if (!res.ok) return null;
    const data = await res.json();

    const current = data.current || {};
    const hourly = data.hourly || { time: [], temperature_2m: [], precipitation_probability: [] };

    const todayTemps = (hourly.temperature_2m || []).slice(0, 24).map(Number);
    const highTempF = todayTemps.length ? Math.max(...todayTemps) : Number(current.temperature_2m || 70);
    const lowTempF = todayTemps.length ? Math.min(...todayTemps) : Number(current.temperature_2m || 50);

    const currentTempF = Number(current.temperature_2m || 70);
    const currentTempC = Math.round(((currentTempF - 32) * 5) / 9 * 10) / 10;
    const weatherCode = Number(current.weather_code || 0);

    const hourlyList = (hourly.time || []).slice(0, 12).map((t: string, i: number) => ({
      time: t.split("T")[1]?.slice(0, 5) || t,
      tempF: Math.round(Number(hourly.temperature_2m?.[i] || currentTempF)),
      precipProb: Number(hourly.precipitation_probability?.[i] || 0)
    }));

    const maxPrecip = (hourly.precipitation_probability || []).slice(0, 24).reduce((max: number, p: number) => Math.max(max, Number(p || 0)), 0);

    return {
      city,
      currentTempF: Math.round(currentTempF * 10) / 10,
      currentTempC,
      highTempF: Math.round(highTempF * 10) / 10,
      lowTempF: Math.round(lowTempF * 10) / 10,
      precipitationChance: maxPrecip,
      weatherCode,
      weatherDescription: getWeatherConditionDescription(weatherCode),
      hourlyForecast: hourlyList
    };
  } catch (e) {
    console.error(`Error fetching weather for ${city.name}:`, e);
    return null;
  }
}

export function evaluateWeatherEdge(
  question: string,
  marketYesPrice: number,
  weatherReport: LiveWeatherReport | null
): {
  meteorologyProbability: number;
  impliedProbability: number;
  edgePct: number;
  verdict: 'STRONG_BUY_YES' | 'BUY_YES' | 'FAIR' | 'BUY_NO' | 'STRONG_BUY_NO';
  explanation: string;
} {
  const target = parseWeatherTarget(question);
  const implied = Math.round(marketYesPrice * 100);

  if (!weatherReport || target.targetTempF === undefined) {
    return {
      meteorologyProbability: 50,
      impliedProbability: implied,
      edgePct: 0,
      verdict: 'FAIR',
      explanation: 'Menunggu data spesifik stasiun meteorologi.'
    };
  }

  const { highTempF } = weatherReport;
  const targetF = target.targetTempF;
  let modelProb = 50;

  if (target.comparison === 'above' || target.comparison === 'reach') {
    if (highTempF >= targetF + 4) modelProb = 92;
    else if (highTempF >= targetF + 1.5) modelProb = 80;
    else if (highTempF >= targetF - 1.5) modelProb = 55;
    else if (highTempF >= targetF - 4) modelProb = 25;
    else modelProb = 8;
  } else if (target.comparison === 'below') {
    if (highTempF <= targetF - 4) modelProb = 92;
    else if (highTempF <= targetF - 1.5) modelProb = 80;
    else if (highTempF <= targetF + 1.5) modelProb = 50;
    else modelProb = 15;
  }

  const edge = modelProb - implied;
  let verdict: 'STRONG_BUY_YES' | 'BUY_YES' | 'FAIR' | 'BUY_NO' | 'STRONG_BUY_NO' = 'FAIR';

  if (edge >= 20) verdict = 'STRONG_BUY_YES';
  else if (edge >= 10) verdict = 'BUY_YES';
  else if (edge <= -20) verdict = 'STRONG_BUY_NO';
  else if (edge <= -10) verdict = 'BUY_NO';

  const explanation = `Ramalan Max: ${highTempF}°F | Target: ${targetF}°F | Model: ${modelProb}% vs Market: ${implied}% (Edge: ${edge > 0 ? '+' : ''}${edge}%)`;

  return {
    meteorologyProbability: modelProb,
    impliedProbability: implied,
    edgePct: edge,
    verdict,
    explanation
  };
}
