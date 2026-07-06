import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://tianrongtech.com"),
  title: {
    default: "天戎科技 | 机器狗消防安防解决方案",
    template: "%s"
  },
  description:
    "天戎科技面向消防、安防与应急巡检场景，提供机器狗硬件选型、二次开发、载荷集成与现场交付服务。",
  openGraph: {
    title: "天戎科技",
    description:
      "机器狗消防安防场景解决方案。",
    type: "website",
    locale: "zh_CN",
    images: [
      {
        url: "/images/generated/hyper-hero-robotics.png",
        width: 1536,
        height: 864,
        alt: "天戎科技机器狗现场解决方案"
      }
    ]
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
