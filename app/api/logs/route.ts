// app/api/logs/route.ts
import { NextResponse } from "next/server";
import { getServerLogs, clearServerLogs } from "../../lib/serverLogStore";

export async function GET() {
  try {
    const logs = await getServerLogs();
    // Ensure plain JSON (serializable) even if Redis returns typed values
    const safe = JSON.parse(JSON.stringify(logs));
    return NextResponse.json(safe, { status: 200 });
  } catch (err: any) {
    console.error("❌ Failed to fetch logs:", err);
    return NextResponse.json({ error: err?.message || "Failed to fetch logs" }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    await clearServerLogs();
    return NextResponse.json({ message: "Logs cleared" }, { status: 200 });
  } catch (err: any) {
    console.error("❌ Failed to clear logs:", err);
    return NextResponse.json({ error: err?.message || "Failed to clear logs" }, { status: 500 });
  }
}
