import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F4F6F8] px-6 text-center text-[#101820]">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#0B5CAD]">
          Tianrong Technology
        </p>
        <h1 className="mt-4 text-4xl font-black">页面未找到</h1>
        <p className="mt-4 text-[#667582]">返回天戎科技官网首页。</p>
        <Button asChild className="mt-8 bg-[#0B5CAD] text-white shadow-none hover:bg-[#084B8D]">
          <Link href="/">返回首页</Link>
        </Button>
      </div>
    </main>
  );
}
