import { type SchemaTypeDefinition } from "sanity";
import { applicationRequest } from "./applicationRequest";
import aboutPage from "./aboutPage";
import homePage from "./homePage";
import datenschutzPage from "./datenschutzPage";
export const schema: { types: SchemaTypeDefinition[] } = {
  types: [applicationRequest, homePage, aboutPage,datenschutzPage],
};


