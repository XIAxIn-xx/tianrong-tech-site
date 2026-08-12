"use client";

import { useEffect } from "react";

export default function ErrorPage({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Page runtime error", error);
  }, [error]);

  return (
    <main className="grid min-h-screen place-items-center bg-[#071F31] px-6 text-center text-white">
      <div className="max-w-md">
        <h1 className="text-2xl font-semibold">页面暂时未能完整加载</h1>
        <p className="mt-3 text-sm leading-6 text-white/70">
          可能是网络或设备图形资源暂时不足。你可以保留当前页面并重新加载内容。
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-6 bg-[#0F62FE] px-5 py-3 text-sm font-semibold text-white hover:bg-[#0050E6]"
        >
          重新加载
        </button>
      </div>
    </main>
  );
}
