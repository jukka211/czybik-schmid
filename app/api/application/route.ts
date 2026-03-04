// /Users/jukka_w/czybik-schmid/app/api/application/route.ts

import { sanityWriteClient } from "@/sanity/lib/sanity.server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

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
  const body = await req.json().catch(() => null);

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

    // Send to owner (capture result)
    const ownerResult = await resend.emails.send({
      from,
      to: owner,
      subject,
      text,
      replyTo: body.email ? String(body.email) : undefined,
    });
    console.log("RESEND ownerResult:", ownerResult);

    // Send copy to applicant (capture result)
    let userResult: any = null;
    if (body.email) {
      userResult = await resend.emails.send({
        from,
        to: String(body.email),
        subject: "Kopie Ihrer Terminanfrage",
        text: `Vielen Dank! Wir haben Ihre Anfrage erhalten.\n\n---\n${text}`,
      });
      console.log("RESEND userResult:", userResult);
    }

    // Return results to inspect in Network tab
    return Response.json({ ok: true, id: doc._id }, { status: 200 });
  } catch (err: any) {
    console.error("API /api/application error:", err);
    return Response.json(
      { error: err?.message || "Failed to process submission" },
      { status: 500 }
    );
  }
}