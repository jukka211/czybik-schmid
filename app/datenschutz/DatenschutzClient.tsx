"use client";

import { motion } from "framer-motion";
import { PortableText, type PortableTextComponents } from "@portabletext/react";
import { Poppins } from "next/font/google";
import { MouseEvent, useEffect, useState } from "react";
import type { PortableTextBlock } from "sanity";
import DesktopNav from "@/components/DesktopNav";
import MobileNav from "@/components/MobileNav";
import "../home.css";
import "./datenschutz.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["600"],
});

type DatenschutzSection = {
  _key: string;
  title: string;
  body: PortableTextBlock[];
};

type DatenschutzClientProps = {
  sections: DatenschutzSection[];
};

const portableTextComponents: PortableTextComponents = {
  block: {
    normal: ({ children }) => <p>{children}</p>,
  },
  list: {
    bullet: ({ children }) => <ul>{children}</ul>,
  },
  listItem: {
    bullet: ({ children }) => <li>{children}</li>,
  },
  marks: {
    link: ({ children, value }) => {
      const href = value?.href || "#";
      const isExternal = href.startsWith("http");

      return (
        <a
          href={href}
          target={isExternal ? "_blank" : undefined}
          rel={isExternal ? "noreferrer noopener" : undefined}
        >
          {children}
        </a>
      );
    },
  },
};

export default function DatenschutzClient({
  sections,
}: DatenschutzClientProps) {
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
      className={`${poppins.className} datenschutzPage ${expanded ? "is-expanded" : ""}`}
    >
      {!isMobile && (
        <DesktopNav
          activePage="datenschutz"
          expanded={expanded}
          onClick={onLeftClick}
        />
      )}

      {isMobile && (
        <MobileNav
          activePage="datenschutz"
          mobileInfoOpen={mobileInfoOpen}
          onToggleMobileInfo={() => setMobileInfoOpen((prev) => !prev)}
        />
      )}

      <motion.div
        className="datenschutzRight"
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
        <div className="datenschutzWrap">


          {sections.map((section) => (
            <section className="dsRow" key={section._key}>
              <h2 className="dsRowTitle">{section.title}</h2>
              <div className="dsRowContent">
                <PortableText
                  value={section.body}
                  components={portableTextComponents}
                />
              </div>
            </section>
          ))}
        </div>
      </motion.div>
    </main>
  );
}