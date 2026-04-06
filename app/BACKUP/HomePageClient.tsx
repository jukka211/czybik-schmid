"use client";

import { useEffect, useRef } from "react";
import { Lexend } from "next/font/google";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const lexend = Lexend({
  subsets: ["latin"],
  weight: ["600"],
});

type GalleryItem = {
  src: string;
  alt?: string;
  orientation: "portrait" | "landscape";
};

export default function HomePageClient({
  gallery,
}: {
  gallery: GalleryItem[];
}) {
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const root = rootRef.current;
    if (!root) return;

    const colLeft = root.querySelector<HTMLElement>(".col-left");
    const colRight = root.querySelector<HTMLElement>(".col-right");
    const items = Array.from(root.querySelectorAll<HTMLElement>(".gallery-item"));
    const navEls = Array.from(
      root.querySelectorAll<HTMLElement>(".logo, nav, .nav-contact, .nav-footer"),
    );

    if (!colLeft || !colRight || items.length === 0) return;

    let expanded = false;

    const LAYOUT = {
      default: { left: 50, right: 50 },
      expanded: { left: 10, right: 90 },
    };

    const buildGallery = () => {
        ScrollTrigger.getAll().forEach((st: ScrollTrigger) => st.kill());

      items.forEach((item) => {
        const inner = item.querySelector<HTMLElement>(".gallery-inner");
        const img = item.querySelector<HTMLImageElement>("img");

        if (!inner || !img) return;

        if (item.classList.contains("portrait")) {
          item.style.height = `${window.innerHeight}px`;
        } else {
          item.style.height = `${img.getBoundingClientRect().height}px`;
        }

        gsap.set(inner, { scale: 1 });

        gsap.fromTo(
          inner,
          { scale: 1 },
          {
            scale: 0,
            ease: "none",
            scrollTrigger: {
              trigger: item,
              start: "top top",
              end: "bottom top",
              scrub: true,
              invalidateOnRefresh: true,
            },
          },
        );
      });

      ScrollTrigger.refresh();
    };

    const setLayout = (
      leftVw: number,
      rightVw: number,
      isExpanded: boolean,
      duration = 0.55,
    ) => {
      if (window.innerWidth <= 767) return;

      if (isExpanded) {
        navEls.forEach((el) => {
          gsap.to(el, {
            opacity: 0,
            duration: duration * 0.4,
            ease: "power2.in",
            onComplete: () => {
              el.style.visibility = "hidden";
            },
          });
        });
      } else {
        navEls.forEach((el) => {
          el.style.visibility = "visible";
          gsap.to(el, {
            opacity: 1,
            duration: duration * 0.5,
            ease: "power2.out",
            delay: duration * 0.5,
          });
        });
      }

      gsap.to(colLeft, {
        width: `${leftVw}vw`,
        duration,
        ease: "power3.inOut",
      });

      gsap.to(colRight, {
        marginLeft: `${leftVw}vw`,
        width: `${rightVw}vw`,
        duration,
        ease: "power3.inOut",
        onUpdate: () => {
          ScrollTrigger.refresh();
        },
        onComplete: () => {
          buildGallery();
        },
      });
    };

    const onRightClick = () => {
      if (window.innerWidth <= 767) return;
      if (!expanded) {
        expanded = true;
        setLayout(LAYOUT.expanded.left, LAYOUT.expanded.right, true);
      }
    };

    const onLeftClick = (e: Event) => {
      if (window.innerWidth <= 767) return;

      const target = e.target as HTMLElement | null;
      if (target?.closest("a")) return;

      if (expanded) {
        expanded = false;
        setLayout(LAYOUT.default.left, LAYOUT.default.right, false);
      }
    };

    const initGallery = () => {
      let loaded = 0;
      const total = items.length;

      const done = () => {
        loaded += 1;
        if (loaded === total) buildGallery();
      };

      items.forEach((item) => {
        const img = item.querySelector<HTMLImageElement>("img");
        if (!img) {
          done();
          return;
        }

        if (img.complete) {
          done();
        } else {
          img.addEventListener("load", done, { once: true });
          img.addEventListener("error", done, { once: true });
        }
      });

      if (total === 0) buildGallery();
    };

    colRight.addEventListener("click", onRightClick);
    colLeft.addEventListener("click", onLeftClick);
    window.addEventListener("resize", buildGallery);

    initGallery();

    return () => {
      colRight.removeEventListener("click", onRightClick);
      colLeft.removeEventListener("click", onLeftClick);
      window.removeEventListener("resize", buildGallery);
      ScrollTrigger.getAll().forEach((st: ScrollTrigger) => st.kill());
    };
  }, [gallery]);

  return (
    <main ref={rootRef} className={lexend.className}>
      <div className="col-left">
        <div className="nav-top">
          <div className="logo">
            <img src="/CS-Logo.svg" alt="Logo" />
          </div>

          <nav>
            <a href="#">Über uns</a>
            <a href="#">Terminanfrage</a>
          </nav>

          <div className="nav-contact">
            <a href="mailto:">E-Mail</a>
            <a href="tel:">Telefon</a>
          </div>
        </div>

        <div className="nav-footer">
          <a href="#">Impressum</a>
          <a href="#">Datenschutz</a>
          <span>© 2026</span>
        </div>
      </div>

      <div className="col-right">
        {gallery.map((item, index) => (
          <div
            key={`${item.src}-${index}`}
            className={`gallery-item ${item.orientation}`}
          >
            <div className="gallery-inner">
              <img src={item.src} alt={item.alt ?? ""} />
            </div>
          </div>
        ))}
      </div>

      <style jsx global>{`
        html,
        body {
          margin: 0;
          padding: 0;
          overflow-x: hidden;
          font-family: ${lexend.style.fontFamily};
          font-weight: 600;
        }

        *,
        *::before,
        *::after {
          box-sizing: border-box;
        }

        .col-left {
          position: fixed;
          top: 0;
          left: 0;
          width: 50vw;
          height: 100vh;
          padding: 12px;
          z-index: 10;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          align-items: flex-end;
          box-sizing: border-box;
          overflow: hidden;
          cursor: pointer;
        }

        .nav-top {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 0;
        }

        .logo {
          display: flex;
          justify-content: flex-end;
          align-items: flex-end;
        }

        .logo img {
          display: block;
          width: auto;
          height: 22vh;
          object-fit: contain;
          object-position: right bottom;
          transition: height 0.3s ease;
        }

        .logo:hover img {
          height: 38vh;
        }

        nav {
          margin-top: 0.8rem;
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          text-align: right;
        }

        nav a {
          text-decoration: none;
          color: #000;
          font-size: 3rem;
          font-weight: 600;
          letter-spacing: -0.03em;
          line-height: 0.9;
          transition: font-size 0.3s ease;
        }

        nav a:hover {
          font-size: 6rem;
        }

        .nav-contact {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          text-align: right;
          margin-top: 0.8rem;
        }

        .nav-contact a {
          text-decoration: none;
          color: #000;
          font-size: 1.5rem;
          font-weight: 600;
          letter-spacing: -0.01em;
          line-height: 0.9;
          transition: font-size 0.3s ease;
        }

        .nav-contact a:hover {
          font-size: 3.5rem;
        }

        .nav-footer {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          text-align: right;
        }

        .nav-footer a,
        .nav-footer span {
          text-decoration: none;
          color: #000;
          font-size: 0.9rem;
          font-weight: 600;
          letter-spacing: -0.01em;
          line-height: 1;
          transition: font-size 0.5s ease;
        }

        .nav-footer a:hover {
          font-size: 2rem;
        }

        .col-right {
          margin-left: 50vw;
          width: 50vw;
        }

        .gallery-item {
          width: 100%;
          display: flex;
          align-items: flex-start;
          justify-content: flex-start;
          overflow: hidden;
          cursor: pointer;
        }

        .gallery-inner {
          transform-origin: 0% 100%;
          will-change: transform;
          display: inline-flex;
          width: 100%;
        }

        .gallery-item.portrait img {
          height: 100vh;
          width: auto;
          display: block;
          margin-left: 0;
        }

        .gallery-item.portrait .gallery-inner {
          height: 100vh;
        }

        .gallery-item.landscape .gallery-inner {
          width: 100%;
        }

        .gallery-item.landscape img {
          width: 100%;
          height: auto;
          display: block;
        }

        @media screen and (max-width: 767px) {
          .col-left {
            position: relative;
            top: auto;
            left: auto;
            width: 100vw !important;
            height: auto;
            min-height: unset;
            padding: 12px;
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
            overflow: visible;
            cursor: default;
          }

          nav,
          .nav-contact,
          .nav-footer {
            display: none;
          }

          .logo img {
            height: 3.8rem;
          }

          .col-right {
            margin-left: 0 !important;
            width: 100vw !important;
          }

          .gallery-item {
            width: 100vw;
          }
        }
      `}</style>
    </main>
  );
}