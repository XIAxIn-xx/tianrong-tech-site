import type { Metadata } from "next";

import { TianrongLogisticsCasePage } from "@/components/TianrongLogisticsCasePage";

export const metadata: Metadata = {
  title: "物流园区机器人夜间巡检实践 | 天戎科技",
  description: "天戎科技物流园区机器人夜间巡检实践案例。"
};

export default function LogisticsCasePage() {
  return <TianrongLogisticsCasePage />;
}
