import type { Metadata } from "next";

import { TianrongProductDetailPage } from "@/components/TianrongProductDetailPage";

export const metadata: Metadata = {
  title: "RSP 调度平台 | 天戎科技",
  description: "RSP 多机器人调度管理平台，统一管理机器人、地图、任务和现场数据。"
};

export default function RspPage() {
  return <TianrongProductDetailPage product="rsp" />;
}
