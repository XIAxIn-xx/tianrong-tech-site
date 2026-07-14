import type { Metadata } from "next";

import { TianrongProductDetailPage } from "@/components/TianrongProductDetailPage";

export const metadata: Metadata = {
  title: "ROBOX 接入网关 | 天戎科技",
  description: "ROBOX 机器人远程接入网关，连接机器人、现场网络与远程管理平台。"
};

export default function RoboxPage() {
  return <TianrongProductDetailPage product="robox" />;
}
