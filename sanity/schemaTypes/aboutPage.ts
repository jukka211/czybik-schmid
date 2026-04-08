import { defineType, defineField } from "sanity";

export default defineType({
  name: "aboutPage",
  title: "About Page",
  type: "document",
  fields: [
    defineField({
      name: "introText",
      title: "Intro Text",
      type: "text",
      rows: 6,
      description: "The introductory paragraph at the top of the page.",
    }),
    defineField({
      name: "people",
      title: "People",
      type: "array",
      of: [
        {
          type: "object",
          name: "person",
          title: "Person",
          fields: [
            defineField({
              name: "photo",
              title: "Portrait Photo",
              type: "image",
              options: { hotspot: true },
            }),
            defineField({
              name: "bioLeft",
              title: "Bio — Left Column",
              type: "text",
              rows: 10,
            }),
            defineField({
              name: "bioRight",
              title: "Bio — Right Column",
              type: "text",
              rows: 10,
            }),
          ],
          preview: {
            select: { media: "photo", subtitle: "bioLeft" },
            prepare(value) {
              const media = value?.media;
              const subtitle = value?.subtitle as string | undefined;

              return {
                title: "Person",
                subtitle: subtitle
                  ? subtitle.replace(/\s+/g, " ").slice(0, 80)
                  : undefined,
                media,
              };
            },
          },
        },
      ],
    }),
  ],
  preview: {
    prepare() {
      return { title: "About Page" };
    },
  },
});