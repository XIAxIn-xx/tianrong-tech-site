import type { Metadata } from "next";

import { TianrongScenarioPage } from "@/components/TianrongScenarioPage";
import { getTianrongContent } from "@/data/tianrong";

const content = getTianrongContent("zh-cn");

export const metadata: Metadata = {
  title: content.seo.title,
  description: content.seo.description,
  keywords: [...content.seo.keywords],
  alternates: {
    canonical: "/zh-cn",
    languages: {
      en: "/en",
      "zh-CN": "/zh-cn"
    }
  },
  openGraph: {
    title: content.seo.title,
    description: content.seo.description,
    url: "/zh-cn",
    locale: "zh_CN"
  }
};

export default function ZhCnHome() {
  return <TianrongScenarioPage />;
}
