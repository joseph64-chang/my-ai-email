import { connectToDatabase } from "@/lib/mongodb";
import { BriefingLog } from "@/models/BriefingLog";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await connectToDatabase();
    const latest = await BriefingLog.findOne().sort({ sentAt: -1 }).lean();

    if (!latest) {
      return Response.json({ error: "尚無寄信紀錄" }, { status: 404 });
    }

    return Response.json(latest);
  } catch (error) {
    console.error("latest-briefing error:", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
