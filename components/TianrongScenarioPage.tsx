"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Menu, X } from "lucide-react";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import DotField from "@/components/DotField";
import { HeroRobotPreview } from "@/components/hero/hero-robot-preview";

const nav = [
  ["首页", "#top"],
  ["产品", "#matrix"],
  ["能力链路", "#composition"],
  ["案例", "#case"],
  ["合作", "#contact"]
];


const products = [
  {
    id: "robot-body",
    title: "机器人本体",
    tagline: "覆盖足式与轮足式的移动平台",
    description: "提供不同尺寸和运动形态的平台，按负载、地形与任务需求进行选型。",
    image: "/images/generated/argos-body.png",
    target: "/products/body",
    cta: "查看本体"
  },
  {
    id: "payload-modules",
    title: "任务载荷",
    tagline: "按任务灵活组合的功能模块",
    description: "围绕视频、检测、通信和现场交互，灵活组合不同功能模块。",
    image: "/images/generated/modular-backpack.png",
    target: "/products/payload",
    cta: "查看载荷"
  },
  {
    id: "robox",
    title: "ROBOX 接入网关",
    tagline: "连接机器人、现场网络与远程平台",
    description: "负责视频与设备数据回传、网络接入和远程控制，让现场机器人稳定接入上层平台。",
    image: "/images/generated/robox.png",
    target: "/products/robox",
    cta: "查看 ROBOX"
  },
  {
    id: "rsp",
    title: "RSP 调度平台",
    tagline: "统一管理机器人、任务与现场数据",
    description: "集中完成地图管理、任务下发、设备监控和远程控制，适用于多设备、多点位巡检。",
    image: "/images/generated/mission-control-ui.png",
    target: "/products/rsp",
    cta: "查看 RSP"
  }
];

const matrixFlow = [
  ["机器人本体", "/products/body"],
  ["任务载荷", "/products/payload"],
  ["ROBOX 接入", "/products/robox"],
  ["RSP 调度", "/products/rsp"]
] as const;

export function TianrongScenarioPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [menuOpen]);

  return (
    <div id="top" className="min-h-screen bg-white text-[#161616]">
      <header className="sticky top-0 z-50 border-b border-[#E0E0E0] bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 w-[min(1240px,calc(100%-32px))] items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center bg-[#161616] text-sm font-semibold text-white">TR</span>
            <span className="text-base font-semibold">天戎科技</span>
          </Link>
          <nav className="hidden items-center gap-5 text-[15px] text-[#525252] lg:flex">
            {nav.map(([label, href]) => (
              <a key={label} href={href} className="hover:text-[#0F62FE]">
                {label}
              </a>
            ))}
          </nav>
          <button
            type="button"
            className="grid h-10 w-10 place-items-center text-[#161616] lg:hidden"
            aria-label={menuOpen ? "关闭菜单" : "打开菜单"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
        {menuOpen && (
          <nav className="border-t border-[#E0E0E0] bg-white px-4 py-3 lg:hidden">
            {nav.map(([label, href]) => (
              <a key={label} href={href} onClick={() => setMenuOpen(false)} className="block border-b border-[#F0F0F0] py-4 text-base font-semibold text-[#393939] last:border-b-0">
                {label}
              </a>
            ))}
          </nav>
        )}
      </header>

      <main>
        <section className="relative overflow-hidden border-b border-[#E0E0E0] bg-[#F4F4F4]">
          <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_74%_54%,rgba(37,99,235,0.28),transparent_38%),linear-gradient(135deg,#ffffff_0%,#f3f8ff_46%,#dbeafe_100%)]" />
          <div
            className="pointer-events-none absolute inset-0 z-[1] opacity-90"
            style={{
              WebkitMaskImage: "radial-gradient(ellipse 68% 82% at 74% 48%, black 0%, rgba(0,0,0,0.92) 42%, rgba(0,0,0,0.28) 72%, transparent 100%)",
              maskImage: "radial-gradient(ellipse 68% 82% at 74% 48%, black 0%, rgba(0,0,0,0.92) 42%, rgba(0,0,0,0.28) 72%, transparent 100%)"
            }}
          >
            <DotField
              dotRadius={1.8}
              dotSpacing={12}
              bulgeStrength={115}
              glowRadius={180}
              sparkle={false}
              waveAmplitude={0}
              cursorRadius={650}
              cursorForce={0.16}
              bulgeOnly
              gradientFrom="rgba(0, 82, 255, 0.9)"
              gradientTo="rgba(0, 180, 255, 0.55)"
              glowColor="#93c5fd"
            />
          </div>
          <div className="relative z-10 mx-auto grid min-h-[calc(100vh-4rem)] w-[min(1240px,calc(100%-32px))] items-center gap-8 py-16 lg:grid-cols-[0.8fr_1.2fr]">
            <div className="relative z-10">
              <motion.h1
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.65, delay: 0.08 }}
                className="max-w-4xl text-5xl font-light leading-[1.08] md:text-6xl"
              >
                机器人核心产品与技术底座
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.65, delay: 0.16 }}
                className="mt-7 max-w-2xl text-lg font-medium leading-8 text-[#393939] md:text-xl"
              >
                聚焦机器人本体、任务载荷、ROBOX远程接入与RSP调度平台，为合作伙伴提供可组合、可集成、可扩展的软硬件产品。
              </motion.p>
              <div className="mt-8">
                <Button asChild size="lg" className="rounded-none bg-[#0F62FE] text-white shadow-none hover:bg-[#0050E6]">
                  <a href="#matrix">
                    查看产品矩阵
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              </div>
            </div>

            <ProductStage />
          </div>
        </section>

        <RevealSection id="matrix" className="bg-white py-24">
          <SectionHeading
            title="机器人巡检软硬件产品体系"
            description="从移动平台到现场接入和任务管理，按项目需要组合机器人产品与软件能力。"
          />
          <ProductShowcase />
          <div id="composition" className="mt-20 border-t border-[#D8E6F5] pt-8">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <h3 className="text-2xl font-semibold">一套产品，连接现场与平台</h3>
              <p className="text-base text-[#525252]">本体、载荷、接入与调度可以独立部署，也可以组合使用。</p>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-4 text-xl font-semibold">
              {matrixFlow.map(([label, href], index) => (
                <div key={label} className="flex items-center gap-5">
                  <Link href={href} className="transition hover:text-[#0F62FE]">
                    {label}
                  </Link>
                  {index < matrixFlow.length - 1 && <ArrowRight className="h-5 w-5 text-[#0F62FE]" />}
                </div>
              ))}
            </div>
          </div>
        </RevealSection>

        <RevealSection id="case" className="border-y border-[#E0E0E0] bg-[#F4F4F4] py-24">
          <SectionHeading
            title="物流园区机器人夜间巡检实践"
            description="从园区道路到仓储外围，持续验证机器人在真实夜间环境中的巡检与远程管理能力。"
          />
          <div className="mt-12 grid gap-10 lg:grid-cols-[1.3fr_0.7fr] lg:items-center">
            <div className="relative overflow-hidden bg-white">
              <Image src="/images/tianrong/final-assets/logistics-yard-road.png" alt="物流园区机器人夜间巡检" width={1448} height={1086} className="h-full min-h-[360px] w-full object-cover" />
            </div>
            <div>
              <p className="text-xl font-semibold leading-9 text-[#1F4F82]">机器人按照预设路线巡查园区道路、仓库外围和重点区域，巡检画面与设备状态实时回传。</p>
              <div className="mt-8 divide-y divide-[#C7DBF2] border-y border-[#C7DBF2]">
                {["覆盖道路、仓储外围与重点点位", "支持夜间连续巡检与远程接管", "根据现场网络和路线持续优化部署"].map((item, index) => (
                  <div key={item} className="flex gap-4 py-5">
                    <span className="text-base font-semibold text-[#0F62FE]">{String(index + 1).padStart(2, "0")}</span>
                    <p className="text-base leading-7 text-[#393939]">{item}</p>
                  </div>
                ))}
              </div>
              <Link href="/cases/logistics" className="mt-8 inline-flex items-center text-base font-semibold text-[#0F62FE] hover:text-[#0050E6]">
                查看完整案例
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>
        </RevealSection>

        <section id="contact" className="bg-[#161616] py-24 text-white">
          <div className="mx-auto grid w-[min(1240px,calc(100%-32px))] gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
            <div>
              <h2 className="max-w-2xl text-4xl font-semibold leading-tight md:text-6xl">为项目选择合适的机器人产品与平台</h2>
              <p className="mt-6 max-w-xl text-lg leading-8 text-white/70">从本体选型、载荷组合到现场接入与平台集成，和我们一起确定适合项目阶段的产品方案。</p>
            </div>
            <div className="border-t border-white/20 pt-6">
              <p className="text-base leading-8 text-white/70">合作方向：机器人本体 · 任务载荷 · ROBOX 接入 · RSP 平台集成</p>
              <a href="mailto:contact@tianrongtech.com" className="mt-8 inline-flex items-center text-lg font-semibold text-[#9CC4FF] hover:text-white">
                contact@tianrongtech.com
                <ArrowRight className="ml-2 h-5 w-5" />
              </a>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function ProductShowcase() {
  const [active, setActive] = useState(0);
  const activeProduct = products[active];

  return (
    <div className="mt-12 grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
      <div className="relative min-h-[360px] overflow-hidden bg-[#F4F8FC] md:min-h-[500px]">
        <div className="absolute inset-0 tianrong-product-grid opacity-25" />
        <div className="absolute bottom-8 left-8 text-base font-semibold text-[#1F4F82]">{activeProduct.tagline}</div>
        <Image src={activeProduct.image} alt={activeProduct.title} fill className="relative object-contain p-10 md:p-16" sizes="(max-width: 1024px) 100vw, 60vw" priority={active === 0} />
      </div>
      <div>
        <div className="border-b border-[#D8E6F5] pb-7">
          <div className="text-base font-semibold text-[#0F62FE]">核心产品 {String(active + 1).padStart(2, "0")}</div>
          <h3 className="mt-3 text-3xl font-semibold leading-tight md:text-4xl">{activeProduct.title}</h3>
          <p className="mt-4 max-w-xl text-lg leading-8 text-[#525252]">{activeProduct.description}</p>
          <Link href={activeProduct.target} className="mt-6 inline-flex items-center text-base font-semibold text-[#0F62FE] hover:text-[#0050E6]">
            {activeProduct.cta}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
        <div className="mt-2 divide-y divide-[#D8E6F5]">
          {products.map((product, index) => (
            <button
              key={product.id}
              type="button"
              aria-pressed={index === active}
              onClick={() => setActive(index)}
              className={`group flex w-full items-center gap-4 py-5 text-left transition ${index === active ? "text-[#0F62FE]" : "text-[#161616] hover:text-[#0F62FE]"}`}
            >
              <span className="text-base font-semibold text-[#0F62FE]">{String(index + 1).padStart(2, "0")}</span>
              <span className="flex-1">
                <span className="block text-xl font-semibold">{product.title}</span>
                <span className="mt-1 block text-base text-[#525252]">{product.tagline}</span>
              </span>
              <ArrowRight className="h-5 w-5 shrink-0 transition group-hover:translate-x-1" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function ProductStage() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.7 }}
      className="relative z-10 h-[420px] translate-y-3 overflow-visible md:h-[520px] lg:translate-x-10 lg:translate-y-8"
    >
      <div className="absolute inset-x-[12%] bottom-[14%] h-16 rounded-[50%] bg-[radial-gradient(ellipse,rgba(15,23,42,0.2)_0%,rgba(15,98,254,0.16)_38%,transparent_72%)] blur-2xl" />
      <div className="relative z-10 h-full w-full">
        <HeroRobotPreview />
      </div>
    </motion.div>
  );
}

function RevealSection({ id, className, children }: { id?: string; className: string; children: React.ReactNode }) {
  return (
    <motion.section id={id} className={className} initial={{ opacity: 0, y: 32 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-90px" }} transition={{ duration: 0.55 }}>
      <div className="mx-auto w-[min(1240px,calc(100%-32px))]">{children}</div>
    </motion.section>
  );
}

function SectionHeading({ title, description }: { title: string; description?: string }) {
  return (
    <div className="section-heading max-w-3xl">
      <h2 className="section-title text-4xl font-semibold leading-tight md:text-5xl">{title}</h2>
      {description && <p className="section-description mt-5 max-w-3xl text-lg leading-8 text-[#525252]">{description}</p>}
    </div>
  );
}
