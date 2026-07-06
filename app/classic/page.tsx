import type { Metadata } from "next";

import { TianrongPage } from "@/components/TianrongPage";
import { getTianrongContent } from "@/data/tianrong";

const content = getTianrongContent("zh-cn");

export const metadata: Metadata = {
  title: `旧版对比 | ${content.seo.title}`,
  description: content.seo.description
};

export default function ClassicHome() {
  return <TianrongPage locale="zh-cn" />;
}
