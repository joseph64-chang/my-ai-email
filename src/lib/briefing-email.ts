import type { Briefing } from "@/lib/briefing";

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function renderBriefingEmailHtml(briefing: Briefing): string {
  const { date, weather, stock, news, summary } = briefing;

  const newsListHtml = news
    .map(
      (item) => `
        <li style="margin-bottom: 8px;">
          <a href="${item.link}" style="color: #18181b; text-decoration: underline;">
            ${escapeHtml(item.title)}
          </a>
        </li>`
    )
    .join("");

  return `
  <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #27272a;">
    <p style="color: #71717a; font-size: 14px;">${date}</p>
    <h1 style="font-size: 22px; margin-bottom: 24px;">每日簡報</h1>

    <div style="background: #fafafa; border-radius: 12px; padding: 20px; margin-bottom: 16px;">
      <h2 style="font-size: 16px; margin: 0 0 8px;">鼓勵的話</h2>
      <p style="margin: 0;">${escapeHtml(summary.encouragement)}</p>
    </div>

    <div style="background: #fafafa; border-radius: 12px; padding: 20px; margin-bottom: 16px;">
      <h2 style="font-size: 16px; margin: 0 0 8px;">天氣（${escapeHtml(weather.location)}）</h2>
      <p style="margin: 0 0 8px;">${escapeHtml(summary.weatherSummary)}</p>
      <p style="margin: 0; font-size: 14px; color: #52525b;">
        目前 ${weather.currentTempC}°C ・ 今日 ${weather.todayMinC}°C ~ ${weather.todayMaxC}°C ・ ${escapeHtml(weather.condition)}
      </p>
    </div>

    <div style="background: #fafafa; border-radius: 12px; padding: 20px; margin-bottom: 16px;">
      <h2 style="font-size: 16px; margin: 0 0 8px;">${escapeHtml(stock.name)}（${stock.code}）</h2>
      <p style="margin: 0 0 8px;">${escapeHtml(summary.stockSummary)}</p>
      <p style="margin: 0; font-size: 14px; color: #52525b;">
        ${stock.date} ・ 收盤 ${stock.closingPrice} ・ 漲跌 ${stock.change} ・ 開盤 ${stock.openingPrice} ・ 最高 ${stock.highestPrice} ・ 最低 ${stock.lowestPrice}
      </p>
    </div>

    <div style="background: #fafafa; border-radius: 12px; padding: 20px;">
      <h2 style="font-size: 16px; margin: 0 0 8px;">科技新聞</h2>
      <p style="margin: 0 0 8px;">${escapeHtml(summary.newsSummary)}</p>
      <ul style="margin: 0; padding-left: 20px; font-size: 14px;">
        ${newsListHtml}
      </ul>
    </div>
  </div>`;
}
