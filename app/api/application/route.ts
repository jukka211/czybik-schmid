// /Users/jukka_w/czybik-schmid/app/api/application/route.ts

import { sanityWriteClient } from "@/sanity/lib/sanity.server";
import { Resend } from "resend";
import { ratelimit } from "@/sanity/lib/ratelimit";

const resend = new Resend(process.env.RESEND_API_KEY);

type ApplicationBody = {
  contactBlock?: string;
  billingAddress?: string;
  category?: string;
  topicDescription?: string;
  date?: string;
  assignmentTimes?: string;
  eventStartTime?: string;
  address?: string;
  imageCount?: string | number;
  deliveryDate?: string;
  leitwegId?: string;
  referenceNotes?: string;
  notes?: string;
  consent?: boolean;
  turnstileToken?: string;
};

async function verifyTurnstile(token: string, ip?: string) {
  const secret = process.env.TURNSTILE_SECRET_KEY;

  if (!secret) {
    throw new Error("Missing TURNSTILE_SECRET_KEY");
  }

  const form = new FormData();
  form.append("secret", secret);
  form.append("response", token);
  if (ip) form.append("remoteip", ip);

  const resp = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      method: "POST",
      body: form,
    }
  );

  if (!resp.ok) {
    throw new Error(`Turnstile verification failed with status ${resp.status}`);
  }

  return (await resp.json()) as {
    success: boolean;
    "error-codes"?: string[];
  };
}

function formatCategory(value: unknown) {
  const s = String(value || "");
  if (s === "event_foto") return "Event Foto";
  if (s === "event_foto_video") return "Event Foto + Video";
  if (s === "portrait") return "Porträt";
  return s;
}

function clean(value: unknown) {
  return String(value || "").trim();
}

function formatText(body: ApplicationBody) {
  return [
    `1. Name und Kontaktdaten`,
    clean(body.contactBlock),
    ``,
    `2. Verbindliche Rechnungsanschrift`,
    clean(body.billingAddress),
    ``,
    `3. Kategorie`,
    formatCategory(body.category),
    ``,
    `4. Thema / Beschreibung`,
    clean(body.topicDescription),
    ``,
    `5. Datum`,
    clean(body.date),
    ``,
    `6. Uhrzeit Einsatzzeiten`,
    clean(body.assignmentTimes),
    ``,
    `7. Uhrzeit Start der Veranstaltung`,
    clean(body.eventStartTime),
    ``,
    `8. Adresse / Ort`,
    clean(body.address),
    ``,
    `9. Bildanzahl`,
    clean(body.imageCount),
    ``,
    `10. Lieferdatum`,
    clean(body.deliveryDate),
    ``,
    `11. Leitweg-ID`,
    clean(body.leitwegId),
    ``,
    `12. Bewirtschafternummer / Referenz`,
    clean(body.referenceNotes),
    ``,
    `Anmerkungen`,
    clean(body.notes),
    ``,
    `Zustimmung: ${body.consent ? "JA" : "NEIN"}`,
  ].join("\n");
}

function extractEmail(contactBlock?: string) {
  const text = String(contactBlock || "");
  const match = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  return match?.[0] || null;
}

export async function POST(req: Request) {
  const origin = req.headers.get("origin") || "";
  const allowedList = (process.env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  if (allowedList.length && origin && !allowedList.includes(origin)) {
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

  const body = (await req.json().catch(() => null)) as ApplicationBody | null;

  if (!body) {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const token = clean(body.turnstileToken);
  if (!token) {
    return Response.json({ error: "Captcha required" }, { status: 400 });
  }

  const verify = await verifyTurnstile(
    token,
    ip === "unknown" ? undefined : ip
  );

  if (!verify.success) {
    return Response.json(
      {
        error: "Captcha failed",
        details: verify["error-codes"] || [],
      },
      { status: 400 }
    );
  }

  if (!body.consent) {
    return Response.json({ error: "Consent is required" }, { status: 400 });
  }

  try {
    const doc = await sanityWriteClient.create({
      _type: "applicationRequest",
      contactBlock: clean(body.contactBlock),
      billingAddress: clean(body.billingAddress),
      category: clean(body.category),
      topicDescription: clean(body.topicDescription),
      date: clean(body.date),
      assignmentTimes: clean(body.assignmentTimes),
      eventStartTime: clean(body.eventStartTime),
      address: clean(body.address),
      imageCount: body.imageCount ? Number(body.imageCount) : undefined,
      deliveryDate: clean(body.deliveryDate),
      leitwegId: clean(body.leitwegId),
      referenceNotes: clean(body.referenceNotes),
      notes: clean(body.notes),
      consent: Boolean(body.consent),
      createdAt: new Date().toISOString(),
    });

    const from = process.env.RESEND_FROM_EMAIL;
    const owner = process.env.RESEND_OWNER_EMAIL;

    if (!process.env.RESEND_API_KEY) {
      throw new Error("Missing RESEND_API_KEY");
    }
    if (!from) {
      throw new Error("Missing RESEND_FROM_EMAIL");
    }
    if (!owner) {
      throw new Error("Missing RESEND_OWNER_EMAIL");
    }

    const text = formatText(body);
    const subject = `Neue Terminanfrage${
      clean(body.category) ? ` – ${formatCategory(body.category)}` : ""
    }`;

    const replyTo = extractEmail(body.contactBlock);

    await resend.emails.send({
      from,
      to: owner,
      subject,
      text,
      replyTo: replyTo || undefined,
    });

    return Response.json({ ok: true, id: doc._id }, { status: 200 });
  } catch (err: any) {
    console.error("API /api/application error:", err);
    return Response.json(
      { error: err?.message || "Failed to process submission" },
      { status: 500 }
    );
  }
}