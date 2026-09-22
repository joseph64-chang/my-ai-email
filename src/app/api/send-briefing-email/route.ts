import { after } from "next/server";
import { Resend } from "resend";
import { getBriefing } from "@/lib/briefing";
import { renderBriefingEmailHtml } from "@/lib/briefing-email";
import { connectToDatabase } from "@/lib/mongodb";
import { BriefingLog } from "@/models/BriefingLog";

export const dynamic = "force-dynamic";
// Gives the background work (started via `after`) enough time to finish
// on serverless platforms, even though the response itself returns fast.
export const maxDuration = 60;

const FROM_EMAIL = "onboarding@resend.dev";
const TO_EMAIL = "mzhang327@gmail.com";

async function sendBriefingEmail() {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const briefing = await getBriefing();

  const { data, error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: TO_EMAIL,
    subject: `每日簡報 - ${briefing.date}`,
    html: renderBriefingEmailHtml(briefing),
  });

  if (error) {
    throw new Error(error.message);
  }

  await connectToDatabase();
  await BriefingLog.create({
    ...briefing,
    emailId: data?.id,
    sentTo: TO_EMAIL,
  });
}

export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Fetching data, calling OpenAI, sending the email, and writing to MongoDB
  // can together take longer than the cron caller's timeout, so respond
  // immediately and do the actual work after the response is sent.
  after(async () => {
    try {
      await sendBriefingEmail();
    } catch (error) {
      console.error("send-briefing-email error:", error);
    }
  });

  return Response.json({ success: true, message: "Briefing email queued" });
}
