import type { Metadata } from "next";
import { cache } from "react";
import { groq } from "next-sanity";
import type { PortableTextBlock } from "sanity";
import { client } from "@/sanity/lib/client";
import DatenschutzClient from "./DatenschutzClient";

type DatenschutzSection = {
  _key: string;
  title: string;
  body: PortableTextBlock[];
};

type DatenschutzPageQueryResult = {
  seoTitle?: string | null;
  seoDescription?: string | null;
  sections?: DatenschutzSection[];
};

const datenschutzPageQuery = groq`
  *[_type == "datenschutzPage"][0]{
    seoTitle,
    seoDescription,
    sections[]{
      _key,
      title,
      body
    }
  }
`;

const getDatenschutzPage = cache(async (): Promise<DatenschutzPageQueryResult | null> => {
  return client.fetch<DatenschutzPageQueryResult | null>(
    datenschutzPageQuery,
    {},
    {
      next: { revalidate: 60 },
    }
  );
});

export async function generateMetadata(): Promise<Metadata> {
  const page = await getDatenschutzPage();

  return {
    title: page?.seoTitle || "Datenschutz & Impressum",
    description: page?.seoDescription || undefined,
  };
}

export default async function DatenschutzPage() {
  const page = await getDatenschutzPage();

  return (
    <DatenschutzClient
      sections={page?.sections || []}
    />
  );
}