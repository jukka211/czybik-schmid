import { type SchemaTypeDefinition } from "sanity";
import { applicationRequest } from "./applicationRequest";

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [applicationRequest],
};