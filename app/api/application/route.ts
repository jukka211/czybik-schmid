// /Users/jukka_w/czybik-schmid/app/api/application/route.ts

import { sanityWriteClient } from "@/sanity/lib/sanity.server";
import { Resend } from "resend";
import { ratelimit } from "@/sanity/lib/ratelimit";

const resend = new Resend(process.env.RESEND_API_KEY);

async function verifyTurnstile(token: string, ip?: string) {
  const secret = process.env.TURNSTILE_SECRET_KEY!;
  const form = new FormData();
  form.append("secret", secret);
  form.append("response", token);
  if (ip) form.append("remoteip", ip);

  const resp = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    { method: "POST", body: form }
  );

  return (await resp.json()) as { success: boolean; "error-codes"?: string[] };
}

function formatText(body: any) {
  return [
    `Kontaktdaten`,
    `Name: ${(body.firstName || "").trim()} ${(body.lastName || "").trim()}`.trim(),
    `Telefon: ${body.phone || ""}`,
    `E-Mail: ${body.email || ""}`,
    ``,
    `Behörde: ${body.authorityName || ""}`,
    ``,
    `Rechnungsanschrift:`,
    `${body.billingAddress || ""}`,
    ``,
    `E-Rechnung / XRechnung:`,
    `Leitweg-ID: ${body.leitwegId || ""}`,
    `Bewirtschafternummer: ${body.bewirtschafterNummer || ""}`,
    ``,
    `Thema:`,
    `${body.topicDescription || ""}`,
    ``,
    `Ort: ${body.street || ""} ${body.houseNumber || ""}, ${body.postalCode || ""} ${body.city || ""}`.trim(),
    ``,
    `Datum/Zeitraum: ${body.date || ""} ${body.startTime || ""}-${body.endTime || ""}`.trim(),
    `Bildanzahl: ${body.imageCount || ""}`,
    `Lieferdatum: ${body.deliveryDate || ""}`,
    `Liefermedium: ${body.deliveryMedium || ""}`,
    ``,
    `Zustimmung: ${body.consent ? "JA" : "NEIN"}`,
  ].join("\n");
}

export async function POST(req: Request) {
  const origin = req.headers.get("origin");
  const allowed = process.env.ALLOWED_ORIGIN || "";
  if (allowed && origin && origin !== allowed) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";

  const rl = await ratelimit.limit(`application:${ip}`);
  if (!rl.success) {
    return Response.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 }
    );
  }

  const body = await req.json().catch(() => null);

  // Captcha check (server-side)
  const token = String(body?.turnstileToken || "");
  if (!token) {
    return Response.json({ error: "Captcha required" }, { status: 400 });
  }
  const verify = await verifyTurnstile(token, ip === "unknown" ? undefined : ip);
  if (!verify.success) {
    return Response.json({ error: "Captcha failed" }, { status: 400 });
  }

  if (!body?.consent) {
    return Response.json({ error: "Consent is required" }, { status: 400 });
  }

  try {
    // 1) Save to Sanity
    const doc = await sanityWriteClient.create({
      _type: "applicationRequest",
      ...body,
      imageCount: body.imageCount ? Number(body.imageCount) : undefined,
      createdAt: new Date().toISOString(),
    });

    // 2) Send emails
    const from = process.env.RESEND_FROM_EMAIL!;
    const owner = process.env.RESEND_OWNER_EMAIL!;
    const text = formatText(body);
    const subject = `Neue Terminanfrage: ${body.firstName || ""} ${body.lastName || ""}`.trim();

    await resend.emails.send({
      from,
      to: owner,
      subject,
      text,
      replyTo: body.email ? String(body.email) : undefined,
    });

    if (body.email) {
      await resend.emails.send({
        from,
        to: String(body.email),
        subject: "Kopie Ihrer Terminanfrage",
        text: `Vielen Dank! Wir haben Ihre Anfrage erhalten.\n\n---\n${text}`,
      });
    }

    return Response.json({ ok: true, id: doc._id }, { status: 200 });
  } catch (err: any) {
    console.error("API /api/application error:", err);
    return Response.json(
      { error: err?.message || "Failed to process submission" },
      { status: 500 }
    );
  }
}