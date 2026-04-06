import type { Metadata } from "next";
import { cache } from "react";
import { groq } from "next-sanity";
import HomePageClient from "./HomePageClient";
import { client } from "@/sanity/lib/client";
import { urlFor } from "@/sanity/lib/image";

type Aspect = "portrait" | "landscape";

type GalleryItem = {
  src: string;
  alt?: string;
  orientation: Aspect;
};

type HomePageQueryResult = {
  seoTitle?: string;
  seoDescription?: string;
  gallery?: {
    image?: unknown;
    alt?: string;
    orientation?: Aspect;
  }[];
};

const homePageQuery = groq`
  *[_type == "homePage"][0]{
    seoTitle,
    seoDescription,
    gallery[]{
      image,
      alt,
      orientation
    }
  }
`;

const getHomePage = cache(async (): Promise<HomePageQueryResult | null> => {
  return client.fetch<HomePageQueryResult | null>(homePageQuery, {}, {
    next: { revalidate: 60 },
  });
});

export async function generateMetadata(): Promise<Metadata> {
  const homePage = await getHomePage();

  return {
    title: homePage?.seoTitle || undefined,
    description: homePage?.seoDescription || undefined,
  };
}

export default async function Page() {
  const homePage = await getHomePage();

  const gallery: GalleryItem[] = (homePage?.gallery ?? [])
    .filter((item): item is NonNullable<typeof item> => Boolean(item?.image))
    .map((item) => ({
      src: urlFor(item.image as never).auto("format").quality(80).url(),
      alt: item.alt ?? "",
      orientation: item.orientation === "portrait" ? "portrait" : "landscape",
    }));

  return <HomePageClient gallery={gallery} />;
}