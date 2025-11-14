import { NextResponse } from "next/server";
import { getTruncateFlag, setTruncateFlag } from "../../lib/serverLogStore";

export async function GET() {
  try {
    const flag = await getTruncateFlag();
    return NextResponse.json({ truncateEnabled: flag });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message ?? "Failed to load truncate setting" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    // UI SENDS truncateEnabled, not truncate
    const { truncateEnabled } = await request.json();
    const val = Boolean(truncateEnabled);

    await setTruncateFlag(val);

    return NextResponse.json({ truncateEnabled: val });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message ?? "Failed to save truncate setting" },
      { status: 500 }
    );
  }
}
