// /Users/jukka_w/czybik-schmid/sanity/schemaTypes/applicationRequest.ts
import { defineField, defineType } from "sanity";

export const applicationRequest = defineType({
  name: "applicationRequest",
  title: "Application Requests",
  type: "document",
  fields: [
    // 1
    defineField({ name: "contactBlock", title: "Name und Kontaktdaten", type: "text" }),

    // 2
    defineField({ name: "email", title: "E-Mail-Adresse", type: "string" }),

    // 3
    defineField({ name: "billingAddress", title: "Rechnungsanschrift", type: "text" }),

    // 4
    defineField({
      name: "category",
      title: "Kategorie",
      type: "string",
      options: {
        list: [
          { title: "Event Foto", value: "event_foto" },
          { title: "Event Foto + Video", value: "event_foto_video" },
          { title: "Porträt", value: "portrait" },
        ],
        layout: "radio",
      },
    }),

    // 5–13
    defineField({ name: "topicDescription", title: "Thema / Beschreibung", type: "text" }),
    defineField({ name: "date", title: "Datum", type: "string" }),
    defineField({ name: "assignmentTimes", title: "Uhrzeit Einsatzzeiten", type: "string" }),
    defineField({ name: "eventStartTime", title: "Uhrzeit Start der Veranstaltung", type: "string" }),
    defineField({ name: "address", title: "Adresse / Ort", type: "text" }),
    defineField({ name: "imageCount", title: "Bildanzahl", type: "number" }),
    defineField({ name: "deliveryDate", title: "Lieferdatum", type: "string" }),
    defineField({ name: "leitwegId", title: "Leitweg-ID", type: "string" }),
    defineField({
      name: "referenceNumber",
      title: "Bewirtschafternummer / Referenz",
      type: "text",
    }),
    defineField({ name: "notes", title: "Anmerkungen", type: "text" }),

    // System
    defineField({ name: "consent", title: "Consent", type: "boolean" }),
    defineField({ name: "turnstileToken", title: "Turnstile Token", type: "string", hidden: true }),

    defineField({
      name: "createdAt",
      title: "Created at",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
      readOnly: true,
    }),
  ],
});