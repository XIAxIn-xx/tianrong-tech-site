"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Layers3,
  MonitorCog,
  ShieldCheck
} from "lucide-react";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import DotField from "@/components/DotField";
import { HeroRobotPreview } from "@/components/hero/hero-robot-preview";

const nav = [
  ["首页", "#top"],
  ["产品矩阵", "#matrix"],
  ["本体系列", "#bodies"],
  ["模块能力", "#modules"],
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
    tagline: "面向巡检与安防任务的四足移动平台",
    description: "覆盖不同尺寸与运动形态的四足机器人本体，可根据园区、厂区、仓储和重点设施巡检需求，选择标准足式或轮足式配置。",
    image: "/images/generated/argos-body.png",
    target: "#robot-series",
    cta: "了解本体系列"
  },
  {
    id: "payload-modules",
    title: "任务载荷模块",
    tagline: "让同一台机器人适配不同任务",
    description: "支持可见光巡检、热成像、气体检测、通信增强、边缘计算和广播交互等模块组合，提升机器人在不同场景下的任务扩展能力。",
    image: "/images/generated/modular-backpack.png",
    target: "#payload-modules",
    cta: "了解任务载荷"
  },
  {
    id: "robox",
    title: "ROBOX 远程接入",
    tagline: "机器人现场接入与远程操控基础设施",
    description: "连接机器人、现场网络与远程操控平台，提供视频回传、网络中继、远程接管和平台联动能力，让机器人从单机设备升级为可运营系统。",
    image: "/images/generated/robox.png",
    target: "#robox",
    cta: "了解 ROBOX"
  },
  {
    id: "rsp",
    title: "RSP 调度平台",
    tagline: "统一管理机器人任务、设备与数据",
    description: "面向多机器人、多点位和多任务巡检场景，支持任务编排、远程调度、日志留痕、设备状态管理和运维协同。",
    image: "/images/generated/mission-control-ui.png",
    target: "#rsp-platform",
    cta: "了解 RSP 平台"
  },
  {
    id: "scenario",
    title: "场景部署方案",
    tagline: "从产品能力到真实场景落地",
    description: "将机器人本体、任务载荷、ROBOX 和 RSP 平台组合到园区、仓储、厂区和重点设施巡检任务中，形成可部署、可运营、可复制的机器人巡检方案。",
    image: "/images/tianrong/logistics-route-a.png",
    target: "#case",
    cta: "查看实践案例"
  }
];

const matrixFlow = ["机器人本体", "任务载荷", "远程接入", "调度平台", "场景部署"];

const robotBodies = [
  { name: "小型四足机器人", image: "/images/tianrong/final-assets/body-tr-s1.png", note: "适合室内通道、轻量巡检和教育展示。" },
  { name: "中型四足机器人", image: "/images/tianrong/final-assets/body-tr-m1.png", note: "适合园区巡检、安防巡逻和工业点位巡检。" },
  { name: "大型四足机器人", image: "/images/tianrong/final-assets/body-tr-l1.png", note: "适合更高负载、更长续航和复杂地形任务。" },
  { name: "小型轮足机器人", image: "/images/tianrong/final-assets/body-tr-s1w.png", note: "适合平整通道和短距离高频巡检。" },
  { name: "中型轮足机器人", image: "/images/tianrong/final-assets/body-tr-m1w.png", note: "适合园区道路、仓储通道和长距离路线。" },
  { name: "大型轮足机器人", image: "/images/tianrong/final-assets/body-tr-l1w.png", note: "适合复杂场地中兼顾效率与通过能力。" }
];

const bodyDimensions = ["尺寸等级", "负载能力", "续航能力", "地形适应", "适配场景", "可扩展接口"];

const payloadModules = [
  { name: "可见光巡检载荷", tag: "视频巡检与远程查看", image: "/images/tianrong/final-assets/payload-visible-light.png", note: "用于常规视频巡检、点位复核和远程查看。" },
  { name: "热成像载荷", tag: "温度异常与设备状态识别", image: "/images/tianrong/final-assets/payload-thermal.png", note: "用于设备温度异常、热源变化和状态识别。" },
  { name: "气体检测载荷", tag: "危险环境与工业安全监测", image: "/images/tianrong/final-assets/payload-gas.png", note: "用于气体风险识别和工业现场安全监测。" },
  { name: "通信增强载荷", tag: "复杂现场网络接入", image: "/images/tianrong/final-assets/payload-communication.png", note: "用于弱网区域、复杂园区和远距链路增强。" },
  { name: "边缘计算载荷", tag: "现场数据处理与智能识别", image: "/images/tianrong/final-assets/payload-edge-compute.png", note: "用于现场推理、事件初筛和低延迟处理。" },
  { name: "广播交互载荷", tag: "远程喊话与现场交互", image: "/images/tianrong/final-assets/payload-broadcast.png", note: "用于安防巡逻、现场提示和远程交互。" }
];

const rspFeatures = ["地图管理", "任务调度", "设备管理", "告警联动", "数据回传", "报告生成", "多终端访问", "远程控制入口"];

const casePoints = [
  "围绕物流园区道路、仓储外围与重点点位进行机器人巡检实践。",
  "验证四足机器人在园区巡检、任务执行、远程查看与数据留痕中的适配能力。",
  "为后续安防、巡检、仓储和应急等行业方案提供软硬件能力样板。"
];

const caseImages = [
  ["/images/tianrong/final-assets/logistics-yard-road.png", "物流园区路线实践"],
  ["/images/tianrong/final-assets/logistics-warehouse-patrol.png", "仓储物流园区巡检路线"],
  ["/images/tianrong/final-assets/logistics-gate-patrol.png", "园区出入口巡检实践"]
];

const aboutItems = [
  "聚焦机器人本体系列与模块化硬件能力",
  "提供标准足端模块、轮足运动模块与扩展接口",
  "建设机器人调度平台和 ROBOX 盒子等现场接入能力",
  "为行业解决方案伙伴输出机器人能力底座"
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
          <nav className="hidden items-center gap-5 text-sm text-[#525252] lg:flex">
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

        <RevealSection id="matrix" className="bg-white py-20">
          <SectionTitle eyebrow="产品矩阵" title="一套面向机器人巡检部署的软硬件能力体系" />
          <ProductShowcase />
          <div className="mt-6 text-sm font-semibold text-[#0F62FE]">从本体到场景的部署链路</div>
          <div className="mt-3 grid border border-[#E0E0E0] bg-[#E0E0E0] text-sm font-semibold text-[#525252] md:grid-cols-5">
            {matrixFlow.map((item, index) => (
              <div key={item} className="bg-[#F4F4F4] p-4">
                <div className="text-xs text-[#8C8C8C]">步骤 {String(index + 1).padStart(2, "0")}</div>
                <div className="mt-3 flex items-center justify-between gap-3">
                  <span>{item}</span>
                  {index < matrixFlow.length - 1 && <ArrowRight className="h-4 w-4 shrink-0 text-[#0F62FE]" />}
                </div>
              </div>
            ))}
          </div>
        </RevealSection>

        <RevealSection id="robot-series" className="border-y border-[#E0E0E0] bg-[#F4F4F4] py-20">
          <span id="bodies" className="block scroll-mt-20" />
          <SectionTitle eyebrow="机器人本体系列" title="按尺寸、任务和运动形态配置的本体家族" />
          <p className="mt-6 max-w-4xl text-xl leading-8 text-[#393939]">
            覆盖标准足式与轮足式配置，按尺寸、负载、续航和场景需求组合，为巡检、安防、仓储和重点设施任务提供稳定移动底座。
          </p>
          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {robotBodies.map((item, index) => (
              <motion.article
                key={item.name}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ delay: index * 0.04 }}
                className="group overflow-hidden border border-[#D8E6F5] bg-[linear-gradient(180deg,#FFFFFF_0%,#EEF6FF_100%)] transition duration-300 hover:-translate-y-1 hover:border-[#78A9FF] hover:shadow-[0_18px_54px_rgba(15,98,254,0.12)]"
              >
                <div className="relative aspect-[1.28] overflow-hidden">
                  <div className="absolute inset-0 tianrong-product-grid opacity-25" />
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-contain p-5 transition duration-300 group-hover:scale-[1.05]"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>
                <div className="border-t border-[#D8E6F5] bg-white/86 p-5">
                  <h3 className="text-2xl font-semibold">{item.name}</h3>
                  <p className="mt-3 text-sm leading-6 text-[#525252] opacity-100 transition md:opacity-0 md:group-hover:opacity-100">{item.note}</p>
                </div>
              </motion.article>
            ))}
          </div>
          <div className="mt-4 grid border border-[#E0E0E0] bg-[#E0E0E0] text-sm font-semibold text-[#525252] sm:grid-cols-3 lg:grid-cols-6">
            {bodyDimensions.map((item) => (
              <span key={item} className="bg-white p-4">{item}</span>
            ))}
          </div>
        </RevealSection>

        <RevealSection id="payload-modules" className="border-y border-[#E0E0E0] bg-[#F4F4F4] py-20">
          <span id="modules" className="block scroll-mt-20" />
          <SectionTitle eyebrow="任务载荷模块" title="决定机器人能执行什么任务" />
          <div className="mt-8 flex items-start gap-4 border border-[#D8E6F5] bg-white p-6">
            <Layers3 className="mt-1 h-7 w-7 shrink-0 text-[#0F62FE]" />
            <p className="max-w-4xl text-lg leading-8 text-[#393939]">
              通过模块化载荷和背负式扩展，同一台机器人可适配巡检、安防、检测、通信、计算和现场交互等不同任务。
            </p>
          </div>
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {payloadModules.map((item, index) => (
              <motion.article
                key={item.name}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ delay: index * 0.04 }}
                className="group overflow-hidden border border-[#D8E6F5] bg-white transition duration-300 hover:-translate-y-1 hover:border-[#78A9FF] hover:shadow-[0_18px_54px_rgba(15,98,254,0.1)]"
              >
                <div className="relative aspect-[1.36] overflow-hidden bg-[linear-gradient(180deg,#FFFFFF_0%,#EEF6FF_100%)]">
                  <div className="absolute inset-0 tianrong-product-grid opacity-20" />
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-contain p-8 transition duration-300 group-hover:scale-[1.04]"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>
                <div className="border-t border-[#D8E6F5] p-5">
                  <h3 className="text-2xl font-semibold">{item.name}</h3>
                  <p className="mt-2 text-sm font-semibold text-[#0F62FE]">{item.tag}</p>
                  <p className="mt-3 text-sm leading-6 text-[#525252] opacity-100 transition md:opacity-0 md:group-hover:opacity-100">{item.note}</p>
                </div>
              </motion.article>
            ))}
          </div>
        </RevealSection>

        <RevealSection id="robox" className="bg-white py-20">
          <SectionTitle eyebrow="ROBOX 远程接入" title="机器人现场接入与远程操控基础设施" />
          <div className="mt-8 border border-[#E0E0E0] bg-white">
            <div className="grid border-b border-[#E0E0E0] lg:grid-cols-[0.95fr_1.05fr]">
              <div className="relative min-h-[460px] overflow-hidden border-b border-[#E0E0E0] bg-[#F4F4F4] lg:border-b-0 lg:border-r">
                <div className="absolute inset-0 tianrong-product-grid opacity-40" />
                <div className="absolute left-6 top-6 z-10 border border-[#E0E0E0] bg-white px-3 py-2 text-sm text-[#525252]">
                  现场接入网关
                </div>
                <div className="relative flex h-full min-h-[460px] items-center justify-center p-10">
                  <Image
                    src="/images/generated/robox.png"
                    alt="ROBOX 盒子"
                    width={860}
                    height={640}
                    className="max-h-[360px] w-full object-contain"
                  />
                </div>
              </div>
              <div className="p-8">
                <p className="max-w-3xl text-xl leading-8 text-[#393939]">
                  ROBOX 决定机器人如何连接和被远程接管。它连接机器人、现场网络与远程操控平台，为视频回传、网络中继、远程接管和平台联动提供基础设施。
                </p>
                <div className="mt-8 grid gap-px bg-[#E0E0E0] md:grid-cols-2">
                  {["视频回传", "远程接管", "网络接入", "设备状态转发", "平台联动", "边缘部署"].map((item) => (
                    <div key={item} className="bg-[#F4F4F4] p-5 text-lg font-semibold text-[#161616]">{item}</div>
                  ))}
                </div>
              </div>
            </div>
            <div className="grid bg-[#E0E0E0] md:grid-cols-4">
              {[
                ["网络接口", "以太网 / 无线链路 / 现场网关"],
                ["视频输入", "机器人视频流 / 巡检画面回传"],
                ["控制接口", "远程接管 / 平台调度 / 设备联动"],
                ["电源输入", "现场部署电源方案"],
                ["工作温度", "园区与工业现场环境"],
                ["安装方式", "机柜 / 现场设备箱 / 移动部署"],
                ["适配对象", "四足机器人 / 移动机器人 / 巡检设备"],
                ["平台联动", "机器人调度平台"]
              ].map(([label, value]) => (
                <div key={label} className="bg-white p-5">
                  <div className="text-sm font-semibold text-[#0F62FE]">{label}</div>
                  <div className="mt-3 text-sm leading-6 text-[#525252]">{value}</div>
                </div>
              ))}
            </div>
          </div>
        </RevealSection>

        <RevealSection id="rsp-platform" className="border-y border-[#E0E0E0] bg-[#F4F4F4] py-20">
          <span id="rsp" className="block scroll-mt-20" />
          <SectionTitle eyebrow="RSP 调度平台" title="机器人任务调度与运营管理平台" />
          <div className="mt-8 grid border border-[#E0E0E0] bg-[#E0E0E0] lg:grid-cols-[1.1fr_0.9fr]">
            <div className="relative overflow-hidden bg-white p-6">
              <div className="mb-4 flex items-center gap-3 text-sm font-semibold text-[#525252]">
                <MonitorCog className="h-5 w-5 text-[#0F62FE]" />
                任务调度界面
              </div>
              <Image
                src="/images/tianrong/final-assets/rsp-platform-complete.png"
                alt="机器人调度平台真实界面"
                width={1672}
                height={941}
                className="max-h-[680px] w-full object-contain"
              />
            </div>
            <div className="grid bg-white">
              <div className="border-b border-[#E0E0E0] p-8">
                <h3 className="max-w-xl text-4xl font-semibold leading-tight">用真实平台界面承载地图、任务、设备和远程控制入口。</h3>
                <p className="mt-5 leading-8 text-[#525252]">
                  RSP 决定机器人如何被统一调度和运营。面向多机器人、多点位和多任务巡检场景，支持任务编排、远程调度、日志留痕、设备状态管理和运维协同。
                </p>
              </div>
              <div className="grid gap-px bg-[#E0E0E0] sm:grid-cols-2">
                {rspFeatures.map((item) => (
                  <span key={item} className="bg-[#F4F4F4] p-4 text-sm font-semibold text-[#525252]">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </RevealSection>

        <RevealSection id="case" className="bg-white py-20">
          <SectionTitle eyebrow="实践案例" title="物流园区巡检实践" />
          <div className="mt-12 grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
            <div className="border border-[#161616] bg-[#161616] p-8 text-white">
              <ShieldCheck className="h-10 w-10 text-[#78A9FF]" />
              <h3 className="mt-24 text-4xl font-semibold leading-tight">围绕物流园区验证机器人本体、任务载荷、远程接入与调度平台能力。</h3>
            </div>
            <div className="grid gap-4">
              <div className="grid gap-3 md:grid-cols-3">
                {caseImages.map(([src, alt]) => (
                  <div key={src} className="overflow-hidden border border-[#E0E0E0] bg-[#F4F4F4]">
                    <Image src={src} alt={alt} width={1456} height={1024} className="h-48 w-full object-cover" />
                  </div>
                ))}
              </div>
              {casePoints.map((item, index) => (
                <div key={item} className="grid grid-cols-[72px_1fr] border border-[#E0E0E0] bg-[#F4F4F4]">
                  <div className="grid place-items-center border-r border-[#E0E0E0] text-lg font-semibold text-[#0F62FE]">
                    {String(index + 1).padStart(2, "0")}
                  </div>
                  <p className="p-5 text-lg font-semibold leading-8 text-[#393939]">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </RevealSection>

        <RevealSection id="about" className="border-y border-[#E0E0E0] bg-[#F4F4F4] py-20">
          <SectionTitle eyebrow="关于天戎" title="面向伙伴输出机器人软硬件能力底座" />
          <div className="mt-10 grid gap-3 md:grid-cols-2">
            {aboutItems.map((item) => (
              <div key={item} className="flex gap-3 border border-[#E0E0E0] bg-white p-5">
                <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-[#0F62FE]" />
                <p className="text-lg font-semibold">{item}</p>
              </div>
            ))}
          </div>
        </RevealSection>

        <section id="contact" className="bg-[#161616] py-20 text-white">
          <div className="mx-auto grid w-[min(1240px,calc(100%-32px))] gap-8 lg:grid-cols-[0.85fr_1.15fr]">
            <div>
              <div className="text-sm font-bold text-[#78A9FF]">能力合作</div>
              <h2 className="mt-4 text-4xl font-semibold leading-tight md:text-6xl">需要本体、模块、ROBOX 或平台能力？</h2>
            </div>
            <div className="border border-white/14 bg-white p-6 text-[#161616]">
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="合作方向" value="本体 / 背包 / 足端 / 调度平台 / ROBOX" />
                <Field label="应用行业" value="安防 / 巡检 / 仓储 / 应急 / 其他" />
                <Field label="能力需求" value="硬件模块 / 软件平台 / 接口集成" />
                <Field label="项目阶段" value="评估 / 试点 / 集成 / 批量" />
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
    <div className="mt-10 border border-[#D8E6F5] bg-[linear-gradient(180deg,#F8FBFF_0%,#EEF6FF_100%)]">
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
                <Image src={product.image} alt={product.title} fill className="object-contain" />
              </div>
            </div>
          ))}
        </div>

        <div className="relative border-t border-[#D8E6F5] bg-white/86 p-6 backdrop-blur md:p-8">
          <div className="grid gap-6 lg:grid-cols-[0.72fr_1.28fr_auto] lg:items-end">
            <div>
              <div className="text-sm font-semibold text-[#0F62FE]">产品 {String(active + 1).padStart(2, "0")}</div>
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

function SectionTitle({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="grid gap-4 border-t border-[#E0E0E0] pt-6 lg:grid-cols-[220px_1fr]">
      <div className="text-sm font-semibold text-[#0F62FE]">{eyebrow}</div>
      <h2 className="max-w-4xl text-4xl font-semibold leading-tight md:text-5xl">{title}</h2>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-[#E0E0E0] bg-[#F4F4F4] p-4">
      <div className="text-sm font-semibold text-[#0F62FE]">{label}</div>
      <div className="mt-3 text-sm text-[#525252]">{value}</div>
    </div>
  );
}
