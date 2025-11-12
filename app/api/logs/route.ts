import { NextResponse } from "next/server";
import { getServerLogs, clearServerLogs } from "../../lib/serverLogStore";

export async function GET() {
  // Return all server-side logs
  return NextResponse.json(getServerLogs());
}

export async function DELETE() {
  // Clear all stored logs
  clearServerLogs();
  return NextResponse.json({ message: "Logs cleared" });
}
