import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  const cookieStore = await cookies(); // 👈 await it!
  cookieStore.delete("reemind_user");
  return NextResponse.json({ success: true });
}
