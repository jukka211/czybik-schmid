"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Poppins } from "next/font/google";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, useCallback } from "react";
import DesktopNav from "@/components/DesktopNav";
import MobileNav from "@/components/MobileNav";
import "../home.css";
import "./about.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["600"],
});

type Person = {
  name: string;
  photoUrl: string | null;
  bioLeft: string;
  bioRight: string;
  website?: string | null;
};

type AboutData = {
  introText: string;
  people: Person[];
};

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function clamp(v: number, lo: number, hi: number) {
  return v < lo ? lo : v > hi ? hi : v;
}

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export default function AboutClient({ data }: { data: AboutData }) {
  const pathname = usePathname();
  const [viewportWidth, setViewportWidth] = useState(0);
  const [mobileInfoOpen, setMobileInfoOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [introFontSize, setIntroFontSize] = useState(46);

  const scrollerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const updateViewport = () => setViewportWidth(window.innerWidth);
    updateViewport();
    window.addEventListener("resize", updateViewport);
    return () => window.removeEventListener("resize", updateViewport);
  }, []);

  const isMobile = viewportWidth > 0 ? viewportWidth <= 767 : false;
  const isReady = viewportWidth > 0;

  const introFontBig = clamp(viewportWidth * 0.024, 46, 96);
  const introFontSmall = clamp(viewportWidth * 0.012, 24, 48);
  const shrinkVh = clamp(viewportWidth / 30000, 0.08, 0.14);

  useEffect(() => {
    setIntroFontSize(introFontBig);
  }, [introFontBig]);

  const onScroll = useCallback(() => {
    if (!scrollerRef.current) return;

    const scrollTop = scrollerRef.current.scrollTop;
    const holdDistance = shrinkVh * window.innerHeight;

    let p0 = clamp(scrollTop / holdDistance, 0, 1);
    p0 = easeInOutCubic(p0);
    setIntroFontSize(lerp(introFontBig, introFontSmall, p0));
  }, [introFontBig, introFontSmall, shrinkVh]);

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    scroller.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => scroller.removeEventListener("scroll", onScroll);
  }, [onScroll]);

  const onRightClick = () => {
    if (isMobile) return;
    setExpanded(true);
  };

  const onLeftClick = (e: React.MouseEvent<HTMLDivElement>) => {
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
    <main className={`${poppins.className} about-page ${expanded ? "is-expanded" : ""}`}>
      {!isMobile && (
        <DesktopNav
          activePage="about"
          expanded={expanded}
          onClick={onLeftClick}
        />
      )}

      {isMobile && (
        <MobileNav
          activePage="about"
          mobileInfoOpen={mobileInfoOpen}
          onToggleMobileInfo={() => setMobileInfoOpen((prev) => !prev)}
        />
      )}

      <motion.div
        ref={scrollerRef}
        className="about-col-right"
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
        <motion.div
          key={pathname}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
          style={{ minHeight: "100%" }}
        >
          <div
            className="about-scroll-space"
            style={{
              height: "auto",
              minHeight: "100%",
            }}
          >
            <div
              className="about-sticky"
              style={{
                position: "relative",
                top: "auto",
                height: "auto",
                overflow: "visible",
              }}
            >
              <div
                className="about-block"
                style={{
                  transform: "none",
                }}
              >
                <div className="about-intro">
                  <p
                    style={{
                      fontSize: isMobile
                        ? `${introFontSmall.toFixed(1)}px`
                        : `${introFontSize.toFixed(1)}px`,
                    }}
                  >
                    {data.introText}
                  </p>
                </div>

                {data.people.map((person) => (
                  <div className="about-person" key={person.name}>
                    <div className="about-person-meta">
                      <div className="about-person-photo">
                        {person.photoUrl ? (
                          <Image
                            src={person.photoUrl}
                            alt={person.name}
                            width={600}
                            height={400}
                            quality={75}
                            className="about-photo-img"
                          />
                        ) : null}
                      </div>

                      <h1>
                        {person.name}
                        {person.website && (
                          <>
                            {", "}
                            <a
                              href={person.website}
                              target="_blank"
                              rel="noreferrer"
                              className="about-person-web"
                            >
                              (Web.)
                            </a>
                          </>
                        )}
                      </h1>
                    </div>

                    <div className="about-bio-wrap">
                      <div className="about-bio-col">
                        <p>{person.bioLeft}</p>
                      </div>
                      <div className="about-bio-col">
                        <p>{person.bioRight}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </main>
  );
}