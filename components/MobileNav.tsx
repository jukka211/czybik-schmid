"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";

type ActivePage = "home" | "about" | "application" | "datenschutz";
type ViewMode = "stack" | "grid";

type MobileNavProps = {
  activePage?: ActivePage;
  mobileInfoOpen: boolean;
  onToggleMobileInfo: () => void;
  showViewToggle?: boolean;
  viewMode?: ViewMode;
  onToggleViewMode?: () => void;
};

export default function MobileNav({
  activePage,
  mobileInfoOpen,
  onToggleMobileInfo,
  showViewToggle = false,
  viewMode = "stack",
  onToggleViewMode,
}: MobileNavProps) {
  return (
    <>
      <div className="mobile-topbar">
        <div className={`mobile-logo ${mobileInfoOpen ? "is-open" : ""}`}>
          <Link href="/">
            <img src="/CS-Logo.svg" alt="Logo" />
          </Link>
        </div>

        <button
          type="button"
          className="mobile-info-btn"
          onClick={onToggleMobileInfo}
        >
          {mobileInfoOpen ? "Close" : "Menü"}
        </button>
      </div>

      <AnimatePresence>
        {mobileInfoOpen && (
          <motion.div
            className="mobile-info-panel"
            initial={{ clipPath: "inset(0 0 100% 0)" }}
            animate={{ clipPath: "inset(0 0 0% 0)" }}
            exit={{ clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.45, ease: [0.65, 0, 0.35, 1] }}
          >
            <div className="mobile-info-inner">
              <nav className="mobile-info-nav">
                <Link
                  href="/about"
                  className={activePage === "about" ? "nav-active" : undefined}
                  onClick={() => mobileInfoOpen && onToggleMobileInfo()}
                >
                  Über uns
                </Link>
                <Link
                  href="/application"
                  className={activePage === "application" ? "nav-active" : undefined}
                  onClick={() => mobileInfoOpen && onToggleMobileInfo()}
                >
                  Terminanfrage
                </Link>
              </nav>

              <div className="mobile-info-contact">
                <a href="mailto:">E-Mail,</a>
                <a href="tel:">Telefon</a>
              </div>

              <div className="mobile-info-bottom">
                <div className="mobile-info-footer">
                <Link href="/datenschutz">Impressum<br />Datenschutz</Link>
                <span>© 2026</span>
                </div>

                {showViewToggle && onToggleViewMode && (
                  <button
                    type="button"
                    className="view-toggle"
                    aria-label={viewMode === "stack" ? "Open index" : "Close index"}
                    onClick={() => {
                      onToggleViewMode();
                      onToggleMobileInfo();
                    }}
                  >
                    <img
                      src={viewMode === "stack" ? "/default.svg" : "/index.svg"}
                      alt=""
                      aria-hidden="true"
                      className="view-toggle-icon"
                    />
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}