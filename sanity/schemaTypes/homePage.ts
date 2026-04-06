import { defineArrayMember, defineField, defineType } from "sanity";

export default defineType({
  name: "homePage",
  title: "Homepage",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Internal title",
      type: "string",
      initialValue: "Homepage",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "gallery",
      title: "Gallery",
      type: "array",
      of: [
        defineArrayMember({
          name: "galleryItem",
          title: "Gallery item",
          type: "object",
          fields: [
            defineField({
              name: "image",
              title: "Image",
              type: "image",
              options: { hotspot: true },
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "alt",
              title: "Alt text",
              type: "string",
            }),
            defineField({
              name: "orientation",
              title: "Orientation",
              type: "string",
              options: {
                list: [
                  { title: "Portrait", value: "portrait" },
                  { title: "Landscape", value: "landscape" },
                ],
                layout: "radio",
              },
              validation: (Rule) => Rule.required(),
            }),
          ],
          preview: {
            select: {
              media: "image",
              title: "alt",
              subtitle: "orientation",
            },
            prepare({ media, title, subtitle }) {
              return {
                media,
                title: title || "Gallery image",
                subtitle,
              };
            },
          },
        }),
      ],
    }),
    defineField({
      name: "seoTitle",
      title: "SEO title",
      type: "string",
    }),
    defineField({
      name: "seoDescription",
      title: "SEO description",
      type: "text",
      rows: 3,
    }),
  ],
  preview: {
    select: {
      title: "title",
    },
  },
});