"use client";

import Script from "next/script";
import Link from "next/link";
import { motion } from "framer-motion";
import { Poppins } from "next/font/google";
import { MouseEvent, useEffect, useState } from "react";
import DesktopNav from "@/components/DesktopNav";
import MobileNav from "@/components/MobileNav";
import "../home.css";
import "./application.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["600"],
});

export default function ApplicationPage() {
  const [consent, setConsent] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const [viewportWidth, setViewportWidth] = useState(0);
  const [mobileInfoOpen, setMobileInfoOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    setMounted(true);

    (window as any).onTurnstileSuccess = (token: string) => {
      setTurnstileToken(token);
    };

    return () => {
      delete (window as any).onTurnstileSuccess;
    };
  }, []);

  useEffect(() => {
    const updateViewport = () => setViewportWidth(window.innerWidth);
    updateViewport();
    window.addEventListener("resize", updateViewport);
    return () => window.removeEventListener("resize", updateViewport);
  }, []);

  const isMobile = viewportWidth > 0 ? viewportWidth <= 767 : false;
  const isReady = viewportWidth > 0;

  const onRightClick = () => {
    if (isMobile) return;
    setExpanded(true);
  };

  const onLeftClick = (e: MouseEvent<HTMLDivElement>) => {
    if (isMobile) return;
    if ((e.target as HTMLElement).closest("a, button")) return;
    setExpanded(false);
  };

  if (!isReady) {
    return (
      <main
        className={poppins.className}
        style={{ background: "#fff", minHeight: "100vh" }}
      />
    );
  }

  return (
    <main
      className={`${poppins.className} applicationPage ${
        expanded ? "is-expanded" : ""
      }`}
    >
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js"
        strategy="afterInteractive"
      />

      {!isMobile && (
        <DesktopNav
          activePage="application"
          expanded={expanded}
          onClick={onLeftClick}
        />
      )}

      {isMobile && (
        <MobileNav
          activePage="application"
          mobileInfoOpen={mobileInfoOpen}
          onToggleMobileInfo={() => setMobileInfoOpen((prev) => !prev)}
        />
      )}

      <motion.div
        className="applicationRight"
        initial={false}
        animate={
          isMobile
            ? { left: "0vw", width: "100vw" }
            : {
                left: expanded ? "30vw" : "50vw",
                width: expanded ? "70vw" : "50vw",
              }
        }
        transition={{ duration: 0.55, ease: [0.65, 0, 0.35, 1] }}
        onClick={onRightClick}
        style={{
          height: "100vh",
          overflowY: "auto",
          WebkitOverflowScrolling: "touch",
        }}
      >
<div className="applicationWrap">
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
          `✅ Sent! Your request ID is ${
            data?.id || "—"
          }. You will receive a copy by email.`
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
    <input
      type="hidden"
      name="turnstileToken"
      value={turnstileToken ?? ""}
    />

    <section className="applicationFieldRow applicationIntroRow">
      <h2
        className="applicationFieldTitle applicationFieldTitleGhost text-xl"
        aria-hidden="true"
      >
        <span className="applicationFieldTitleText">Terminanfrage</span>
      </h2>

      <div className="applicationFieldInput applicationIntroContent">
        <header>
          <h1 className="applicationTitle">Terminanfrage</h1>
        </header>

        <p>
        Sehr geehrte Damen und Herren,
nutzen Sie für Anfragen gerne unser Online-Briefingformular.
        </p>
        <p>
        Alternativ können Sie hier unser Briefingformular als beschreibbare pdf Datei runterladen und uns per Email zusenden. 
        Wir melden uns schnellstmöglich bei Ihnen zurück.
        </p>

      </div>
    </section>

<section className="applicationFieldRow">
  <h2 className="applicationFieldTitle text-xl">
    <span className="applicationFieldNumber">1</span>
    <span className="applicationFieldTitleText">
      Name und Kontaktdaten *
    </span>
  </h2>
  <label className="applicationFieldInput space-y-1">
    <textarea
      className="w-full border rounded-md p-2 min-h-24"
      name="contactBlock"
      placeholder={"Max Mustermann\n+49 123 456789\nmail@example.com"}
      required
    />
  </label>
</section>

<section className="applicationFieldRow">
  <h2 className="applicationFieldTitle text-xl">
    <span className="applicationFieldNumber">2</span>
    <span className="applicationFieldTitleText">
      Verbindliche Rechnungsanschrift *
    </span>
  </h2>
  <label className="applicationFieldInput space-y-1">
    <textarea
      className="w-full border rounded-md p-2 min-h-24"
      name="billingAddress"
      required
    />
  </label>
</section>

<section className="applicationFieldRow">
  <h2 className="applicationFieldTitle text-xl">
    <span className="applicationFieldNumber">3</span>
    <span className="applicationFieldTitleText">Kategorie</span>
  </h2>
  <div className="applicationFieldInput flex flex-col gap-3">
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

<section className="applicationFieldRow">
  <h2 className="applicationFieldTitle text-xl">
    <span className="applicationFieldNumber">4</span>
    <span className="applicationFieldTitleText">
      Thema / Beschreibung *
    </span>
  </h2>
  <label className="applicationFieldInput space-y-1">
    <textarea
      className="w-full border rounded-md p-2 min-h-28"
      name="topicDescription"
    />
  </label>
</section>

<section className="applicationFieldRow">
  <h2 className="applicationFieldTitle text-xl">
    <span className="applicationFieldNumber">5</span>
    <span className="applicationFieldTitleText">Datum</span>
  </h2>
  <label className="applicationFieldInput space-y-1">
    <input
      className="w-full border rounded-md p-2"
      name="date"
      placeholder="TT.MM.JJJJ"
    />
  </label>
</section>

<section className="applicationFieldRow">
  <h2 className="applicationFieldTitle text-xl">
    <span className="applicationFieldNumber">6</span>
    <span className="applicationFieldTitleText">
      Uhrzeit Einsatzzeiten
    </span>
  </h2>
  <label className="applicationFieldInput space-y-1">
    <input
      className="w-full border rounded-md p-2"
      name="assignmentTimes"
      placeholder="09:00–14:00"
    />
  </label>
</section>

<section className="applicationFieldRow">
  <h2 className="applicationFieldTitle text-xl">
    <span className="applicationFieldNumber">7</span>
    <span className="applicationFieldTitleText">
      Uhrzeit Start der Veranstaltung
    </span>
  </h2>
  <label className="applicationFieldInput space-y-1">
    <input
      className="w-full border rounded-md p-2"
      name="eventStartTime"
      placeholder="HH:MM"
    />
  </label>
</section>

<section className="applicationFieldRow">
  <h2 className="applicationFieldTitle text-xl">
    <span className="applicationFieldNumber">8</span>
    <span className="applicationFieldTitleText">Adresse / Ort *</span>
  </h2>
  <label className="applicationFieldInput space-y-1">
    <textarea
      className="w-full border rounded-md p-2 min-h-24"
      name="address"
      placeholder={"Musterstraße 1\n12345 Musterstadt"}
      required
    />
  </label>
</section>

<section className="applicationFieldRow">
  <h2 className="applicationFieldTitle text-xl">
    <span className="applicationFieldNumber">9</span>
    <span className="applicationFieldTitleText">Bildanzahl</span>
  </h2>
  <label className="applicationFieldInput space-y-1">
    <input
      className="w-full border rounded-md p-2"
      name="imageCount"
      type="number"
      min={0}
    />
  </label>
</section>

<section className="applicationFieldRow">
  <h2 className="applicationFieldTitle text-xl">
    <span className="applicationFieldNumber">10</span>
    <span className="applicationFieldTitleText">Lieferdatum</span>
  </h2>
  <label className="applicationFieldInput space-y-1">
    <input
      className="w-full border rounded-md p-2"
      name="deliveryDate"
      placeholder="TT.MM.JJJJ"
    />
  </label>
</section>

<section className="applicationFieldRow">
  <h2 className="applicationFieldTitle text-xl">
    <span className="applicationFieldNumber">11</span>
    <span className="applicationFieldTitleText">Leitweg-ID</span>
  </h2>
  <label className="applicationFieldInput space-y-1">
    <input
      className="w-full border rounded-md p-2"
      name="leitwegId"
    />
  </label>
</section>

<section className="applicationFieldRow">
  <h2 className="applicationFieldTitle text-xl">
    <span className="applicationFieldNumber">12</span>
    <span className="applicationFieldTitleText">
      Bewirtschafternummer / Referenz
    </span>
  </h2>
  <label className="applicationFieldInput space-y-1">
    <textarea
      className="w-full border rounded-md p-2 min-h-24"
      name="referenceNotes"
    />
  </label>
</section>

<section className="applicationFieldRow">
  <h2 className="applicationFieldTitle text-xl">
    <span className="applicationFieldTitleText">Anmerkungen</span>
  </h2>
  <label className="applicationFieldInput space-y-1">
    <textarea
      className="w-full border rounded-md p-2 min-h-24"
      name="notes"
    />
  </label>
</section>

<section className="applicationFieldRow applicationActionRow">
  <h2
    className="applicationFieldTitle applicationFieldTitleGhost text-xl"
    aria-hidden="true"
  >
    <span className="applicationFieldTitleText">Anmerkungen</span>
  </h2>

  <div className="applicationActionContent space-y-3 pt-6">
    <span className="text-sm">
      Bitte beachten Sie: Alle mit * gekennzeichneten Felder sind
      Pflichtfelder.
    </span>

    <label className="applicationConsentLabel flex items-start gap-3">
      <input
        type="checkbox"
        name="consent"
        className="mt-1"
        checked={consent}
        onChange={(e) => setConsent(e.target.checked)}
        required
      />
      <span className="text-sm">Ja, Terminanfrage absenden</span>
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

  </div>
</section>
          </form>
        </div>
      </motion.div>
    </main>
  );
}