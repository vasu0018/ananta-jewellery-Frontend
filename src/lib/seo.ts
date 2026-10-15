import type { Metadata } from "next";
import { SITE_NAME } from "./config";

/** Admin-entered SEO titles often already end with the brand; skip the layout's "| brand" template then. */
export function pageTitle(title: string): Metadata["title"] {
  return title.toLowerCase().includes(SITE_NAME.split(" ")[0].toLowerCase()) ? { absolute: title } : title;
}
