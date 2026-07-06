import type { Metadata } from "next";

import { TianrongPage } from "@/components/TianrongPage";
import { getTianrongContent } from "@/data/tianrong";

const content = getTianrongContent("en");

export const metadata: Metadata = {
  title: content.seo.title,
  description: content.seo.description,
  keywords: [...content.seo.keywords],
  alternates: {
    canonical: "/en",
    languages: {
      en: "/en",
      "zh-CN": "/"
    }
  },
  openGraph: {
    title: content.seo.title,
    description: content.seo.description,
    url: "/en",
    locale: "en_US"
  }
};

export default function EnHome() {
  return <TianrongPage locale="en" />;
}
