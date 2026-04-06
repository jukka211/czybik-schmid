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
              name: "name",
              title: "Name",
              type: "string",
            }),
            defineField({
              name: "website",
              title: "Website",
              type: "url",
            }),
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
            select: { title: "name", media: "photo" },
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