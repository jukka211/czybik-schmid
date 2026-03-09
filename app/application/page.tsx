// /Users/jukka_w/czybik-schmid/app/application/page.tsx

"use client";

import Script from "next/script";
import { useEffect, useState } from "react";
import "./application.css";
import Link from "next/link";

export default function ApplicationPage() {
  const [consent, setConsent] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);

    (window as any).onTurnstileSuccess = (token: string) => {
      setTurnstileToken(token);
    };

    return () => {
      delete (window as any).onTurnstileSuccess;
    };
  }, []);

  return (
    <main className="applicationPage">
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js"
        strategy="afterInteractive"
      />

      <div className="applicationWrap">
        <div className="applicationLogo" aria-label="Logo">
          <img src="/czybik schmid.svg" alt="Logo" width={90} height={90} />
        </div>

        <header>
          <h1 className="applicationTitle">Terminanfrage</h1>
        </header>

        <form
          className="space-y-12"
          onSubmit={async (e) => {
            e.preventDefault();
            setMessage(null);
            setSubmitting(true);

            const form = e.currentTarget;
            const fd = new FormData(form);

            const raw = Object.fromEntries(fd.entries());

            const payload = {
              ...raw,
              consent: Boolean(fd.get("consent")),
              turnstileToken: String(fd.get("turnstileToken") || ""),
            };

            try {
              const res = await fetch("/api/application", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
              });

              const data = await res.json().catch(() => null);

              if (!res.ok) {
                throw new Error(data?.error || "Something went wrong");
              }

              setMessage(
                `✅ Sent! Your request ID is ${data?.id || "—"}. You will receive a copy by email.`
              );

              form.reset();
              setConsent(false);
              setTurnstileToken(null);

              try {
                (window as any).turnstile?.reset?.();
              } catch {}
            } catch (err: any) {
              setMessage(`❌ ${err.message || "Submit failed"}`);
            } finally {
              setSubmitting(false);
            }
          }}
        >
          <input type="hidden" name="turnstileToken" value={turnstileToken ?? ""} />

          {/* 1. Name und Kontaktdaten (ONE field) */}
          <section className="space-y-2">
            <h2 className="text-xl">1. Name und Kontaktdaten *</h2>
            <label className="space-y-1">
              <textarea
                className="w-full border rounded-md p-2 min-h-24"
                name="contactBlock"
                placeholder={"Max Mustermann\n+49 123 456789\nmail@example.com"}
                required
              />
            </label>
          </section>

          {/* 2. Verbindliche Rechnungsanschrift (ONE field) */}
          <section className="space-y-2">
            <h2 className="text-xl">2. Verbindliche Rechnungsanschrift *</h2>
            <label className="space-y-1">

              <textarea
                className="w-full border rounded-md p-2 min-h-24"
                name="billingAddress"
                required
              />
            </label>
          </section>

          {/* 3. Kategorie (radio) */}
          <section className="space-y-2">
            <h2 className="text-xl">3. Kategorie</h2>
            <div className="flex flex-col gap-3">
              <label className="flex items-center gap-2">
                <input type="radio" name="category" value="event_foto" />
                <span>Event Foto</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" name="category" value="event_foto_video" />
                <span>Event Foto + Video</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" name="category" value="portrait" />
                <span>Porträt</span>
              </label>
            </div>
          </section>

          {/* 4. Thema / Beschreibung (ONE field) */}
          <section className="space-y-2">
            <h2 className="text-xl">4. Thema / Beschreibung *</h2>
            <label className="space-y-1">
              <textarea
                className="w-full border rounded-md p-2 min-h-28"
                name="topicDescription"
                
              />
            </label>
          </section>

          {/* 5. Datum (ONE field) */}
          <section className="space-y-2">
            <h2 className="text-xl">5. Datum</h2>
            <label className="space-y-1">
              <input
                className="w-full border rounded-md p-2"
                name="date"
                placeholder="TT.MM.JJJJ"
              />
            </label>
          </section>

          {/* 6. Uhrzeit Einsatzzeiten (ONE field) */}
          <section className="space-y-2">
            <h2 className="text-xl">6. Uhrzeit Einsatzzeiten</h2>
            <label className="space-y-1">
              <input
                className="w-full border rounded-md p-2"
                name="assignmentTimes"
                placeholder="09:00–14:00"
              />
            </label>
          </section>

          {/* 7. Uhrzeit Start der Veranstaltung (ONE field) */}
          <section className="space-y-2">
            <h2 className="text-xl">7. Uhrzeit Start der Veranstaltung</h2>
            <label className="space-y-1">
              <input
                className="w-full border rounded-md p-2"
                name="eventStartTime"
                placeholder="HH:MM"
              />
            </label>
          </section>

          {/* 8. Adresse / Ort (ONE field) */}
          <section className="space-y-2">
            <h2 className="text-xl">8. Adresse / Ort *</h2>
            <label className="space-y-1">
              <textarea
                className="w-full border rounded-md p-2 min-h-24"
                name="address"
                placeholder={"Musterstraße 1\n12345 Musterstadt"}
                required
              />
            </label>
          </section>

          {/* 9. Bildanzahl (ONE field) */}
          <section className="space-y-2">
            <h2 className="text-xl">9. Bildanzahl</h2>
            <label className="space-y-1">
              <input
                className="w-full border rounded-md p-2"
                name="imageCount"
                type="number"
                min={0}
              />
            </label>
          </section>

          {/* 10. Lieferdatum (ONE field) */}
          <section className="space-y-2">
            <h2 className="text-xl">10. Lieferdatum</h2>
            <label className="space-y-1">
              <input
                className="w-full border rounded-md p-2"
                name="deliveryDate"
                placeholder="TT.MM.JJJJ"
              />
            </label>
          </section>

          {/* 11. Leitweg-ID (ONE field) */}
          <section className="space-y-2">
            <h2 className="text-xl">11. Leitweg-ID</h2>
            <label className="space-y-1">
              <input className="w-full border rounded-md p-2" name="leitwegId" />
            </label>
          </section>

          {/* 12. Bewirtschafternummer / Referenz (ONE field) */}
          <section className="space-y-2">
            <h2 className="text-xl">12. Bewirtschafternummer / Referenz</h2>
            <label className="space-y-1">
              <textarea
                className="w-full border rounded-md p-2 min-h-24"
                name="referenceNumber"
              />
            </label>
          </section>

          {/* Anmerkungen (ONE field) */}
          <section className="space-y-1">
            <h2 className="text-xl">Anmerkungen</h2>
            <label className="space-y-1">
              <textarea
                className="w-full border rounded-md p-2 min-h-24"
                name="notes"
              />
            </label>
          </section>

          {/* Consent + Captcha */}
          <section className="space-y-3 pt-6">
          <span className="text-sm">
          Bitte beachten Sie: Alle mit * gekennzeichneten Felder sind Pflichtfelder.
              </span>
            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                name="consent"
                className="mt-1"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                required
              />
              <span className="text-sm">
              Ja, Terminanfrage absenden
              </span>
            </label>



            {mounted && (
              <div
                className="cf-turnstile"
                data-sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
                data-callback="onTurnstileSuccess"
                data-theme="light"
                data-language="de"
              />
            )}

            {message && <p className="text-sm">{message}</p>}

            <button
              type="submit"
              className="px-4 py-2 rounded-md bg-black text-white disabled:opacity-40"
              disabled={!consent || submitting || !turnstileToken}
            >
              {submitting ? "Sending..." : "Terminanfrage absenden"}
            </button>

            <Link href="/datenschutz" className="underline">
              Datenschutzerklärung & Impressum
            </Link>

          </section>
        </form>
      </div>
    </main>
  );
}
