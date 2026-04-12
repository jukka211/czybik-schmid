import { createChallenge } from "altcha-lib";
import { NextResponse } from "next/server";

export async function GET() {
  const hmacKey = process.env.ALTCHA_HMAC_KEY;
  if (!hmacKey) {
    return NextResponse.json({ error: "Missing HMAC key" }, { status: 500 });
  }

  const challenge = await createChallenge({
    hmacKey,
    maxNumber: 100_000,
  });

  return NextResponse.json(challenge);
}