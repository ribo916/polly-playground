import { NextResponse } from "next/server";
import { getTruncateFlag, setTruncateFlag } from "../../../lib/serverLogStore";

export async function GET() {
  const enabled = await getTruncateFlag();
  return NextResponse.json({ enabled });
}

export async function POST(req: Request) {
  try {
    const { enabled } = await req.json();
    await setTruncateFlag(Boolean(enabled));
    return NextResponse.json({ ok: true, enabled });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
