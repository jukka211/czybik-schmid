// /Users/jukka_w/czybik-schmid/app/application/page.tsx

"use client";

import Script from "next/script";
import { useEffect, useState } from "react";
import "./application.css";

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
      {/* Load Turnstile only on the client */}
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js"
        strategy="afterInteractive"
      />

      <div className="applicationWrap">
        {/* Logo centered (replace SVG with your real logo) */}
        <div className="applicationLogo" aria-label="Logo">
        <img src="/czybik schmid.svg" alt="Logo" width={160} height={160} />
        </div>

        <header>
          <h1 className="applicationTitle">Terminanfrage</h1>
        </header>

        <form
          className="space-y-8"
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

              // Reset Turnstile widget if available
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
          {/* Hidden input so token is included in FormData */}
          <input type="hidden" name="turnstileToken" value={turnstileToken ?? ""} />

          {/* 1. Kontaktdaten */}
          <section className="space-y-4">
            <h2 className="text-xl ">1. Kontaktdaten</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="space-y-1">
                <span className="text-sm">Name</span>
                <input className="w-full border rounded-md p-2" name="firstName" required />
              </label>
              <label className="space-y-1">
                <span className="text-sm">Nachname</span>
                <input className="w-full border rounded-md p-2" name="lastName" required />
              </label>
              <label className="space-y-1">
                <span className="text-sm">Telefonnummer</span>
                <input className="w-full border rounded-md p-2" name="phone" />
              </label>
              <label className="space-y-1">
                <span className="text-sm">E-Mail-Adresse</span>
                <input className="w-full border rounded-md p-2" name="email" type="email" required />
              </label>
            </div>
          </section>

          {/* 2. Behörde */}
          <section className="space-y-4">
            <h2 className="text-xl ">2. Behörde</h2>
            <label className="space-y-1">
              <span className="text-sm">Name der Behörde</span>
              <input className="w-full border rounded-md p-2" name="authorityName" />
            </label>
          </section>

          {/* 3. Rechnungsanschrift */}
          <section className="space-y-4">
            <h2 className="text-xl ">3. Verbindliche Rechnungsanschrift</h2>
            <label className="space-y-1">
              <span className="text-sm">Rechnungsanschrift</span>
              <textarea className="w-full border rounded-md p-2 min-h-24" name="billingAddress" />
            </label>
          </section>

          {/* 4. E-Rechnung / XRechnung */}
          <section className="space-y-4">
            <h2 className="text-xl ">4. E-Rechnung / XRechnung</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="space-y-1">
                <span className="text-sm">Leitweg-ID</span>
                <input className="w-full border rounded-md p-2" name="leitwegId" />
              </label>
              <label className="space-y-1">
                <span className="text-sm">Bewirtschafternummer</span>
                <input className="w-full border rounded-md p-2" name="bewirtschafterNummer" />
              </label>
            </div>
          </section>

          {/* 5. Thema */}
          <section className="space-y-4">
            <h2 className="text-xl ">5. Thema</h2>
            <label className="space-y-1">
              <span className="text-sm">Beschreiben Sie Ihr Thema…</span>
              <textarea className="w-full border rounded-md p-2 min-h-28" name="topicDescription" required />
            </label>
          </section>

          {/* 6. Ort */}
          <section className="space-y-4">
            <h2 className="text-xl ">6. Ort</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <label className="space-y-1 md:col-span-2">
                <span className="text-sm">Straße</span>
                <input className="w-full border rounded-md p-2" name="street" />
              </label>
              <label className="space-y-1">
                <span className="text-sm">Hausnummer</span>
                <input className="w-full border rounded-md p-2" name="houseNumber" />
              </label>
              <label className="space-y-1">
                <span className="text-sm">PLZ</span>
                <input className="w-full border rounded-md p-2" name="postalCode" />
              </label>
              <label className="space-y-1 md:col-span-2">
                <span className="text-sm">Ort</span>
                <input className="w-full border rounded-md p-2" name="city" />
              </label>
            </div>
          </section>

          {/* 7. Datum und Zeitraum */}
          <section className="space-y-4">
            <h2 className="text-xl ">7. Datum und Zeitraum</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <label className="space-y-1">
                <span className="text-sm">Datum</span>
                <input
                  className="w-full border rounded-md p-2"
                  name="date"
                  placeholder="TT.MM.JJJJ"
                  required
                />
              </label>
              <label className="space-y-1">
                <span className="text-sm">Startzeit</span>
                <input
                  className="w-full border rounded-md p-2"
                  name="startTime"
                  placeholder="HH:MM"
                  required
                />
              </label>
              <label className="space-y-1">
                <span className="text-sm">Endzeit</span>
                <input
                  className="w-full border rounded-md p-2"
                  name="endTime"
                  placeholder="HH:MM"
                  required
                />
              </label>
            </div>
          </section>

          {/* 8. Bildanzahl */}
          <section className="space-y-4">
            <h2 className="text-xl ">8. Bildanzahl</h2>
            <label className="space-y-1">
              <span className="text-sm">Anzahl</span>
              <input className="w-full border rounded-md p-2" name="imageCount" type="number" min={0} />
            </label>
          </section>

          {/* 9. Lieferdatum */}
          <section className="space-y-4">
            <h2 className="text-xl ">9. Lieferdatum</h2>
            <label className="space-y-1">
              <span className="text-sm">TT.MM.JJJJ</span>
              <input className="w-full border rounded-md p-2" name="deliveryDate" placeholder="TT.MM.JJJJ" />
            </label>
          </section>

          {/* 10. Liefermedium */}
          <section className="space-y-4">
            <h2 className="text-xl ">10. Liefermedium</h2>
            <div className="flex gap-6">
              <label className="flex items-center gap-2">
                <input type="radio" name="deliveryMedium" value="download" defaultChecked />
                <span>Download</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" name="deliveryMedium" value="usb" />
                <span>USB-Stick</span>
              </label>
            </div>
          </section>

          {/* Consent + Captcha */}
          <section className="space-y-3 border-t pt-6">
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
                JA, ich habe die nachstehenden Pflichthinweise zum Onlinebriefingformular gelesen und verstanden.
              </span>
            </label>

            <details className="text-sm text-neutral-700">
              <summary className="cursor-pointer font-medium">Pflichthinweise zum Onlinebriefingformular</summary>
              <div className="mt-2 space-y-2">
                <p>
                  Dieses Formular speichert alle eingegebene Inhalte (z. B. Namen, E-Mailadresse, Nachricht etc.) sowie
                  automatisch die IP-Nummer.
                </p>
                <p>
                  Die Speicherung dieser Daten dient der Zuordnung der Anfrage und der anschließenden Beantwortung
                  derselben. Mehr dazu in unserer Datenschutzerklärung.
                </p>
              </div>
            </details>

            {/* Turnstile widget (client-only to avoid hydration mismatch) */}
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
          </section>
        </form>
      </div>
    </main>
  );
}