import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";

const gallery = [
  ["/images/tianrong/final-assets/logistics-yard-road.png", "物流园区道路巡检"],
  ["/images/tianrong/final-assets/logistics-warehouse-patrol.png", "仓储外围巡检"],
  ["/images/tianrong/final-assets/logistics-gate-patrol.png", "园区出入口巡检"]
];

const deploymentPoints = [
  ["01", "路线执行", "按照预设路线巡查园区道路、仓库外围和重点区域。"],
  ["02", "远程管理", "巡检画面和设备状态实时回传，工作人员可远程查看和接管。"],
  ["03", "现场优化", "围绕夜间环境、网络条件和巡检路线持续调整部署方式。"]
];

export function TianrongLogisticsCasePage() {
  return (
    <main className="min-h-screen bg-white text-[#161616]">
      <header className="border-b border-[#E0E0E0] bg-white">
        <div className="mx-auto flex h-16 w-[min(1240px,calc(100%-32px))] items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center bg-[#161616] text-sm font-semibold text-white">TR</span>
            <span className="text-base font-semibold">天戎科技</span>
          </Link>
          <Link href="/#case" className="inline-flex items-center text-base font-semibold text-[#0F62FE] hover:text-[#0050E6]">
            <ArrowLeft className="mr-2 h-4 w-4" />
            返回实践案例
          </Link>
        </div>
      </header>

      <section className="border-b border-[#E0E0E0] bg-[#F4F8FC]">
        <div className="mx-auto grid min-h-[620px] w-[min(1240px,calc(100%-32px))] items-center gap-12 py-20 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-base font-semibold text-[#0F62FE]">实践案例</p>
            <h1 className="mt-5 max-w-2xl text-5xl font-semibold leading-tight md:text-6xl">物流园区机器人夜间巡检实践</h1>
            <p className="mt-7 max-w-xl text-lg leading-8 text-[#525252]">以园区道路、仓储外围和出入口为主要区域，持续验证机器人在真实夜间环境中的巡检与远程管理能力。</p>
            <Link href="/#contact" className="mt-9 inline-flex items-center text-base font-semibold text-[#0F62FE] hover:text-[#0050E6]">
              讨论类似项目
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
          <div className="overflow-hidden bg-white">
            <Image src={gallery[0][0]} alt={gallery[0][1]} width={1448} height={1086} className="h-full min-h-[360px] w-full object-cover md:min-h-[460px]" priority />
          </div>
        </div>
      </section>

      <section className="mx-auto grid w-[min(1240px,calc(100%-32px))] gap-12 py-20 lg:grid-cols-[0.7fr_1.3fr]">
        <div>
          <p className="text-base font-semibold text-[#0F62FE]">现场验证</p>
          <h2 className="mt-4 text-3xl font-semibold leading-tight md:text-4xl">从路线执行到远程管理</h2>
        </div>
        <div>
          <p className="max-w-3xl text-xl leading-9 text-[#1F4F82]">机器人按照预设路线巡查园区道路、仓库外围和重点区域，巡检画面与设备状态实时回传，为夜间连续巡检留下完整记录。</p>
          <div className="mt-10 border-y border-[#C7DBF2]">
            {deploymentPoints.map(([number, title, description]) => (
              <div key={number} className="grid gap-4 border-t border-[#C7DBF2] py-6 first:border-t-0 md:grid-cols-[48px_160px_1fr]">
                <span className="text-base font-semibold text-[#0F62FE]">{number}</span>
                <h3 className="text-xl font-semibold">{title}</h3>
                <p className="text-base leading-7 text-[#525252]">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-[#E0E0E0] bg-[#F4F4F4] py-20">
        <div className="mx-auto w-[min(1240px,calc(100%-32px))]">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-base font-semibold text-[#0F62FE]">现场视角</p>
              <h2 className="mt-3 text-3xl font-semibold md:text-4xl">同一项目中的不同巡检区域</h2>
            </div>
            <p className="max-w-xl text-base leading-7 text-[#525252]">道路、仓储外围和出入口分别对应不同的路线与观察角度。</p>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {gallery.map(([src, alt]) => (
              <figure key={src} className="overflow-hidden bg-white">
                <Image src={src} alt={alt} width={1448} height={1086} className="aspect-[1.2] w-full object-cover" />
                <figcaption className="border-t border-[#D8E6F5] px-5 py-4 text-base font-semibold text-[#1F4F82]">{alt}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#161616] py-20 text-white">
        <div className="mx-auto flex w-[min(1240px,calc(100%-32px))] flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-3xl font-semibold md:text-4xl">想在你的现场验证机器人巡检？</h2>
            <p className="mt-4 text-lg leading-8 text-white/70">提供现场环境和任务需求，我们可以一起评估本体、载荷与平台组合。</p>
          </div>
          <a href="mailto:contact@tianrongtech.com" className="inline-flex items-center text-lg font-semibold text-[#9CC4FF] hover:text-white">
            contact@tianrongtech.com
            <ArrowRight className="ml-2 h-5 w-5" />
          </a>
        </div>
      </section>
    </main>
  );
}
