"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import DotField from "@/components/DotField";

const DynamicHeroRobotPreview = dynamic(
  () => import("@/components/hero/hero-robot-preview").then((module) => module.HeroRobotPreview),
  { ssr: false }
);

const nav = [
  ["首页", "#top"],
  ["产品矩阵", "#matrix"],
  ["本体系列", "#bodies"],
  ["模块载荷", "#modules"],
  ["ROBOX", "#robox"],
  ["调度平台", "#rsp"],
  ["实践案例", "#case"],
  ["关于天戎", "#about"],
  ["联系我们", "#contact"]
];


const products = [
  {
    id: "robot-body",
    title: "机器人本体系列",
    tagline: "覆盖点足式与轮足式的移动平台",
    description: "提供小型、中型和大型四足及轮足机器人本体，可根据负载、续航、地形与任务需求选择合适配置。",
    image: "/images/generated/argos-body.png",
    target: "#robot-series",
    cta: "了解本体系列"
  },
  {
    id: "payload-modules",
    title: "任务载荷模块",
    tagline: "按任务灵活组合的功能模块",
    description: "可见光、热成像、气体检测、通信、计算和广播模块可独立选配，也可根据项目需要组合使用。",
    image: "/images/generated/modular-backpack.png",
    target: "#payload-modules",
    cta: "了解任务载荷"
  },
  {
    id: "robox",
    title: "ROBOX 远程控制盒",
    tagline: "连接机器人、现场网络与远程平台",
    description: "负责视频与设备数据回传、网络接入和远程控制，让现场机器人稳定接入上层平台。",
    image: "/images/generated/robox.png",
    target: "#robox",
    cta: "了解 ROBOX"
  },
  {
    id: "rsp",
    title: "机器人远程调度平台",
    tagline: "统一管理机器人、任务与现场数据",
    description: "集中完成地图管理、任务下发、设备监控和远程控制，适用于多设备、多点位巡检。",
    image: "/images/generated/mission-control-ui.png",
    target: "#rsp-platform",
    cta: "了解调度平台"
  },
  {
    id: "scenario",
    title: "场景部署方案",
    tagline: "让产品能力进入真实作业现场",
    description: "根据园区、仓储和厂区环境，组合机器人、任务载荷、远程接入与调度平台，形成可落地的巡检方案。",
    image: "/images/tianrong/logistics-route-a.png",
    target: "#case",
    cta: "查看实践案例"
  }
];

const robotBodies = [
  { model: "TR-S1", name: "小型四足平台", image: "/images/tianrong/final-assets/body-tr-s1.png", note: "适用于室内通道、轻量巡检。" },
  { model: "TR-M1", name: "中型四足平台", image: "/images/tianrong/final-assets/body-tr-m1.png", note: "适用于园区和安防的巡逻巡检。" },
  { model: "TR-L1", name: "大型四足平台", image: "/images/tianrong/final-assets/body-tr-l1.png", note: "面向高负载、长续航和复杂地形任务。" },
  { model: "TR-S1W", name: "小型轮足平台", image: "/images/tianrong/final-assets/body-tr-s1w.png", note: "适用于平整路面和短距离高频巡检。" },
  { model: "TR-M1W", name: "中型轮足平台", image: "/images/tianrong/final-assets/body-tr-m1w.png", note: "适用于园区道路、仓储通道和长距离巡检。" },
  { model: "TR-L1W", name: "大型轮足平台", image: "/images/tianrong/final-assets/body-tr-l1w.png", note: "适用于大范围场地和复杂路况下的连续作业。" }
];

const payloadModules = [
  { name: "可见光巡检载荷", tag: "视频巡检与远程查看", image: "/images/tianrong/final-assets/payload-visible-light.png", note: "用于常规视频巡检、点位复核和远程查看。" },
  { name: "热成像载荷", tag: "温度异常与设备状态识别", image: "/images/tianrong/final-assets/payload-thermal.png", note: "用于设备温度异常、热源变化和状态识别。" },
  { name: "气体检测载荷", tag: "危险环境与工业安全监测", image: "/images/tianrong/final-assets/payload-gas.png", note: "用于气体风险识别和工业现场安全监测。" },
  { name: "通信增强载荷", tag: "复杂现场网络接入", image: "/images/tianrong/final-assets/payload-communication.png", note: "用于弱网区域、复杂园区和远距链路增强。" },
  { name: "边缘计算载荷", tag: "现场数据处理与智能识别", image: "/images/tianrong/final-assets/payload-edge-compute.png", note: "用于现场推理、事件初筛和低延迟处理。" },
  { name: "广播交互载荷", tag: "远程喊话与现场交互", image: "/images/tianrong/final-assets/payload-broadcast.png", note: "用于安防巡逻、现场提示和远程交互。" }
];

const roboxFeatures = [
  ["现场设备接入", "统一接入机器人、摄像头和传感器，适配有线与无线网络环境。"],
  ["实时数据回传", "持续回传视频画面、机器人状态、任务进度和异常告警。"],
  ["远程诊断与控制", "连接机器人调度平台，支持远程查看设备状态、排查故障、调整配置和接管设备。"]
];

const rspFeatures = [
  ["地图与任务编排", "在统一地图中配置巡检点位、路线、执行时间和任务规则。"],
  ["多机器人协同调度", "根据机器人状态、位置和任务优先级分配任务，支持多区域协同运行。"],
  ["监控、告警与远程运维", "集中查看任务、设备和现场视频，处理异常并完成任务暂停、恢复和结果复盘。"]
];

const casePoints = [
  "机器人按照预设路线巡查园区道路、仓库外围和重点区域。",
  "巡检画面和设备状态实时回传，工作人员可远程查看和接管。",
  "夜间连续巡检减少重复人工巡查，也为异常情况留下完整记录。"
];

const caseImages = [
  ["/images/tianrong/final-assets/logistics-yard-road.png", "物流园区路线实践"],
  ["/images/tianrong/final-assets/logistics-warehouse-patrol.png", "仓储物流园区巡检路线"],
  ["/images/tianrong/final-assets/logistics-gate-patrol.png", "园区出入口巡检实践"]
];

const aboutItems = [
  "机器人本体与模块化硬件研发",
  "ROBOX 现场接入与远程控制",
  "机器人调度平台与系统集成",
  "为项目提供选型、接口和技术支持"
];

export function TianrongScenarioPage() {
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
        </div>
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
                机器人软硬件产品与技术集成商
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.65, delay: 0.16 }}
                className="mt-7 max-w-2xl text-lg font-medium leading-8 text-[#393939] md:text-xl"
              >
                聚焦机器人本体、任务载荷、ROBOX 远程控制盒与机器人调度平台，为合作伙伴提供可组合、可集成、可扩展的软硬件产品。
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

        <section className="relative min-h-[460px] overflow-hidden bg-[#161616] text-white md:min-h-[580px]">
          <LazyPatrolVideo />
          <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/30 to-black/5" />
          <div className="relative mx-auto flex min-h-[460px] w-[min(1240px,calc(100%-32px))] items-end pb-14 md:min-h-[620px] md:pb-20">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.7 }}
              className="max-w-2xl border-l-2 border-[#78A9FF] pl-5 md:pl-7"
            >
              <p className="text-sm font-semibold tracking-[0.16em] text-[#B9D4FF]">现场验证</p>
              <h2 className="mt-4 text-4xl font-semibold leading-tight md:text-6xl">
                让机器人进入
                <br />
                真实作业现场
                </h2>
              <p className="mt-5 max-w-xl text-lg leading-8 text-white/80">从移动平台、任务载荷到远程管理，产品能力在真实环境中协同工作。</p>
              <a href="#case" className="mt-7 inline-flex items-center text-base font-semibold text-white transition hover:text-[#B9D4FF]">
                查看实践案例
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </motion.div>
          </div>
        </section>

        <RevealSection id="matrix" className="bg-white py-20">
          <SectionHeading
            title="机器人巡检软硬件产品体系"
            description="从机器人本体、任务载荷到远程接入和调度平台，覆盖机器人巡检项目所需的核心产品。"
          />
          <ProductShowcase />
        </RevealSection>

        <RevealSection id="robot-series" className="border-b border-[#E0E0E0] bg-[#F4F4F4] py-20 md:py-24">
          <span id="bodies" className="block scroll-mt-20" />
          <SectionHeading
            title="点足式与轮足式机器人本体"
            description="提供小型、中型和大型平台，适配不同负载、地形和巡检任务。"
            align="left"
          />
          <div className="mt-12 grid gap-x-6 gap-y-10 sm:grid-cols-2 xl:grid-cols-3">
            {robotBodies.map((item, index) => (
              <motion.article
                key={item.name}
                tabIndex={0}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ delay: index * 0.04 }}
                className="group overflow-hidden bg-transparent transition duration-300 hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-[#0F62FE]/35"
              >
                <div className="relative aspect-[1.38] overflow-hidden bg-white">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-contain p-6 transition duration-500 group-hover:scale-[1.04]"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>
                <div className="pt-5">
                  <div className="text-sm font-semibold tracking-[0.12em] text-[#0F62FE]">{item.model}</div>
                  <h3 className="mt-2 text-2xl font-semibold">{item.name}</h3>
                  <p className="mt-2 max-h-0 overflow-hidden text-base leading-7 text-[#525252] opacity-0 transition-all duration-300 max-md:max-h-16 max-md:opacity-100 md:group-hover:max-h-16 md:group-hover:opacity-100 md:group-focus-within:max-h-16 md:group-focus-within:opacity-100">{item.note}</p>
                </div>
              </motion.article>
            ))}
          </div>
        </RevealSection>

        <RevealSection id="payload-modules" className="border-b border-[#E0E0E0] bg-white py-20 md:py-24">
          <span id="modules" className="block scroll-mt-20" />
          <SectionHeading
            title="面向巡检任务的模块化载荷"
            description="根据巡检、检测、通信和现场交互需求，灵活选择和组合不同功能模块。"
            align="left"
          />
          <div className="mt-12 grid gap-x-6 gap-y-10 sm:grid-cols-2 xl:grid-cols-3">
            {payloadModules.map((item, index) => (
              <motion.article
                key={item.name}
                tabIndex={0}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ delay: index * 0.04 }}
                className="group overflow-hidden bg-transparent transition duration-300 hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-[#0F62FE]/35"
              >
                <div className="relative aspect-[1.42] overflow-hidden bg-[#F4F8FC]">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-contain p-8 transition duration-500 group-hover:scale-[1.04]"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>
                <div className="pt-5">
                  <h3 className="text-2xl font-semibold">{item.name}</h3>
                  <p className="mt-2 text-base font-semibold text-[#0F62FE]">{item.tag}</p>
                  <p className="mt-2 max-h-0 overflow-hidden text-base leading-7 text-[#525252] opacity-0 transition-all duration-300 max-md:max-h-16 max-md:opacity-100 md:group-hover:max-h-16 md:group-hover:opacity-100 md:group-focus-within:max-h-16 md:group-focus-within:opacity-100">{item.note}</p>
                </div>
              </motion.article>
            ))}
          </div>
        </RevealSection>

        <RevealSection id="robox" className="bg-white py-20">
          <SectionHeading
            title="ROBOX 远程控制盒"
            description="将机器人、现场网络与远程管理平台安全连接，实现视频、设备状态和告警数据回传，并支持远程诊断、配置与控制。"
            align="left"
          />
          <div className="mt-12">
            <div className="grid lg:grid-cols-[0.95fr_1.05fr]">
              <div className="relative min-h-[500px] overflow-hidden bg-[#F4F8FC] md:min-h-[560px]">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(15,98,254,0.16),transparent_52%)]" />
                <div className="relative flex h-full min-h-[500px] items-center justify-center p-8 md:min-h-[560px] md:p-12">
                  <Image
                    src="/images/generated/robox.png"
                    alt="ROBOX 远程控制盒"
                    width={860}
                    height={640}
                    className="max-h-[360px] w-full object-contain"
                  />
                </div>
              </div>
              <div className="py-8 lg:pl-12 lg:pt-5">
                <div className="border-b border-[#E0E0E0] pb-6">
                  <div className="text-sm font-semibold tracking-[0.12em] text-[#0F62FE]">连接链路</div>
                  <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center">
                    {["机器人与现场设备", "ROBOX ", "机器人调度平台 "].map((item, index) => (
                      <div key={item} className="flex items-center gap-3">
                        <div className="px-1 py-3 text-base font-semibold text-[#393939]">{item}</div>
                        {index < 2 && <ArrowRight className="hidden h-4 w-4 shrink-0 text-[#0F62FE] md:block" />}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-2 grid gap-0">
                  {roboxFeatures.map(([title, description], index) => (
                    <FeatureItem key={title} index={index} title={title} description={description} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </RevealSection>

        <RevealSection id="rsp-platform" className="border-y border-[#E0E0E0] bg-[#F4F4F4] py-20">
          <span id="rsp" className="block scroll-mt-20" />
          <SectionHeading
            title="机器人调度平台"
            description="集中管理机器人、地图、任务和现场数据，支持多机器人任务编排、运行监控、异常处理和远程运维。"
            align="left"
          />
          <div className="mt-12 grid gap-10 lg:grid-cols-[1.18fr_0.82fr] lg:items-start">
            <div className="relative overflow-hidden bg-[#EAF4FF] p-3 md:p-5">
              <Image
                src="/images/tianrong/final-assets/rsp-platform-complete.png"
                alt="机器人调度平台真实界面"
                width={1672}
                height={941}
                className="max-h-[680px] w-full object-contain"
              />
            </div>
            <div className="py-2 lg:pl-3">
              <div className="grid gap-0">
                {rspFeatures.map(([title, description], index) => (
                  <FeatureItem
                    key={title}
                    index={index}
                    title={title}
                    description={description}
                  />
                ))}
              </div>
            </div>
          </div>
        </RevealSection>

        <section id="case" className="relative overflow-hidden bg-[#161616] text-white">
          <div className="relative min-h-[680px] md:min-h-[760px]">
            <Image
              src={caseImages[0][0]}
              alt={caseImages[0][1]}
              fill
              sizes="100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/45 to-black/10" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
            <div className="relative z-10 mx-auto flex min-h-[680px] w-[min(1240px,calc(100%-32px))] items-end py-14 md:min-h-[760px] md:py-20">
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.7 }}
                className="max-w-3xl"
              >
                <p className="text-sm font-semibold tracking-[0.16em] text-[#B9D4FF]">物流园区实践</p>
                <h2 className="mt-4 text-4xl font-semibold leading-tight md:text-6xl [text-wrap:balance]">物流园区机器人夜间巡检实践</h2>
                <p className="mt-5 max-w-2xl text-lg leading-8 text-white/80">以园区道路、仓储外围和重点点位为主要巡检区域，验证机器人连续作业与远程管理能力。</p>
                <div className="mt-8 grid gap-4 border-t border-white/25 pt-6 md:grid-cols-3">
                  {casePoints.map((item) => (
                    <p key={item} className="border-l border-[#78A9FF] pl-4 text-base leading-7 text-white/85">{item}</p>
                  ))}
                </div>
              </motion.div>
            </div>
            <div className="absolute right-4 top-4 z-10 grid w-28 grid-cols-2 gap-2 md:right-8 md:top-8 md:w-52">
              {caseImages.slice(1).map(([src, alt]) => (
                <div key={src} className="relative aspect-[1.2] overflow-hidden bg-black/30 ring-1 ring-white/35">
                  <Image src={src} alt={alt} fill sizes="(max-width: 768px) 14vw, 26vw" className="object-cover" />
                </div>
              ))}
            </div>
          </div>
        </section>

        <RevealSection id="about" className="border-y border-[#E0E0E0] bg-[#F4F4F4] py-20">
          <SectionHeading
            title="专注机器人产品与平台研发"
            description="围绕机器人本体、现场接入和调度平台，为项目提供从产品选型到系统集成的技术支持。"
            align="left"
          />
          <div className="mt-10 grid gap-3 md:grid-cols-2">
            {aboutItems.map((item) => (
              <div key={item} className="flex gap-3 border-t border-[#D8E6F5] py-5">
                <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-[#0F62FE]" />
                <p className="text-lg font-semibold">{item}</p>
              </div>
            ))}
          </div>
        </RevealSection>

        <section id="contact" className="bg-[#161616] py-20 text-white">
          <div className="mx-auto grid w-[min(1240px,calc(100%-32px))] gap-8 lg:grid-cols-[0.85fr_1.15fr]">
            <div>
              <h2 className="text-4xl font-semibold leading-tight md:text-6xl">为您的项目选择合适的机器人产品与平台</h2>
            </div>
            <div className="border-t border-white/20 pt-6 text-white">
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="合作方向" value="机器人本体 / 任务载荷 / ROBOX / 机器人调度平台" />
                <Field label="应用行业" value="安防 / 巡检 / 仓储 / 应急 " />
                <Field label="能力需求" value="硬件模块 / 软件平台 / 接口集成" />
                <Field label="项目阶段" value="评估 / 试点 / 批量" />
              </div>
              <Button asChild size="lg" className="mt-6 rounded-none bg-[#0F62FE] text-white shadow-none hover:bg-[#0050E6]">
                <a href="mailto:contact@tianrongtech.com">
                  联系天戎科技
                  <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>
        </section>

        <TianrongFooter />
      </main>
    </div>
  );
}

function ProductShowcase() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef<number | null>(null);
  const didDragRef = useRef(false);
  const activeProduct = products[active];

  useEffect(() => {
    if (paused) return;
    const timer = window.setInterval(() => {
      setActive((current) => (current + 1) % products.length);
    }, 5200);
    return () => window.clearInterval(timer);
  }, [paused]);

  function goTo(index: number) {
    const next = (index + products.length) % products.length;
    setActive(next);
    const container = scrollRef.current;
    const item = container?.children[next] as HTMLElement | undefined;
    item?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }

  function scrollToTarget(target: string) {
    document.querySelector(target)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function onMobileScroll() {
    const container = scrollRef.current;
    if (!container) return;
    const center = container.scrollLeft + container.clientWidth / 2;
    let next = active;
    let min = Number.POSITIVE_INFINITY;
    Array.from(container.children).forEach((child, index) => {
      const item = child as HTMLElement;
      const itemCenter = item.offsetLeft + item.offsetWidth / 2;
      const distance = Math.abs(center - itemCenter);
      if (distance < min) {
        min = distance;
        next = index;
      }
    });
    if (next !== active) setActive(next);
  }

  function getOffset(index: number) {
    const raw = index - active;
    if (raw > products.length / 2) return raw - products.length;
    if (raw < -products.length / 2) return raw + products.length;
    return raw;
  }

  return (
    <div className="mt-10 overflow-hidden bg-[linear-gradient(180deg,#F8FBFF_0%,#EEF6FF_100%)]">
      <div
        className="relative overflow-hidden"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,rgba(15,98,254,0.16),transparent_38%)]" />
        <div className="absolute inset-x-0 top-0 h-px bg-[#0F62FE]/25" />

        <div
          className="relative hidden h-[520px] touch-pan-y select-none md:block"
          onPointerDown={(event) => {
            dragStartRef.current = event.clientX;
            didDragRef.current = false;
            setPaused(true);
          }}
          onPointerUp={(event) => {
            const start = dragStartRef.current;
            dragStartRef.current = null;
            if (start === null) return;
            const distance = event.clientX - start;
            if (Math.abs(distance) > 48) {
              didDragRef.current = true;
              goTo(active + (distance < 0 ? 1 : -1));
            }
          }}
          onPointerCancel={() => {
            dragStartRef.current = null;
            didDragRef.current = false;
          }}
        >
          {products.map((product, index) => {
            const offset = getOffset(index);
            const hidden = Math.abs(offset) > 2;
            return (
              <button
                key={product.id}
                type="button"
                aria-label={`查看${product.title}`}
                onClick={() => {
                  if (didDragRef.current) {
                    didDragRef.current = false;
                    return;
                  }
                  goTo(index);
                }}
                className="absolute left-1/2 top-1/2 h-[390px] w-[52%] max-w-[720px] -translate-x-1/2 -translate-y-1/2 transition-all duration-500 ease-out"
                style={{
                  transform: `translate(-50%, -50%) translateX(${offset * 46}%) scale(${offset === 0 ? 1 : Math.abs(offset) === 1 ? 0.72 : 0.52})`,
                  opacity: hidden ? 0 : offset === 0 ? 1 : Math.abs(offset) === 1 ? 0.48 : 0.18,
                  filter: offset === 0 ? "none" : "blur(1px)",
                  zIndex: 20 - Math.abs(offset),
                  pointerEvents: hidden ? "none" : "auto"
                }}
              >
                <span className="absolute inset-x-10 bottom-8 h-16 bg-[#0F62FE]/12 blur-2xl" />
                <span className="relative flex h-full items-center justify-center border border-[#C7DBF2] bg-white/80 p-8 backdrop-blur">
                  <Image
                    src={product.image}
                    alt={product.title}
                    width={980}
                    height={720}
                    className="h-full w-full object-contain"
                    priority={index === 0}
                  />
                </span>
              </button>
            );
          })}

          <button
            type="button"
            aria-label="上一个产品"
            onClick={() => goTo(active - 1)}
            className="absolute left-6 top-1/2 z-30 grid h-12 w-12 -translate-y-1/2 place-items-center border border-[#C7DBF2] bg-white/90 text-[#0F62FE] backdrop-blur hover:bg-[#EAF4FF]"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            aria-label="下一个产品"
            onClick={() => goTo(active + 1)}
            className="absolute right-6 top-1/2 z-30 grid h-12 w-12 -translate-y-1/2 place-items-center border border-[#C7DBF2] bg-white/90 text-[#0F62FE] backdrop-blur hover:bg-[#EAF4FF]"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        <div
          ref={scrollRef}
          onScroll={onMobileScroll}
          onTouchStart={() => setPaused(true)}
          onTouchEnd={() => setPaused(false)}
          className="relative flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 py-8 md:hidden"
        >
          {products.map((product) => (
            <div key={product.id} className="w-[82%] shrink-0 snap-center border border-[#C7DBF2] bg-white/85 p-5">
              <div className="relative aspect-[1.28]">
                <Image src={product.image} alt={product.title} fill sizes="82vw" className="object-contain" />
              </div>
            </div>
          ))}
        </div>

        <div className="relative border-t border-[#D8E6F5] bg-white/86 p-6 backdrop-blur md:p-8">
          <div className="grid gap-6 lg:grid-cols-[0.72fr_1.28fr_auto] lg:items-end">
            <div>
              <div className="text-base font-semibold text-[#0F62FE]">产品 {String(active + 1).padStart(2, "0")}</div>
              <h3 className="mt-3 text-3xl font-semibold leading-tight md:text-4xl">{activeProduct.title}</h3>
            </div>
            <div>
              <div className="text-lg font-semibold text-[#1F4F82]">{activeProduct.tagline}</div>
              <p className="mt-3 max-w-3xl leading-7 text-[#525252]">{activeProduct.description}</p>
            </div>
            <Button asChild size="lg" className="w-fit rounded-none bg-[#0F62FE] text-white shadow-none hover:bg-[#0050E6]">
              <a
                href={activeProduct.target}
                onClick={(event) => {
                  event.preventDefault();
                  scrollToTarget(activeProduct.target);
                }}
              >
                {activeProduct.cta}
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </div>

          <div className="mt-6 flex gap-2">
            {products.map((product, index) => (
              <button
                key={product.id}
                type="button"
                aria-label={`切换到${product.title}`}
                onClick={() => goTo(index)}
                className={`h-1.5 transition-all ${index === active ? "w-10 bg-[#0F62FE]" : "w-4 bg-[#C7DBF2] hover:bg-[#78A9FF]"}`}
              />
            ))}
          </div>
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
        <LazyHeroRobotPreview />
      </div>
    </motion.div>
  );
}

function LazyHeroRobotPreview() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [shouldLoad, setShouldLoad] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const mobileQuery = window.matchMedia("(max-width: 767px)");
    const updateMobileState = () => setIsMobile(mobileQuery.matches);
    updateMobileState();

    if (!("IntersectionObserver" in window)) {
      if (!mobileQuery.matches) setShouldLoad(true);
      mobileQuery.addEventListener("change", updateMobileState);
      return () => mobileQuery.removeEventListener("change", updateMobileState);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || mobileQuery.matches) return;
        setShouldLoad(true);
        observer.disconnect();
      },
      { rootMargin: "300px 0px" }
    );

    observer.observe(element);
    mobileQuery.addEventListener("change", updateMobileState);

    return () => {
      observer.disconnect();
      mobileQuery.removeEventListener("change", updateMobileState);
    };
  }, []);

  return (
    <div ref={containerRef} className="relative h-full w-full">
      {shouldLoad ? <DynamicHeroRobotPreview /> : <HeroRobotPoster interactive={isMobile} onActivate={() => setShouldLoad(true)} />}
    </div>
  );
}

function HeroRobotPoster({ interactive, onActivate }: { interactive: boolean; onActivate: () => void }) {
  const poster = (
    <div className="relative h-full w-full">
      <Image
        src="/images/generated/argos-body.png"
        alt="天戎科技机器人本体"
        fill
        priority
        sizes="(max-width: 768px) 100vw, 50vw"
        className="object-contain p-8 md:p-12"
      />
      <div className="absolute inset-x-[16%] bottom-[16%] h-12 rounded-full bg-[#0F62FE]/15 blur-2xl" />
    </div>
  );

  if (!interactive) return poster;

  return (
    <button type="button" onClick={onActivate} className="group relative h-full w-full text-left">
      {poster}
      <span className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/90 px-4 py-2 text-sm font-semibold text-[#0F62FE] shadow-sm transition group-hover:bg-white">
        查看 3D 模型
      </span>
    </button>
  );
}

function LazyPatrolVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [shouldLoad, setShouldLoad] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(reducedMotionQuery.matches);

    if (!("IntersectionObserver" in window)) {
      setShouldLoad(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoad(true);
          if (!reducedMotionQuery.matches) void video.play().catch(() => undefined);
        } else {
          video.pause();
        }
      },
      { rootMargin: "300px 0px" }
    );

    const handleVisibility = () => {
      if (document.hidden) video.pause();
      else if (!reducedMotionQuery.matches && shouldLoad) void video.play().catch(() => undefined);
    };

    observer.observe(video);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", handleVisibility);
      video.pause();
    };
  }, [shouldLoad]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !shouldLoad) return;
    video.load();
    if (!reducedMotion) void video.play().catch(() => undefined);
  }, [shouldLoad, reducedMotion]);

  return (
    <video
      ref={videoRef}
      className="absolute inset-0 h-full w-full object-cover"
      autoPlay={!reducedMotion}
      muted
      loop
      playsInline
      preload="none"
      poster="/images/tianrong/industrial-inspection.png"
    >
      {shouldLoad && <source src="/videos/tianrong/s07-complex-scene-2.mp4" type="video/mp4" />}
    </video>
  );
}

function RevealSection({ id, className, children }: { id?: string; className: string; children: React.ReactNode }) {
  return (
    <motion.section id={id} className={className} initial={{ opacity: 0, y: 32 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-90px" }} transition={{ duration: 0.55 }}>
      <div className="mx-auto w-[min(1240px,calc(100%-32px))]">{children}</div>
    </motion.section>
  );
}

function SectionHeading({ title, description, align = "center" }: { title: React.ReactNode; description?: string; align?: "center" | "left" }) {
  const isLeftAligned = align === "left";

  return (
    <div className={`section-heading ${isLeftAligned ? "max-w-3xl text-left" : "mx-auto max-w-4xl text-center"}`}>
      <h2 className="section-title text-4xl font-semibold leading-tight md:text-5xl">{title}</h2>
      {description && <p className={`${isLeftAligned ? "mx-0" : "mx-auto"} section-description mt-5 max-w-3xl text-lg leading-8 text-[#525252]`}>{description}</p>}
    </div>
  );
}

function TianrongFooter() {
  return (
    <footer className="border-t border-[#E0E0E0] bg-white">
      <div className="mx-auto grid w-[min(1240px,calc(100%-32px))] gap-10 py-12 md:grid-cols-[1.2fr_0.8fr_0.8fr]">
        <div>
          <Link href="#top" className="inline-flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center bg-[#161616] text-sm font-semibold text-white">TR</span>
            <span className="text-base font-semibold">天戎科技</span>
          </Link>
          <p className="mt-5 max-w-sm text-base leading-7 text-[#525252]">机器人本体、任务载荷、现场接入与调度平台。</p>
        </div>
        <div>
          <h2 className="text-base font-semibold text-[#161616]">快速浏览</h2>
          <div className="mt-4 flex flex-col items-start gap-3 text-base text-[#525252]">
            <a href="#matrix" className="hover:text-[#0F62FE]">产品矩阵</a>
            <a href="#case" className="hover:text-[#0F62FE]">实践案例</a>
            <a href="#contact" className="hover:text-[#0F62FE]">联系我们</a>
          </div>
        </div>
        <div>
          <h2 className="text-base font-semibold text-[#161616]">联系天戎</h2>
          <a href="mailto:contact@tianrongtech.com" className="mt-4 inline-block whitespace-nowrap text-base text-[#525252] hover:text-[#0F62FE]">contact@tianrongtech.com</a>
        </div>
      </div>
      <div className="border-t border-[#E0E0E0] py-5 text-center text-sm text-[#737373]">© 2026 天戎科技</div>
    </footer>
  );
}

function FeatureItem({
  index,
  title,
  description,
  className = ""
}: {
  index: number;
  title: string;
  description: string;
  className?: string;
}) {
  return (
    <article className={`feature-item border-t border-[#D8E6F5] pt-4 ${className}`}>
      <div className="flex gap-3">
        <span className="shrink-0 text-base font-semibold text-[#0F62FE]">{String(index + 1).padStart(2, "0")}</span>
        <div>
          <h3 className="text-lg font-semibold text-[#161616]">{title}</h3>
          <p className="card-description mt-2 text-base leading-7 text-[#525252]">{description}</p>
        </div>
      </div>
    </article>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-t border-white/15 py-4">
      <div className="text-base font-semibold text-[#9CC4FF]">{label}</div>
      <div className="mt-2 text-base leading-7 text-white/75">{value}</div>
    </div>
  );
}
