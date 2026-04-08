"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Poppins } from "next/font/google";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import DesktopNav from "@/components/DesktopNav";
import MobileNav from "@/components/MobileNav";
import "../home.css";
import "./about.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["600"],
});

type Person = {
  id: string;
  photoUrl: string | null;
  bioLeft: string;
  bioRight: string;
};

type AboutData = {
  introText: string;
  people: Person[];
};

export default function AboutClient({ data }: { data: AboutData }) {
  const pathname = usePathname();
  const [viewportWidth, setViewportWidth] = useState(0);
  const [mobileInfoOpen, setMobileInfoOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);

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
    <main
      className={`${poppins.className} about-page ${expanded ? "is-expanded" : ""}`}
    >
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
      >
        <motion.div
          key={pathname}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
          style={{ minHeight: "100%" }}
        >
          <div className="about-scroll-space">
            <div className="about-sticky">
              <div className="about-block">
                <div className="about-intro">
                  <p>{data.introText}</p>
                </div>

                {data.people.map((person) => (
                  <div className="about-person" key={person.id}>
                    <div className="about-person-meta">
                      <div className="about-person-photo">
                        {person.photoUrl ? (
                          <Image
                            src={person.photoUrl}
                            alt=""
                            width={600}
                            height={400}
                            quality={75}
                            className="about-photo-img"
                          />
                        ) : null}
                      </div>
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
