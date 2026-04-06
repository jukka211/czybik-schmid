import HomePageClient from "./HomePageClient";
import { client } from "@/sanity/lib/client";

type GalleryItem = {
  src: string;
  alt?: string;
  orientation: "portrait" | "landscape";
};

type HomeGalleryResult = {
  gallery?: GalleryItem[];
};

const homeGalleryQuery = `
  *[_type == "homeGallery"][0]{
    gallery[]{
      alt,
      orientation,
      "src": image.asset->url
    }
  }
`;

const fallbackGallery: GalleryItem[] = [
  { src: "/211209-bundeskanzleramt-20-b.jpg", orientation: "landscape", alt: "" },
  { src: "/240411-kuehn-lars-20.jpg", orientation: "portrait", alt: "" },
  { src: "/20240819_bundesfoto_CC_Sicherheitstour_BMI173.JPG", orientation: "landscape", alt: "" },
  { src: "/20251029_bundesfoto_CC_BMFTR_010.JPG", orientation: "portrait", alt: "" },
  { src: "/20260120_CZY_GTAI_Netzwerktreffen_041.JPG", orientation: "landscape", alt: "" },
  { src: "/Leyen_vd_Ursula_21.jpg", orientation: "portrait", alt: "" },
  { src: "/2023-08-31_CZY_Features009.JPG", orientation: "portrait", alt: "" },
  { src: "/251121-bkm-kulturgut-17.jpg", orientation: "landscape", alt: "" },
  { src: "/20220821_CZY_Berlin005.JPG", orientation: "portrait", alt: "" },
  { src: "/20240708_bundesfoto_BK_Sommerreise_CC_186.JPG", orientation: "landscape", alt: "" },
  { src: "/20240709_bundesfoto_BK_Sommerreise_CC_177.JPG", orientation: "landscape", alt: "" },
  { src: "/20240819_bundesfoto_CC_Sicherheitstour_BMI014.JPG", orientation: "portrait", alt: "" },
  { src: "/20250522_bundesfoto_CC_BMWSB_ZukunftBau_686.JPG", orientation: "landscape", alt: "" },
  { src: "/20260116_GrueneWoche_DJV_251.JPG", orientation: "portrait", alt: "" },
  { src: "/20260120_CZY_GTAI_Netzwerktreffen_131.JPG", orientation: "landscape", alt: "" },
  { src: "/Menzel_Elektromotoren_02.jpg", orientation: "landscape", alt: "" },
  { src: "/Menzel_Elektromotoren_03.jpg", orientation: "portrait", alt: "" },
  { src: "/Menzel_Elektromotoren_11.jpg", orientation: "portrait", alt: "" },
];

export default async function Page() {
  let data: HomeGalleryResult | null = null;

  try {
    data = await client.fetch<HomeGalleryResult>(homeGalleryQuery);
  } catch {
    data = null;
  }

  const gallery =
    data?.gallery && data.gallery.length > 0 ? data.gallery : fallbackGallery;

  return <HomePageClient gallery={gallery} />;
}