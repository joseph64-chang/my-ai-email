"use client";

import { useEffect, useState } from "react";

type Weather = {
  location: string;
  currentTempC: number;
  todayMaxC: number;
  todayMinC: number;
  condition: string;
};

type Stock = {
  code: string;
  name: string;
  date: string;
  closingPrice: string;
  change: string;
  openingPrice: string;
  highestPrice: string;
  lowestPrice: string;
};

type NewsItem = {
  title: string;
  link: string;
  pubDate?: string;
};

type Summary = {
  weatherSummary: string;
  stockSummary: string;
  newsSummary: string;
  encouragement: string;
};

type Briefing = {
  date: string;
  weather: Weather;
  stock: Stock;
  news: NewsItem[];
  summary: Summary;
};

export default function Home() {
  const [briefing, setBriefing] = useState<Briefing | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/daily-briefing")
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error ?? "取得每日簡報失敗");
        }
        setBriefing(data as Briefing);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "未知錯誤"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col flex-1 items-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex w-full max-w-3xl flex-col gap-8 px-6 py-16 sm:px-10">
        <h1 className="text-3xl font-semibold tracking-tight text-black dark:text-zinc-50">
          每日簡報
        </h1>

        {loading && (
          <p className="text-zinc-600 dark:text-zinc-400">載入中...</p>
        )}

        {error && (
          <p className="rounded-lg bg-red-50 px-4 py-3 text-red-700 dark:bg-red-950 dark:text-red-300">
            {error}
          </p>
        )}

        {briefing && (
          <div className="flex flex-col gap-6">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {briefing.date}
            </p>

            <section className="rounded-2xl bg-white p-6 shadow-sm dark:bg-zinc-900">
              <h2 className="text-lg font-semibold text-black dark:text-zinc-50">
                鼓勵的話
              </h2>
              <p className="mt-2 text-zinc-700 dark:text-zinc-300">
                {briefing.summary.encouragement}
              </p>
            </section>

            <section className="rounded-2xl bg-white p-6 shadow-sm dark:bg-zinc-900">
              <h2 className="text-lg font-semibold text-black dark:text-zinc-50">
                天氣（{briefing.weather.location}）
              </h2>
              <p className="mt-2 text-zinc-700 dark:text-zinc-300">
                {briefing.summary.weatherSummary}
              </p>
              <dl className="mt-4 grid grid-cols-3 gap-4 text-sm">
                <div>
                  <dt className="text-zinc-500 dark:text-zinc-400">目前氣溫</dt>
                  <dd className="text-black dark:text-zinc-50">
                    {briefing.weather.currentTempC}°C
                  </dd>
                </div>
                <div>
                  <dt className="text-zinc-500 dark:text-zinc-400">最高溫</dt>
                  <dd className="text-black dark:text-zinc-50">
                    {briefing.weather.todayMaxC}°C
                  </dd>
                </div>
                <div>
                  <dt className="text-zinc-500 dark:text-zinc-400">最低溫</dt>
                  <dd className="text-black dark:text-zinc-50">
                    {briefing.weather.todayMinC}°C
                  </dd>
                </div>
              </dl>
              <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                天氣狀況：{briefing.weather.condition}
              </p>
            </section>

            <section className="rounded-2xl bg-white p-6 shadow-sm dark:bg-zinc-900">
              <h2 className="text-lg font-semibold text-black dark:text-zinc-50">
                {briefing.stock.name}（{briefing.stock.code}）
              </h2>
              <p className="mt-2 text-zinc-700 dark:text-zinc-300">
                {briefing.summary.stockSummary}
              </p>
              <dl className="mt-4 grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
                <div>
                  <dt className="text-zinc-500 dark:text-zinc-400">日期</dt>
                  <dd className="text-black dark:text-zinc-50">
                    {briefing.stock.date}
                  </dd>
                </div>
                <div>
                  <dt className="text-zinc-500 dark:text-zinc-400">收盤價</dt>
                  <dd className="text-black dark:text-zinc-50">
                    {briefing.stock.closingPrice}
                  </dd>
                </div>
                <div>
                  <dt className="text-zinc-500 dark:text-zinc-400">漲跌</dt>
                  <dd className="text-black dark:text-zinc-50">
                    {briefing.stock.change}
                  </dd>
                </div>
                <div>
                  <dt className="text-zinc-500 dark:text-zinc-400">開盤價</dt>
                  <dd className="text-black dark:text-zinc-50">
                    {briefing.stock.openingPrice}
                  </dd>
                </div>
                <div>
                  <dt className="text-zinc-500 dark:text-zinc-400">最高價</dt>
                  <dd className="text-black dark:text-zinc-50">
                    {briefing.stock.highestPrice}
                  </dd>
                </div>
                <div>
                  <dt className="text-zinc-500 dark:text-zinc-400">最低價</dt>
                  <dd className="text-black dark:text-zinc-50">
                    {briefing.stock.lowestPrice}
                  </dd>
                </div>
              </dl>
            </section>

            <section className="rounded-2xl bg-white p-6 shadow-sm dark:bg-zinc-900">
              <h2 className="text-lg font-semibold text-black dark:text-zinc-50">
                科技新聞
              </h2>
              <p className="mt-2 text-zinc-700 dark:text-zinc-300">
                {briefing.summary.newsSummary}
              </p>
              <ul className="mt-4 flex flex-col gap-2">
                {briefing.news.map((item) => (
                  <li key={item.link}>
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-zinc-950 underline decoration-zinc-300 underline-offset-2 hover:decoration-zinc-950 dark:text-zinc-50 dark:decoration-zinc-700 dark:hover:decoration-zinc-50"
                    >
                      {item.title}
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
