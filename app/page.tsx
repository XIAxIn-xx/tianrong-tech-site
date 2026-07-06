import type { Metadata } from "next";

import { TianrongScenarioPage } from "@/components/TianrongScenarioPage";
import { getTianrongContent } from "@/data/tianrong";

const content = getTianrongContent("zh-cn");

export const metadata: Metadata = {
  title: content.seo.title,
  description: content.seo.description,
  keywords: [...content.seo.keywords],
  alternates: {
    canonical: "/"
  },
  openGraph: {
    title: content.seo.title,
    description: content.seo.description,
    url: "/",
    locale: "zh_CN"
  }
};

export default function Home() {
  return <TianrongScenarioPage />;
}
