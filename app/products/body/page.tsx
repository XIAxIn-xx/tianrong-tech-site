import type { Metadata } from "next";

import { TianrongProductDetailPage } from "@/components/TianrongProductDetailPage";

export const metadata: Metadata = {
  title: "机器人本体 | 天戎科技",
  description: "天戎科技足式与轮足式机器人本体产品。"
};

export default function RobotBodyPage() {
  return <TianrongProductDetailPage product="body" />;
}
