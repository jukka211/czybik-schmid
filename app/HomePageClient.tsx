"use client";

import Image from "next/image";
import { motion, useMotionValueEvent, useScroll } from "framer-motion";
import { Poppins } from "next/font/google";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import DesktopNav from "@/components/DesktopNav";
import MobileNav from "@/components/MobileNav";
import "./home.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["600"],
});

type Aspect = "portrait" | "landscape";

type GalleryItem = {
  src: string;
  alt?: string;
  orientation: Aspect;
};

type Size = {
  width: number;
  height: number;
};


const LOOP_CYCLES = 12;

function mod(value: number, total: number) {
  return ((value % total) + total) % total;
}

function getWrappedDistance(index: number, activeIndex: number, total: number) {
  if (total <= 1) return 0;

  const forward = mod(index - activeIndex, total);
  const backward = forward - total;

  return Math.abs(backward) < Math.abs(forward) ? backward : forward;
}

function getCardSize(
  aspect: Aspect,
  distance: number,
  availableWidth: number,
  viewportHeight: number,
  expanded: boolean,
  isMobile: boolean,
  viewportWidth: number,
): Size {
  const abs = Math.min(Math.abs(distance), 2);

  const landscapeAspect = 900 / 588;
  const portraitAspect = 380 / 525;

  // Scale factor for large screens
  const isLargeScreen = viewportWidth >= 2500;
  const isXLScreen = viewportWidth >= 4500;

  // Fixed size for all small cards — bigger on large screens
  if (abs >= 2) {
    const smallWidth = isMobile ? 60 : isXLScreen ? 80 : isLargeScreen ? 55 : 40;
    const smallHeight = aspect === "landscape"
      ? smallWidth / landscapeAspect
      : smallWidth / portraitAspect;
    return {
      width: Math.round(smallWidth),
      height: Math.round(smallHeight),
    };
  }

  const landscapeWidthRatios = isMobile
    ? [1, 230 / 900]
    : isXLScreen
      ? [1, 200 / 900]
      : isLargeScreen
        ? [1, 160 / 900]
        : [1, 127 / 900];
  const landscapeHeightRatios = isMobile
    ? [1, 150 / 588]
    : isXLScreen
      ? [1, 130 / 588]
      : isLargeScreen
        ? [1, 105 / 588]
        : [1, 83 / 588];

  const portraitWidthRatios = isMobile
    ? [1, 161 / 380]
    : isXLScreen
      ? [1, 135 / 380]
      : isLargeScreen
        ? [1, 110 / 380]
        : [1, 86 / 380];
  const portraitHeightRatios = isMobile
    ? [1, 223 / 525]
    : isXLScreen
      ? [1, 187 / 525]
      : isLargeScreen
        ? [1, 152 / 525]
        : [1, 120 / 525];

  let activeLandscapeWidth: number;
  let activeLandscapeHeight: number;
  let activePortraitWidth: number;
  let activePortraitHeight: number;

  const padding = isMobile ? 16 : 40;
  const maxWidth = availableWidth - padding;
  const maxHeight = viewportHeight * 0.85;

  if (expanded) {
    const targetHeight = viewportHeight * 0.8;

    activeLandscapeHeight = targetHeight;
    activeLandscapeWidth = Math.min(
      activeLandscapeHeight * landscapeAspect,
      maxWidth,
    );
    activeLandscapeHeight = activeLandscapeWidth / landscapeAspect;

    activePortraitHeight = targetHeight;
    activePortraitWidth = Math.min(
      activePortraitHeight * portraitAspect,
      maxWidth,
    );
    activePortraitHeight = activePortraitWidth / portraitAspect;
  } else {
    activeLandscapeWidth = Math.max(maxWidth, 220);
    activeLandscapeHeight = activeLandscapeWidth / landscapeAspect;

    if (activeLandscapeHeight > maxHeight) {
      activeLandscapeHeight = maxHeight;
      activeLandscapeWidth = activeLandscapeHeight * landscapeAspect;
    }

    activePortraitHeight = Math.min(maxHeight, viewportHeight * 0.82);
    activePortraitWidth = activePortraitHeight * portraitAspect;

    if (activePortraitWidth > maxWidth) {
      activePortraitWidth = maxWidth;
      activePortraitHeight = activePortraitWidth / portraitAspect;
    }

    activePortraitWidth = Math.max(activePortraitWidth, 150);
    activePortraitHeight = Math.max(activePortraitHeight, 200);
  }

  if (aspect === "landscape") {
    return {
      width: Math.round(activeLandscapeWidth * landscapeWidthRatios[abs]),
      height: Math.round(activeLandscapeHeight * landscapeHeightRatios[abs]),
    };
  }

  return {
    width: Math.round(activePortraitWidth * portraitWidthRatios[abs]),
    height: Math.round(activePortraitHeight * portraitHeightRatios[abs]),
  };
}
function getStackOffsets(sizes: Size[], activeSlotIndex: number) {
  const offsets = new Array(sizes.length).fill(0);

  let topCursor = -sizes[activeSlotIndex].height / 2;
  for (let i = activeSlotIndex - 1; i >= 0; i -= 1) {
    offsets[i] = topCursor - sizes[i].height / 2;
    topCursor -= sizes[i].height;
  }

  let bottomCursor = sizes[activeSlotIndex].height / 2;
  for (let i = activeSlotIndex + 1; i < sizes.length; i += 1) {
    offsets[i] = bottomCursor + sizes[i].height / 2;
    bottomCursor += sizes[i].height;
  }

  return offsets;
}

function getCardVisuals(distance: number) {
  const abs = Math.abs(distance);

  if (abs === 0) return { opacity: 1, zIndex: 50, scale: 1 };
  if (abs === 1) return { opacity: 1, zIndex: 40, scale: 1 };
  if (abs === 2) return { opacity: 1, zIndex: 30, scale: 1 };
  if (abs === 3) return { opacity: 1, zIndex: 20, scale: 1 };

  return { opacity: 1, zIndex: 10, scale: 1 };
}

function StackCard({
  src,
  alt,
  width,
  height,
  y,
  distance,
}: {
  src: string;
  alt?: string;
  width: number;
  height: number;
  y: number;
  distance: number;
}) {
  const visuals = getCardVisuals(distance);
  const isPriority = Math.abs(distance) <= 1;

  return (
    <motion.div
      className="stack-card"
      initial={false}
      animate={{
        width,
        height,
        y,
        opacity: visuals.opacity,
        scale: visuals.scale,
      }}
      transition={{
        type: "spring",
        stiffness: 210,
        damping: 26,
        mass: 0.9,
      }}
      style={{
        translateY: "-50%",
        zIndex: visuals.zIndex,
        willChange: "transform, width, height, opacity",
      }}
    >
      <Image
        src={src}
        alt={alt ?? ""}
        fill
        sizes={`${Math.max(width, 120)}px`}
        quality={65}
        priority={isPriority}
        className="stack-card-image"
      />
    </motion.div>
  );
}

function GridCard({
  src,
  alt,
}: {
  src: string;
  alt?: string;
}) {
  return (
    <div className="grid-card">
      <Image
        src={src}
        alt={alt ?? ""}
        fill
        sizes="(max-width: 767px) 45vw, (max-width: 1200px) 22vw, 18vw"
        quality={60}
        className="grid-card-image"
      />
    </div>
  );
}

export default function HomePageClient({ gallery }: { gallery: GalleryItem[] }) {
  const pathname = usePathname();
  const scrollTrackRef = useRef<HTMLDivElement | null>(null);

  const [expanded, setExpanded] = useState(false);
  const [viewMode, setViewMode] = useState<"stack" | "grid">("stack");
  const [viewportWidth, setViewportWidth] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(0);
  const [mobileInfoOpen, setMobileInfoOpen] = useState(false);
  const [scrollReady, setScrollReady] = useState(false);
  const [activeIndex, setActiveIndex] = useState(
    gallery.length > 0 ? Math.min(3, gallery.length - 1) : 0,
  );

  useEffect(() => {
    const updateViewport = () => {
      setViewportWidth(window.innerWidth);
      setViewportHeight(window.innerHeight);
    };

    updateViewport();
    window.addEventListener("resize", updateViewport);

    return () => window.removeEventListener("resize", updateViewport);
  }, []);

  const isMobile = viewportWidth > 0 ? viewportWidth <= 767 : false;
  const isReady = viewportWidth > 0;
  const visibleRange = useMemo(() => {
    if (viewportWidth >= 4500) return 10;
    return 6;
  }, [viewportWidth]);
  useEffect(() => {
    if (!isReady) return;
    setScrollReady(true);
  }, [isReady]);

  const { scrollYProgress } = useScroll(
    scrollReady
      ? {
          target: scrollTrackRef,
          offset: ["start start", "end end"],
        }
      : {},
  );

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    if (!scrollReady || viewMode === "grid") return;

    if (gallery.length <= 1) {
      setActiveIndex(0);
      return;
    }

    const totalSteps = gallery.length * LOOP_CYCLES;
    const rawIndex = Math.round(latest * (totalSteps - 1));
    const next = mod(rawIndex, gallery.length);

    setActiveIndex((prev) => (prev === next ? prev : next));
  });

  const availableWidth = useMemo(() => {
    if (viewportWidth === 0) return 680;
    if (isMobile) return viewportWidth;
    return viewportWidth * (expanded ? 0.7 : 0.5);
  }, [expanded, isMobile, viewportWidth]);

  const visibleCards = useMemo(() => {
    if (gallery.length === 0) return [];
  
    return gallery
      .map((item, index) => ({
        index,
        item,
        distance: getWrappedDistance(index, activeIndex, gallery.length),
      }))
      .filter((card) => Math.abs(card.distance) <= visibleRange)
      .sort((a, b) => a.distance - b.distance);
  }, [gallery, activeIndex, visibleRange]);

  const visibleSizes = useMemo(
    () =>
      visibleCards.map((card) =>
        getCardSize(
          card.item.orientation,
          card.distance,
          availableWidth,
          viewportHeight || 900,
          expanded,
          isMobile,
          viewportWidth,
        ),
      ),
    [availableWidth, expanded, isMobile, viewportHeight, viewportWidth, visibleCards],
  );

  const visibleOffsets = useMemo(() => {
    if (visibleSizes.length === 0) return [];

    const activeSlotIndex = visibleCards.findIndex((card) => card.distance === 0);

    return getStackOffsets(visibleSizes, activeSlotIndex === -1 ? 0 : activeSlotIndex);
  }, [visibleCards, visibleSizes]);

  const stackHeight = useMemo(() => {
    const sections = Math.max(gallery.length * LOOP_CYCLES, 1);
    return `${sections * 10 + 100}vh`;
  }, [gallery.length]);

  const onRightClick = () => {
    if (isMobile) return;
    setExpanded(true);
  };

  const onLeftClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isMobile) return;
    if ((e.target as HTMLElement).closest("a, button")) return;
    setExpanded(false);
    setViewMode("stack");
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
    <main className={`${poppins.className} ${expanded ? "is-expanded" : ""}`}>
      {!isMobile && (
        <DesktopNav
          activePage="home"
          expanded={expanded}
          onClick={onLeftClick}
        />
      )}

      {isMobile && (
        <MobileNav
          activePage="home"
          mobileInfoOpen={mobileInfoOpen}
          onToggleMobileInfo={() => setMobileInfoOpen((prev) => !prev)}
          showViewToggle
          viewMode={viewMode}
          onToggleViewMode={() =>
            setViewMode((prev) => (prev === "stack" ? "grid" : "stack"))
          }
        />
      )}

      <motion.div
        className="col-right"
        initial={false}
        animate={
          isMobile
            ? { left: "0vw", width: "100vw" }
            : { left: expanded ? "30vw" : "50vw", width: expanded ? "70vw" : "50vw" }
        }
        transition={{ duration: 0.55, ease: [0.65, 0, 0.35, 1] }}
        onClick={onRightClick}
      >
        <motion.div
          key={pathname}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
          style={{ height: "100%" }}
        >
          <div className="stack-stage" aria-hidden={viewMode !== "stack"}>
            <div className="stack-canvas">
              {visibleCards.map(({ index, distance, item }, slotIndex) => (
                <StackCard
                  key={`${item.src}-${index}`}
                  src={item.src}
                  alt={item.alt}
                  width={visibleSizes[slotIndex]?.width ?? 120}
                  height={visibleSizes[slotIndex]?.height ?? 120}
                  y={visibleOffsets[slotIndex] ?? 0}
                  distance={distance}
                />
              ))}
            </div>
          </div>

          <motion.div
            className="grid-stage"
            initial={false}
            animate={{ opacity: viewMode === "grid" ? 1 : 0 }}
            transition={{ duration: 0.18 }}
            style={{ pointerEvents: viewMode === "grid" ? "auto" : "none" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="grid-canvas">
              {gallery.map((item, index) => (
                <button
                  key={`${item.src}-${index}`}
                  type="button"
                  className="grid-item"
                  onClick={() => {
                    setActiveIndex(index);
                    setViewMode("stack");
                  }}
                >
                  <GridCard src={item.src} alt={item.alt} />
                </button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </motion.div>

      {!isMobile && (
        <button
          type="button"
          className="view-toggle view-toggle-fixed"
          aria-label={viewMode === "stack" ? "Open index" : "Close index"}
          onClick={(e) => {
            e.stopPropagation();
            setExpanded(true);
            setViewMode((prev) => (prev === "stack" ? "grid" : "stack"));
          }}
        >
          {viewMode === "stack" ? (
            <>
              <img
                src="/default.svg"
                alt=""
                aria-hidden="true"
                className="view-toggle-icon view-toggle-icon--base"
              />
              <img
                src="/index.svg"
                alt=""
                aria-hidden="true"
                className="view-toggle-icon view-toggle-icon--hover"
              />
            </>
          ) : (
            <>
              <img
                src="/index.svg"
                alt=""
                aria-hidden="true"
                className="view-toggle-icon view-toggle-icon--base"
              />
              <img
                src="/default.svg"
                alt=""
                aria-hidden="true"
                className="view-toggle-icon view-toggle-icon--hover"
              />
            </>
          )}
        </button>
      )}

      <div
        ref={scrollTrackRef}
        aria-hidden="true"
        className="stack-scroll-track"
        style={{ height: viewMode === "grid" ? "100vh" : stackHeight }}
      />
    </main>
  );
}