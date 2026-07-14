import type { Metadata } from "next";

import { TianrongProductDetailPage } from "@/components/TianrongProductDetailPage";

export const metadata: Metadata = {
  title: "任务载荷 | 天戎科技",
  description: "天戎科技面向机器人巡检任务的模块化载荷产品。"
};

export default function PayloadPage() {
  return <TianrongProductDetailPage product="payload" />;
}
