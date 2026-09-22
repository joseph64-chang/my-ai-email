import { getBriefing } from "@/lib/briefing";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const briefing = await getBriefing();
    return Response.json(briefing);
  } catch (error) {
    console.error("daily-briefing error:", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
