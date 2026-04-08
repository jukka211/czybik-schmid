import { client } from "@/sanity/lib/client";
import imageUrlBuilder from "@sanity/image-url";
import AboutClient from "./AboutClient";

const builder = imageUrlBuilder(client);
type SanityImageSource = Parameters<typeof builder.image>[0];

type AboutPersonEntry = {
  _key?: string;
  photo?: SanityImageSource;
  bioLeft: string;
  bioRight: string;
};

type AboutPageQueryResult = {
  introText: string;
  people?: AboutPersonEntry[];
} | null;

function urlFor(source: SanityImageSource) {
  return builder.image(source);
}

async function getAboutData() {
  const data = await client.fetch<AboutPageQueryResult>(
    `*[_type == "aboutPage"][0]{
      introText,
      people[]{
        _key,
        photo,
        bioLeft,
        bioRight
      }
    }`,
    {},
    { next: { revalidate: 60 } },
  );

  if (!data) {
    return {
      introText:
        "Seit 2022 sind wir Rahmenvertragspartner des Bundes in den Bereichen Porträt- und Veranstaltungsfotografie. Wir bringen umfangreiche Erfahrung aus der Politik- und Reportagefotografie sowie aus der PR-, Corporate- und Architekturfotografie mit. Diese vielfältige Expertise ermöglicht es uns, politische, gesellschaftliche und kulturelle Themen in Reportagen, Porträts oder Eventdokumentationen präzise und authentisch zu visualisieren. Sie erreichen uns telefonisch, per E-Mail oder über unsere Terminanfrage.",
      people: [
        {
          id: "christina-czybik",
          photoUrl: "/images/Frame 81.png",
          bioLeft:
            "Christina Czybik ist freiberufliche Fotojournalistin aus Hamburg mit 25 Jahren Erfahrung in den Bereichen Politik, Event, Reportage und Zeitgeschehen. Ihre Schwerpunkte sind die dokumentarische Fotografie, Pressefotografie, Eventdokumentation und politische Kommunikation. Als leitende Fotoredakteurin bei großen Pressebildagenturen in Hamburg und Los Angeles verantwortete sie die Durchführung von Fotoshootings, die Koordination von Fotografenteams und das Management von Bildrechten. Ihr Anspruch ist es, das Wesentliche einer Situation festzuhalten und in prägnanten, authentischen Bildern auszudrücken.",
          bioRight:
            "In der politischen Fotografie sieht sie ihre Aufgabe darin, hinter die Kulissen zu blicken und die Betrachtenden mitzunehmen, um komplexe Themen klar und nachvollziehbar zu vermitteln. Christina Czybik legt großen Wert darauf, eine verlässliche Quelle zu sein und Geschehnisse wahrheitsgemäß wiederzugeben. Für ihre Dokumentation über König Cephas Bansah wurde sie im März 2018 vom König zur „Official Royal Court Photographer of the Kingdom of Hohoe Gbi Traditional Ghana“ ernannt.",
        },
        {
          id: "laurin-schmid",
          photoUrl: "/images/Frame 82.png",
          bioLeft:
            "Laurin Schmid hat als Fotojournalist seit jeher eine große Faszination dafür, Geschichten über Menschen und Orte zu erzählen. Er absolvierte eine klassische Ausbildung zum Pressefotografen bei einer Tageszeitung, die ihm eine solide Grundlage in journalistischer und handwerklicher Bildarbeit verschaffte. Bevor er sich selbstständig machte, arbeitete er als leitender Fotograf und Fotoredakteur bei Quadriga Media. Neben der Fotografie zählen auch redaktionelle Tätigkeiten zu seinen Aufgaben, darunter die Konzeption unterschiedlicher Bildsprachen sowie die Organisation und Koordination von Fotografenteams. Regelmäßig begleitet er Regierungsdelegationen ins Ausland und dokumentiert dabei komplexe Themen wie Migration, öffentliche Sicherheit und politische oder humanitäre Krisen.",
          bioRight:
            "Intensiv beschäftigt er sich mit der Seenotrettung auf dem Mittelmeer und beleuchtet kritisch sowohl die Perspektiven der NGOs als auch die Rolle der Politik. Als „embedded“ Fotograf erhält er Einblicke, die sonst kaum zugänglich wären. Besonderen Wert legt Laurin Schmid auf ehrliche, technisch anspruchsvolle, ästhetische Bilder. Fotojournalismus bedeutet für ihn, die Realität unverfälscht und ohne inszenierte Effekte zu zeigen. Neben seiner Tätigkeit für Verlage, NGOs und Unternehmen arbeitet er seit 2018 in Rahmenverträgen für Bundesinstitutionen. Für seine freie Fotoserie „Relics of a Utopia“ wurde er für die Sony World Photography Awards nominiert.",
        },
      ],
    };
  }

  return {
    introText: data.introText,
    people: (data.people ?? []).map((person, index: number) => ({
      id: person._key ?? `person-${index}`,
      photoUrl: person.photo
        ? urlFor(person.photo).width(800).quality(80).auto("format").url()
        : null,
      bioLeft: person.bioLeft,
      bioRight: person.bioRight,
    })),
  };
}

export default async function AboutPage() {
  const data = await getAboutData();
  return <AboutClient data={data} />;
}
