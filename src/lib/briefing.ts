import OpenAI from "openai";
import Parser from "rss-parser";

const TAIPEI_LAT = 25.033;
const TAIPEI_LON = 121.5654;
const STOCK_CODE = "0050";
const NEWS_FEED_URL = "https://www.ithome.com.tw/rss";
const NEWS_ITEM_LIMIT = 5;

// WMO weather codes used by Open-Meteo.
const WEATHER_CODE_MAP: Record<number, string> = {
  0: "晴朗",
  1: "大致晴朗",
  2: "多雲時晴",
  3: "陰天",
  45: "有霧",
  48: "霧淞",
  51: "毛毛雨（小）",
  53: "毛毛雨（中）",
  55: "毛毛雨（大）",
  61: "雨（小）",
  63: "雨（中）",
  65: "雨（大）",
  71: "雪（小）",
  73: "雪（中）",
  75: "雪（大）",
  80: "陣雨（小）",
  81: "陣雨（中）",
  82: "陣雨（大）",
  95: "雷雨",
  96: "雷雨夾冰雹",
  99: "強雷雨夾冰雹",
};

export type Weather = {
  location: string;
  currentTempC: number;
  todayMaxC: number;
  todayMinC: number;
  condition: string;
};

export type Stock = {
  code: string;
  name: string;
  date: string;
  closingPrice: string;
  change: string;
  openingPrice: string;
  highestPrice: string;
  lowestPrice: string;
};

export type NewsItem = {
  title: string;
  link: string;
  pubDate?: string;
};

export type Summary = {
  weatherSummary: string;
  stockSummary: string;
  newsSummary: string;
  encouragement: string;
};

export type Briefing = {
  date: string;
  weather: Weather;
  stock: Stock;
  news: NewsItem[];
  summary: Summary;
};

async function getWeather(): Promise<Weather> {
  const url =
    `https://api.open-meteo.com/v1/forecast` +
    `?latitude=${TAIPEI_LAT}&longitude=${TAIPEI_LON}` +
    `&current=temperature_2m,weather_code` +
    `&daily=temperature_2m_max,temperature_2m_min,weather_code` +
    `&timezone=Asia%2FTaipei`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Open-Meteo request failed: ${res.status}`);
  }
  const data = await res.json();

  const code: number = data.current.weather_code;

  return {
    location: "台北",
    currentTempC: data.current.temperature_2m,
    todayMaxC: data.daily.temperature_2m_max[0],
    todayMinC: data.daily.temperature_2m_min[0],
    condition: WEATHER_CODE_MAP[code] ?? `未知天氣代碼 (${code})`,
  };
}

// TWSE reports dates in the Minguo (ROC) calendar, e.g. "1150921" -> 2026-09-21.
function formatTwseDate(rocDate: string): string {
  const year = Number(rocDate.slice(0, rocDate.length - 4)) + 1911;
  const month = rocDate.slice(-4, -2);
  const day = rocDate.slice(-2);
  return `${year}-${month}-${day}`;
}

async function getStockPrice(): Promise<Stock> {
  const res = await fetch(
    "https://openapi.twse.com.tw/v1/exchangeReport/STOCK_DAY_ALL"
  );
  if (!res.ok) {
    throw new Error(`TWSE request failed: ${res.status}`);
  }
  const data: Array<Record<string, string>> = await res.json();
  const stock = data.find((row) => row.Code === STOCK_CODE);
  if (!stock) {
    throw new Error(`Stock code ${STOCK_CODE} not found in TWSE response`);
  }

  return {
    code: stock.Code,
    name: stock.Name,
    date: formatTwseDate(stock.Date),
    closingPrice: stock.ClosingPrice,
    change: stock.Change,
    openingPrice: stock.OpeningPrice,
    highestPrice: stock.HighestPrice,
    lowestPrice: stock.LowestPrice,
  };
}

async function getTechNews(): Promise<NewsItem[]> {
  const parser = new Parser();
  const feed = await parser.parseURL(NEWS_FEED_URL);

  return (feed.items ?? []).slice(0, NEWS_ITEM_LIMIT).map((item) => ({
    title: item.title ?? "",
    link: item.link ?? "",
    pubDate: item.pubDate,
  }));
}

async function generateAiSummary(
  weather: Weather,
  stock: Stock,
  news: NewsItem[]
): Promise<Summary> {
  const client = new OpenAI({ apiKey: process.env.OPEN_AI_API_KEY });

  const prompt = `你是一個每日簡報助理。請根據以下資料，用繁體中文產出一份精簡的每日摘要，並附上一句鼓勵的話。

天氣資料（${weather.location}）：
- 目前氣溫：${weather.currentTempC}°C
- 今日氣溫範圍：${weather.todayMinC}°C ~ ${weather.todayMaxC}°C
- 天氣狀況：${weather.condition}

0050 股價資料（資料日期：${stock.date}）：
- 收盤價：${stock.closingPrice}
- 漲跌：${stock.change}
- 開盤價：${stock.openingPrice}
- 最高價：${stock.highestPrice}
- 最低價：${stock.lowestPrice}

科技新聞標題：
${news.map((item, i) => `${i + 1}. ${item.title}`).join("\n")}

請回傳 JSON，格式如下，不要有其他文字：
{
  "weatherSummary": "一到兩句話的天氣摘要，可包含穿搭或出門建議",
  "stockSummary": "一到兩句話的 0050 股價摘要",
  "newsSummary": "把科技新聞整理成一段簡短摘要",
  "encouragement": "一句鼓勵人心的話"
}`;

  const completion = await client.chat.completions.create({
    model: "gpt-4o-mini",
    response_format: { type: "json_object" },
    messages: [{ role: "user", content: prompt }],
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) {
    throw new Error("OpenAI returned an empty response");
  }

  return JSON.parse(content) as Summary;
}

export async function getBriefing(): Promise<Briefing> {
  const [weather, stock, news] = await Promise.all([
    getWeather(),
    getStockPrice(),
    getTechNews(),
  ]);

  const summary = await generateAiSummary(weather, stock, news);

  return {
    date: new Date().toISOString().slice(0, 10),
    weather,
    stock,
    news,
    summary,
  };
}
