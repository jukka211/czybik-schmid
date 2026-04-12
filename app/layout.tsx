import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Czybik Schmid",
  description:
    "Seit 2018 fotografieren wir für den Bund sowie für politische, gesellschaftliche und kulturelle Formate – mit Expertise in Porträt-, Veranstaltungs-, Reportage-, PR- und Architekturfotografie.",
  openGraph: {
    title: "Czybik Schmid",
    description:
      "Seit 2018 fotografieren wir für den Bund sowie für politische, gesellschaftliche und kulturelle Formate.",
    images: ["/opengraph-image.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Czybik Schmid",
    description:
      "Seit 2018 fotografieren wir für den Bund sowie für politische, gesellschaftliche und kulturelle Formate.",
    images: ["/twitter-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}