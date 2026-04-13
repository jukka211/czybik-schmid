"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useState, useCallback, type MouseEventHandler } from "react";

type ActivePage = "home" | "about" | "application" | "datenschutz";

type DesktopNavProps = {
  activePage?: ActivePage;
  expanded: boolean;
  onClick?: MouseEventHandler<HTMLDivElement>;
};

export default function DesktopNav({
  activePage,
  expanded,
  onClick,
}: DesktopNavProps) {
  const [revealedEmail, setRevealedEmail] = useState(false);
  const [revealedPhone, setRevealedPhone] = useState(false);

  const handleEmailClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (!revealedEmail) {
        e.preventDefault();
        e.stopPropagation();
        setRevealedEmail(true);
      }
      // second click: default <a> behavior opens mailto
    },
    [revealedEmail],
  );

  const handlePhoneClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (!revealedPhone) {
        e.preventDefault();
        e.stopPropagation();
        setRevealedPhone(true);
      }
    },
    [revealedPhone],
  );

  return (
    <motion.div
      className="col-left"
      initial={false}
      animate={{ width: expanded ? "30vw" : "50vw" }}
      transition={{ duration: 0.55, ease: [0.65, 0, 0.35, 1] }}
      onClick={onClick}
    >
      <motion.div
        className="nav-top"
        initial={false}
        animate={{ opacity: 1, scale: 1, x: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        style={{
          pointerEvents: "auto",
          transformOrigin: "top right",
          width: "fit-content",
          marginLeft: "auto",
        }}
      >
        <div className="logo">
          <Link href="/">
            <img src="/CS-Logo.svg" alt="Logo" />
          </Link>
        </div>

        <nav>
          <Link
            href="/about"
            className={activePage === "about" ? "nav-active" : undefined}
          >
            Über uns
          </Link>
          <Link
            href="/application"
            className={activePage === "application" ? "nav-active" : undefined}
          >
            Terminanfrage
          </Link>
        </nav>

        <div className="nav-contact">
          <a href="mailto:redaktion@czybik-schmid-media.de" onClick={handleEmailClick}>
            {revealedEmail ? "redaktion@czybik-schmid-media.de" : "E-Mail"}
          </a>
          <a href="tel:+493081456619" onClick={handlePhoneClick}>
            {revealedPhone ? "+49-3081456619" : "Telefon"}
          </a>
        </div>
      </motion.div>

      <motion.div
        className="nav-footer"
        initial={false}
        animate={{ opacity: 1, scale: 1, x: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        style={{
          pointerEvents: "auto",
          transformOrigin: "bottom right",
          width: "fit-content",
          marginLeft: "auto",
        }}
      >
        <Link href="/datenschutz">Impressum<br />Datenschutz</Link>
        <span>© 2026</span>
      </motion.div>
    </motion.div>
  );
}