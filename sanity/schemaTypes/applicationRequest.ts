import { defineField, defineType } from "sanity";

export const applicationRequest = defineType({
  name: "applicationRequest",
  title: "Application Requests",
  type: "document",
  fields: [
    defineField({ name: "firstName", title: "First name", type: "string" }),
    defineField({ name: "lastName", title: "Last name", type: "string" }),
    defineField({ name: "phone", title: "Phone", type: "string" }),
    defineField({ name: "email", title: "Email", type: "string" }),

    defineField({ name: "authorityName", title: "Authority name", type: "string" }),
    defineField({ name: "billingAddress", title: "Billing address", type: "text" }),

    defineField({ name: "leitwegId", title: "Leitweg-ID", type: "string" }),
    defineField({ name: "bewirtschafterNummer", title: "Bewirtschafternummer", type: "string" }),

    defineField({ name: "topicDescription", title: "Topic description", type: "text" }),

    defineField({ name: "street", title: "Street", type: "string" }),
    defineField({ name: "houseNumber", title: "House number", type: "string" }),
    defineField({ name: "postalCode", title: "Postal code", type: "string" }),
    defineField({ name: "city", title: "City", type: "string" }),

    defineField({ name: "date", title: "Date", type: "string" }),
    defineField({ name: "startTime", title: "Start time", type: "string" }),
    defineField({ name: "endTime", title: "End time", type: "string" }),

    defineField({ name: "imageCount", title: "Image count", type: "number" }),

    defineField({ name: "deliveryDate", title: "Delivery date", type: "string" }),
    defineField({
      name: "deliveryMedium",
      title: "Delivery medium",
      type: "string",
      options: { list: [{ title: "Download", value: "download" }, { title: "USB", value: "usb" }] },
    }),

    defineField({ name: "consent", title: "Consent", type: "boolean" }),

    defineField({
      name: "createdAt",
      title: "Created at",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
      readOnly: true,
    }),
  ],
});