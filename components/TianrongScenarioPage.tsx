"use client";

import { type FormEvent, type ReactNode, useEffect, useRef, useState } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import DotField from "@/components/DotField";
import { TianrongHeader } from "@/components/TianrongHeader";
import VideoHero from "@/components/hero/video-hero";

const DynamicHeroRobotPreview = dynamic(
  () => import("@/components/hero/hero-robot-preview").then((module) => module.HeroRobotPreview),
  { ssr: false }
);

const USE_VIDEO_HERO = true;

const products = [
  {
    id: "payload-modules",
    title: "背包与传感器",
    category: "硬件产品",
    tagline: "面向巡检任务的模块化硬件组合",
    description: "以统一背包为载体，集成 ROBOX、可见光、热成像、气体检测、通信和边缘计算等模块，根据巡检任务完成硬件组合与现场适配。",
    nodes: ["ROBOX 模块", "可见光 / 热成像", "气体 / 通信"],
    image: "/images/tianrong/matrix/backpack-and-sensors-robot.png",
    images: ["/images/tianrong/matrix/backpack-and-sensors-robot.png"],
    target: "#payload-modules",
    cta: "了解更多"
  },
  {
    id: "charging-station",
    title: "自主充电站",
    category: "硬件产品",
    tagline: "支撑机器人长期连续运行",
    description: "集成自动充电、温湿度监测、通信和数据采集等功能，为机器人提供稳定的驻留、补能与现场运行支持。",
    nodes: ["自动补能", "温湿度监测", "通信 / 数采"],
    image: "/images/tianrong/matrix/autonomous-charging-station.png",
    images: ["/images/tianrong/matrix/autonomous-charging-station.png"],
    target: "#charging-station",
    cta: "了解更多"
  },
  {
    id: "navigation",
    title: "导航系统",
    category: "软件产品",
    tagline: "支撑机器人在真实现场稳定移动",
    description: "提供环境建图、定位、路径规划和实时避障能力，采用激光 SLAM，支撑机器人完成巡检任务。",
    nodes: ["环境建图", "定位与规划", "实时避障"],
    image: "/images/tianrong/matrix/navigation-system.png",
    images: ["/images/tianrong/matrix/navigation-system.png"],
    target: "#navigation",
    cta: "了解更多"
  },
  {
    id: "rsp",
    title: "RSP 云控平台",
    category: "软件产品",
    tagline: "统一管理机器人、任务与现场运行",
    description: "集中完成地图管理、任务下发、设备监控、远程控制和巡检过程管理。",
    nodes: ["任务下发", "远程控制", "设备状态"],
    image: "/images/tianrong/matrix/rsp-platform.png",
    images: ["/images/tianrong/matrix/rsp-platform.png"],
    target: "#rsp-platform",
    cta: "了解更多"
  },
  {
    id: "data-platform",
    title: "数采平台",
    category: "软件产品",
    tagline: "让巡检数据形成业务闭环",
    description: "独立完成巡检数据的采集、存储、分析、可视化、异常预警和报告生成，为巡检决策与任务优化提供依据。",
    nodes: ["数据采集", "异常预警", "分析报告"],
    image: "/images/tianrong/matrix/data-platform.png",
    images: ["/images/tianrong/matrix/data-platform.png"],
    target: "#data-platform",
    cta: "了解更多"
  }
];

type ProductStoryStep = {
  id: string;
  aliases: string[];
  progressLabel: string;
  eyebrow: string;
  title: string;
  tagline: string;
  description: string;
  capabilities: Array<{
    title: string;
    description: string;
  }>;
  systemRole: string;
};

const productStorySteps: ProductStoryStep[] = [
  {
    id: "robot-series",
    aliases: ["bodies"],
    progressLabel: "平台",
    eyebrow: "平台适配",
    title: "机器人平台选型与适配",
    tagline: "先选对平台，再构建系统能力",
    description: "结合通道宽度、地面条件、作业范围、载荷需求和续航要求，选择适合现场的机器人平台。",
    capabilities: [
      { title: "地形与场景适配", description: "评估通道、坡度、地面和作业空间。" },
      { title: "载荷与接口适配", description: "完成机械、电气、通信和控制接口对接。" },
      { title: "现场集成与调校", description: "通过联调和运行测试，适应真实巡检环境。" }
    ],
    systemRole: "为导航、感知、调度和补能提供稳定载体。"
  },
  {
    id: "payload-modules",
    aliases: ["modules", "robox"],
    progressLabel: "感知",
    eyebrow: "感知装配",
    title: "背包与传感器",
    tagline: "感知能力，按任务装配",
    description: "围绕巡检任务，将视觉、热成像、环境检测与远程接入模块集成到统一背包中。",
    capabilities: [
      { title: "模块化背包", description: "统一安装、供电、散热和线缆管理。" },
      { title: "多类型传感器", description: "按任务配置视觉、热成像或环境检测能力。" },
      { title: "ROBOX 远程接入", description: "连接机器人、传感器与现场网络，支持远程诊断和控制。" }
    ],
    systemRole: "让同一机器人快速适配不同巡检任务。"
  },
  {
    id: "navigation",
    aliases: [],
    progressLabel: "导航",
    eyebrow: "自主移动",
    title: "导航系统",
    tagline: "不是只会建图，而是稳定到达每个点位",
    description: "基于现场地图和任务路线，持续完成定位、路径规划与动态避障。",
    capabilities: [
      { title: "环境建图", description: "建立可用于巡检任务的现场地图。" },
      { title: "定位与路径规划", description: "按照点位顺序和任务要求生成移动路线。" },
      { title: "实时避障", description: "识别临时障碍和环境变化，动态调整路径。" }
    ],
    systemRole: "将巡检计划转化为机器人可执行的移动路线。"
  },
  {
    id: "rsp-platform",
    aliases: ["rsp"],
    progressLabel: "调度",
    eyebrow: "任务调度",
    title: "RSP 调度平台",
    tagline: "把分散设备变成可调度的巡检系统",
    description: "统一管理机器人、地图、任务和现场运行状态，并在复杂情况下提供远程接管入口。",
    capabilities: [
      { title: "地图与任务编排", description: "配置巡检点位、路线、时间和执行顺序。" },
      { title: "运行监控与视频回传", description: "查看设备位置、任务状态和现场画面。" },
      { title: "异常处置与远程接管", description: "任务异常时暂停、恢复或切换人工远程操作。" }
    ],
    systemRole: "统一承载任务下发、运行监控和异常处置。"
  },
  {
    id: "charging-station",
    aliases: [],
    progressLabel: "补能",
    eyebrow: "持续运行",
    title: "自主充电站",
    tagline: "自主补能，让机器人持续运行",
    description: "机器人完成任务或电量不足时自动返回站点，完成驻留、充电和状态同步。",
    capabilities: [
      { title: "自动返航与驻留", description: "根据任务和电量状态返回充电站。" },
      { title: "站点状态监测", description: "监测供电、温湿度和设备运行状态。" },
      { title: "充电与数据同步", description: "补能期间同步设备状态、任务结果和运行信息。" }
    ],
    systemRole: "连接单次任务与下一次任务，减少人工搬运和补能操作。"
  },
  {
    id: "data-platform",
    aliases: [],
    progressLabel: "数据",
    eyebrow: "数据闭环",
    title: "数据采集平台",
    tagline: "数据回到业务，巡检才真正形成闭环",
    description: "集中采集巡检视频、传感器数据、设备状态和任务结果，形成可查询、可分析、可追溯的巡检记录。",
    capabilities: [
      { title: "实时采集与归档", description: "汇总视频、传感器、设备和任务数据。" },
      { title: "异常识别与分析", description: "整理异常记录，支持告警和后续处置。" },
      { title: "报告与历史回溯", description: "生成巡检报告，保留历史结果和变化趋势。" }
    ],
    systemRole: "将巡检执行结果转化为可用于管理和决策的数据资产。"
  }
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

type ContactFormState = {
  name: string;
  company: string;
  contact: string;
  direction: string;
  scenario: string;
  location: string;
  details: string;
  captcha: string;
};

const initialContactForm: ContactFormState = {
  name: "",
  company: "",
  contact: "",
  direction: "",
  scenario: "",
  location: "",
  details: "",
  captcha: ""
};

function getContactValidationMessage(value: string) {
  const contact = value.trim();
  if (!contact) return "请输入手机号或邮箱。";

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  const phonePattern = /^\+?[0-9][0-9\s-]{6,19}$/;
  return emailPattern.test(contact) || phonePattern.test(contact) ? "" : "请输入有效的手机号或邮箱。";
}

export function TianrongScenarioPage() {
  const [contactForm, setContactForm] = useState<ContactFormState>(initialContactForm);
  const [contactStatus, setContactStatus] = useState("");
  const [contactError, setContactError] = useState("");

  const updateContactField = (field: keyof ContactFormState, value: string) => {
    setContactForm((current) => ({ ...current, [field]: value }));
    setContactStatus("");
    if (field === "contact") setContactError("");
  };

  const handleCaptchaRequest = () => {
    const validationMessage = getContactValidationMessage(contactForm.contact);
    if (validationMessage) {
      setContactError(validationMessage);
      setContactStatus("");
      return;
    }
    setContactStatus("验证码发送接口待接入，当前已保留获取入口。");
  };

  const handleContactSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validationMessage = getContactValidationMessage(contactForm.contact);
    if (validationMessage) {
      setContactError(validationMessage);
      setContactStatus("");
      return;
    }
    setContactStatus("信息已完成前端校验，正式提交接口待接入。请保留验证码校验。 ");
  };

  return (
    <div id="top" className="tianrong-page relative min-h-screen bg-[var(--tr-surface)] text-[var(--tr-ink-deep)]">
      <TianrongHeader overlay />

      <main>
        {!USE_VIDEO_HERO && <section className="relative overflow-hidden border-b border-[#E0E0E0] bg-[#F4F4F4]">
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
          <div className="relative z-10 mx-auto grid min-h-[calc(100vh-4.625rem)] w-[min(1240px,calc(100%-32px))] items-center gap-8 py-16 lg:grid-cols-[0.8fr_1.2fr]">
            <div className="relative z-10">
              <motion.h1
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.65, delay: 0.08 }}
                className="cjk-heading max-w-4xl text-4xl font-semibold leading-[1.08] sm:text-5xl md:text-6xl"
              >
                <span className="block keep-phrase">机器人软硬件产品</span>
                <span className="block keep-phrase">与技术集成商</span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.65, delay: 0.16 }}
                className="cjk-body mt-7 max-w-2xl text-lg font-medium leading-8 text-[#393939] md:text-xl"
              >
                聚焦<span className="keep-phrase">机器人本体</span>、<span className="keep-phrase">任务载荷</span>、<span className="keep-phrase">ROBOX 远程控制盒</span>与<span className="keep-phrase">机器人调度平台</span>，为<span className="keep-phrase">合作伙伴</span>提供可组合、可集成、可扩展的<span className="keep-phrase">软硬件产品</span>。
              </motion.p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild size="lg" className="rounded-none bg-[#0F62FE] text-white shadow-none hover:bg-[#0050E6]">
                  <a href="#matrix">
                    <span className="keep-phrase">查看产品矩阵</span>
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </a>
                </Button>
                <Button asChild size="lg" variant="outline" className="rounded-none border-[#0F62FE] bg-transparent text-[#0F62FE] shadow-none hover:bg-[#EAF4FF]">
                  <a href="#contact">
                    <span className="keep-phrase">项目咨询</span>
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              </div>
            </div>

            <ProductStage />
          </div>
        </section>}
        <div className={USE_VIDEO_HERO ? "relative isolate" : undefined}>
          {USE_VIDEO_HERO && <VideoHero />}

          <ScrollDrivenSection id="matrix" className="relative z-10 bg-[var(--tr-surface-soft)] p-0">
            <ProductShowcase />
          </ScrollDrivenSection>
        </div>

        <div aria-hidden="true" className="h-16 bg-[#071F31] md:h-24 lg:h-28" />

        <ProductStorySection />

        <section id="case" className="tr-deep-section relative overflow-hidden text-white">
          <div className="relative min-h-[680px] md:min-h-[760px]">
            <Image
              src={caseImages[0][0]}
              alt={caseImages[0][1]}
              fill
              sizes="100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(6,28,43,0.94)_0%,rgba(11,53,80,0.64)_50%,rgba(18,102,139,0.18)_100%)]" />
            <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(6,28,43,0.78)_0%,transparent_58%)]" />
            <div className="relative z-10 mx-auto flex min-h-[680px] w-[min(1240px,calc(100%-32px))] items-end py-14 md:min-h-[760px] md:py-20">
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.7 }}
                className="max-w-3xl"
              >
                
                <h2 className="cjk-heading mt-4 text-4xl font-semibold leading-tight md:text-6xl [text-wrap:balance]"><span className="block">物流园区机器人</span><span className="block keep-phrase">夜间巡检实践</span></h2>
                <p className="cjk-body mt-5 max-w-2xl text-lg leading-8 text-white/80">围绕<span className="keep-phrase">园区道路</span>、<span className="keep-phrase">仓储外围</span>及<span className="keep-phrase">重点点位</span>开展巡检，通过机器人<span className="keep-phrase">连续作业</span>与<span className="keep-phrase">远程管理</span>，提升<span className="keep-phrase">巡检覆盖效率</span>，减少<span className="keep-phrase">重复性人工投入</span>。</p>
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

        <RevealSection id="about" className="relative isolate overflow-hidden bg-[#071F31] pb-0 pt-20 text-white md:pt-32">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_16%_16%,rgba(99,193,223,0.16),transparent_28%),radial-gradient(circle_at_86%_52%,rgba(54,143,184,0.13),transparent_32%),linear-gradient(180deg,#071f31_0%,#09283c_52%,#071f31_100%)]"
          />
          <div className="relative z-10 lg:min-h-[720px]">
            <div className="relative z-10 max-w-[660px]">
              <div className="text-[13px] font-medium tracking-[0.08em] text-[#63C1DF]">关于天戎</div>
              <h2 className="cjk-heading mt-8 max-w-[720px] text-left text-[clamp(40px,10.5vw,48px)] font-semibold leading-[1.1] tracking-[-0.035em] md:text-[clamp(52px,4.4vw,68px)] md:leading-[1.1]">
                <span className="block keep-phrase lg:whitespace-nowrap">以洞见启程，</span>
                <span className="block keep-phrase lg:whitespace-nowrap">以智能抵达</span>
              </h2>
              <div className="cjk-body mt-12 max-w-[660px] space-y-6 text-[17px] leading-[1.9] text-white/72 md:text-[18px]">
                <p>
                  杭州天戎智能科技有限公司成立于2025年9月，是一家专注于具身智能技术与机器人系统集成的高科技企业，致力于为全球客户提供智能化、自动化、远程化的机器人解决方案。公司业务涵盖机器人运动控制、环境感知、自主巡航、AI智能融合及系统集成，产品和方案广泛应用于安防巡检等多个行业。
                </p>
                <p>
                  公司的创始团队由来自知名科技企业的资深专家组成，在具身智能机器人领域拓展了新的技术应用领域。现有技术团队由一群来自于国内外知名院校及实验室的年轻人组成，热衷于投身具身智能产业化应用事业。依托深厚的研发能力和全球化战略布局，公司正加速推进具身智能技术创新、行业应用标准化落地。
                </p>
              </div>
            </div>

            <div className="relative mt-12 aspect-[3/4] w-full overflow-hidden rounded-[12px] lg:absolute lg:right-0 lg:top-[-38px] lg:mt-0 lg:w-[clamp(340px,34vw,500px)]">
              <Image
                src="/images/tianrong/about-office.png"
                alt="天戎科技办公空间与机器人产品"
                fill
                sizes="(max-width: 1023px) 100vw, 34vw"
                className="object-cover object-center"
              />
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(43,108,152,0.08),rgba(6,28,43,0.24))]" />
            </div>
          </div>

            <div className="tr-deep-section relative left-1/2 mt-8 h-[300px] min-h-[280px] w-screen -translate-x-1/2 overflow-hidden md:mt-10 md:h-[340px] md:min-h-[340px] lg:mt-0 lg:h-[clamp(380px,28vw,440px)] lg:min-h-[380px]">
              <Image
                src="/images/tianrong/location-map.png"
                alt="天戎科技杭州办公位置卫星图"
                fill
                sizes="100vw"
                className="object-cover object-[50%_50%] saturate-[0.78] contrast-105 md:object-[50%_35%]"
              />
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(6,28,43,0.90)_0%,rgba(11,53,80,0.46)_48%,rgba(18,102,139,0.16)_100%)]" />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-[linear-gradient(0deg,rgba(6,28,43,0.72),transparent)]" />
              <div className="relative z-10 mx-auto flex h-full w-full flex-col justify-end px-6 pb-7 text-white md:px-8 md:pb-12 lg:px-[max(6vw,48px)]">
                <div className="text-xl font-semibold tracking-[0.02em] md:text-2xl">杭州 · 天戎科技</div>
                <div className="mt-2 max-w-[560px] text-sm leading-6 text-white/90 md:text-base">
                  中国浙江省杭州市上城区新风路与新塘路辅路交叉口北100米
                </div>
                <a
                  href="https://maps.apple.com/?q=%E5%A4%A9%E6%88%8E%E7%A7%91%E6%8A%80%0A%E4%B8%AD%E5%9B%BD%0A%E6%B5%99%E6%B1%9F%E7%9C%81%0A%E6%9D%AD%E5%B7%9E%E5%B8%82%20%E4%B8%8A%E5%9F%8E%E5%8C%BA%0A%E6%96%B0%E9%A3%8E%E8%B7%AF%E4%B8%8E%E6%96%B0%E5%A1%98%E8%B7%AF%E8%BE%85%E8%B7%AF%E4%BA%A4%E5%8F%89%E5%8F%A3%E5%8C%97100%E7%B1%B3&ll=30.287306,120.211700"
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-flex w-fit items-center text-sm font-semibold text-white underline decoration-white/55 underline-offset-4 transition hover:text-white hover:decoration-white md:text-base"
                >
                  查看地图 <span aria-hidden="true" className="ml-1">↗</span>
                </a>
              </div>
            </div>
        </RevealSection>

        <section id="contact" className="tr-deep-section border-t border-white/10 py-20 text-white md:py-28">
          <div className="mx-auto grid w-[min(1240px,calc(100%-32px))] gap-10 lg:grid-cols-[0.82fr_1.18fr] lg:gap-16">
            <div className="lg:pt-4">
              <h2 className="cjk-heading mt-4 text-4xl font-semibold leading-[1.12] md:text-6xl">
                <span className="block">让巡检方案</span>
                <span className="block keep-phrase">进入真实现场</span>
              </h2>
              <p className="cjk-body mt-6 max-w-xl text-base leading-7 text-white/70 md:text-lg md:leading-8">
                从 RSP 云控平台、数采平台到硬件背包与传感器集成，天戎科技根据现场环境、巡检任务和项目阶段，提供高度定制化的巡检解决方案。
              </p>
              <div className="mt-8 grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
                <ContactMeta label="商务咨询" value="contact@tianrongtech.com" href="mailto:contact@tianrongtech.com" />
                <ContactMeta label="核心能力" value="RSP / 数采平台 / 硬件集成" />
                <ContactMeta label="合作方式" value="项目定制 / 本体合作 / 平台合作" />
              </div>
            </div>

            <form onSubmit={handleContactSubmit} className="tr-glass-panel rounded-sm bg-[var(--tr-panel-strong)] p-5 text-[#161616] sm:p-7 md:p-8">
              <div className="relative min-h-40 overflow-hidden border-b border-[#E6EAF0]">
                <Image
                  src="/images/tianrong/contact-robots.png"
                  alt="天戎科技巡检机器人本体"
                  fill
                  sizes="(min-width: 1024px) 58vw, 100vw"
                  className="pointer-events-none origin-right scale-[1.16] object-contain object-right"
                />
                <div className="relative z-10 max-w-[48%] py-5">
                  <div className="text-xl font-semibold">项目咨询</div>
                  <p className="mt-2 text-sm leading-6 text-[#737373]">请留下应用场景与项目需求，我们将据此匹配合适的产品和合作方式。</p>
                </div>
              </div>

              <div className="mt-6 grid gap-5 md:grid-cols-2">
                <ContactField label="姓名 / 称呼" required>
                  <Input id="contact-name" name="name" autoComplete="name" required placeholder="请输入姓名或称呼" value={contactForm.name} onChange={(event) => updateContactField("name", event.target.value)} className="rounded-none border-[#D9DEE7]" />
                </ContactField>
                <ContactField label="公司 / 单位" required>
                  <Input id="contact-company" name="company" autoComplete="organization" required placeholder="请输入公司或单位名称" value={contactForm.company} onChange={(event) => updateContactField("company", event.target.value)} className="rounded-none border-[#D9DEE7]" />
                </ContactField>
                <ContactField label="联系方式" required>
                  <Input id="contact-contact" name="contact" autoComplete="email" required placeholder="手机号或邮箱" value={contactForm.contact} onChange={(event) => updateContactField("contact", event.target.value)} onBlur={() => setContactError(getContactValidationMessage(contactForm.contact))} aria-invalid={Boolean(contactError)} aria-describedby={contactError ? "contact-contact-error" : undefined} className="rounded-none border-[#D9DEE7]" />
                  {contactError && <span id="contact-contact-error" className="mt-2 block text-sm text-[#D33A2C]">{contactError}</span>}
                </ContactField>
                <ContactField label="项目所在地" required>
                  <Select id="contact-location" name="location" required value={contactForm.location} onChange={(event) => updateContactField("location", event.target.value)} className="rounded-none border-[#D9DEE7] text-[#525252]">
                    <option value="" disabled>请选择项目所在地</option>
                    <option>中国大陆</option>
                    <option>中国香港</option>
                    <option>美国</option>
                    <option>其他国家或地区</option>
                  </Select>
                </ContactField>
                <ContactField label="咨询方向" required>
                  <Select id="contact-direction" name="direction" required value={contactForm.direction} onChange={(event) => updateContactField("direction", event.target.value)} className="rounded-none border-[#D9DEE7] text-[#525252]">
                    <option value="" disabled>请选择咨询方向</option>
                    <option>RSP 云控平台</option>
                    <option>数采平台</option>
                    <option>硬件背包与传感器集成</option>
                    <option>机器狗本体选型 / 合作</option>
                    <option>定制化巡检方案</option>
                    <option>项目或生态合作</option>
                  </Select>
                </ContactField>
                <ContactField label="应用场景" required>
                  <Select id="contact-scenario" name="scenario" required value={contactForm.scenario} onChange={(event) => updateContactField("scenario", event.target.value)} className="rounded-none border-[#D9DEE7] text-[#525252]">
                    <option value="" disabled>请选择应用场景</option>
                    <option>物流仓储</option>
                    <option>公共安全</option>
                    <option>停车场巡检</option>
                    <option>工业园区</option>
                    <option>能源电力</option>
                    <option>其他场景</option>
                  </Select>
                </ContactField>
                <ContactField label="需求描述" required className="md:col-span-2">
                  <Textarea id="contact-details" name="details" required placeholder="请描述现场环境、巡检任务、设备需求或期望的合作方式" value={contactForm.details} onChange={(event) => updateContactField("details", event.target.value)} className="min-h-24 rounded-none border-[#D9DEE7]" />
                </ContactField>
                <ContactField label="验证码" required className="md:col-span-2">
                  <div className="flex gap-3">
                    <Input id="contact-captcha" name="captcha" required inputMode="numeric" placeholder="请输入验证码" value={contactForm.captcha} onChange={(event) => updateContactField("captcha", event.target.value)} className="rounded-none border-[#D9DEE7]" />
                    <Button type="button" variant="outline" onClick={handleCaptchaRequest} className="h-11 shrink-0 rounded-none border-[#D9DEE7] bg-[#F4F6F8] px-4 text-[#3D3D3D] shadow-none hover:bg-[#E9EDF2]">
                      获取验证码
                    </Button>
                  </div>
                </ContactField>
              </div>

              <label className="mt-6 flex items-start gap-3 text-sm leading-6 text-[#737373]">
                <input type="checkbox" required className="mt-1 h-4 w-4 shrink-0 accent-[#0F62FE]" />
                <span>我同意天戎科技使用本次提交的信息联系我并进行项目沟通。</span>
              </label>
              {contactStatus && <p className="mt-4 text-sm leading-6 text-[#0F62FE]" role="status">{contactStatus}</p>}
              <Button type="submit" size="lg" className="tr-accent-button mt-6 w-full rounded-none text-white">
                提交项目需求
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>
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
  const [isVisible, setIsVisible] = useState(false);
  const railRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting && entry.intersectionRatio >= 0.2),
      { threshold: [0, 0.2] }
    );
    observer.observe(rail);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (paused || !isVisible) return;
    const timer = window.setInterval(() => {
      setActive((current) => {
        const next = (current + 1) % products.length;
        window.requestAnimationFrame(() => {
          scrollRailTo(next);
        });
        return next;
      });
    }, 5200);
    return () => window.clearInterval(timer);
  }, [isVisible, paused]);

  function scrollRailTo(index: number) {
    const container = railRef.current;
    const item = container?.children[index] as HTMLElement | undefined;
    if (!container || !item) return;
    container.scrollTo({ left: item.offsetLeft, behavior: "smooth" });
  }

  function goTo(index: number) {
    const next = (index + products.length) % products.length;
    setActive(next);
    scrollRailTo(next);
  }

  function scrollToTarget(target: string) {
    document.querySelector(target)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function onRailScroll() {
    const container = railRef.current;
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

  return (
    <div className="relative left-1/2 w-screen -translate-x-1/2">
      <div className="relative">
        <div
          ref={railRef}
          onScroll={onRailScroll}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onPointerDown={(event) => {
            dragStartRef.current = { x: event.clientX, y: event.clientY };
            setPaused(true);
          }}
          onPointerUp={(event) => {
            const start = dragStartRef.current;
            dragStartRef.current = null;
            setPaused(false);
            if (start === null) return;
            const distanceX = event.clientX - start.x;
            const distanceY = event.clientY - start.y;
            if (Math.abs(distanceX) > 48 && Math.abs(distanceX) > Math.abs(distanceY) * 1.2) {
              goTo(active + (distanceX < 0 ? 1 : -1));
            }
          }}
          onPointerCancel={() => {
            dragStartRef.current = null;
            setPaused(false);
          }}
          className="tr-product-rail select-none"
          aria-label="产品矩阵横向滑轨"
        >
          {products.map((product, index) => (
            <article
              key={product.id}
              aria-current={index === active ? "true" : undefined}
              className="tr-product-slide group relative h-[100svh] min-h-[680px] overflow-hidden md:min-h-[760px]"
            >
              <div className="absolute inset-0 bg-[#0B2435]">
                <Image
                  src={product.images[0]}
                  alt={product.title}
                  fill
                  sizes="100vw"
                  className={`object-cover transition duration-700 ease-out group-hover:scale-[1.015] ${
                    product.id === "payload-modules" ? "object-[52%_58%]" : "object-center"
                  }`}
                  priority={index === 0}
                />
              </div>
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(6,28,43,0.38)_0%,rgba(6,28,43,0.12)_40%,transparent_76%),linear-gradient(0deg,rgba(6,28,43,0.56)_0%,rgba(6,28,43,0.04)_58%,transparent_100%)]" />

              <div className="absolute inset-x-0 bottom-0 z-10">
                <div className="mx-auto w-[min(1240px,calc(100%-32px))] pb-8 md:pb-10">
                  <h3 className="cjk-heading keep-phrase text-3xl font-semibold leading-tight text-white drop-shadow-[0_2px_8px_rgba(6,28,43,0.72)] md:text-5xl">
                    {product.title}
                  </h3>
                  <div className="cjk-heading mt-3 text-base font-semibold text-[#BDEAF7] drop-shadow-[0_1px_5px_rgba(6,28,43,0.72)] md:text-xl">
                    {product.tagline}
                  </div>
                  <p className="cjk-body mt-3 max-w-3xl text-sm leading-6 text-white opacity-95 drop-shadow-[0_1px_4px_rgba(6,28,43,0.72)] md:text-base md:leading-7">
                    {product.description}
                  </p>
                  <Button asChild size="lg" className="tr-accent-button mt-5 w-fit rounded-none text-white">
                    <a
                      href={product.target}
                      onClick={(event) => {
                        event.preventDefault();
                        scrollToTarget(product.target);
                      }}
                    >
                      <span className="keep-phrase">{product.cta}</span>
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </a>
                  </Button>

                  <div className="mt-7 grid grid-cols-5 gap-2" aria-label="产品轮播进度">
                    {products.map((item, progressIndex) => (
                      <button
                        key={item.id}
                        type="button"
                        aria-label={`切换到${item.title}`}
                        aria-current={progressIndex === active ? "true" : undefined}
                        onClick={() => goTo(progressIndex)}
                        className="group/progress flex h-5 items-center"
                      >
                        <span
                          className={`w-full transition-all duration-300 ${
                            progressIndex === active
                              ? "h-1 bg-[#63C1DF] shadow-[0_0_12px_rgba(99,193,223,0.72)]"
                              : "h-0.5 bg-white/55 group-hover/progress:bg-white/75"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        <button
          type="button"
          aria-label="上一个产品"
          onClick={() => goTo(active - 1)}
          className="absolute left-3 top-1/2 z-20 -translate-y-1/2 p-2 text-white drop-shadow-[0_2px_8px_rgba(6,28,43,0.75)] transition hover:-translate-x-1 hover:text-[#9EDCF0] md:left-6"
        >
          <ChevronLeft className="h-7 w-7" />
        </button>
        <button
          type="button"
          aria-label="下一个产品"
          onClick={() => goTo(active + 1)}
          className="absolute right-3 top-1/2 z-20 -translate-y-1/2 p-2 text-white drop-shadow-[0_2px_8px_rgba(6,28,43,0.75)] transition hover:translate-x-1 hover:text-[#9EDCF0] md:right-6"
        >
          <ChevronRight className="h-7 w-7" />
        </button>
      </div>
    </div>
  );
}

function ProductStorySection() {
  const [active, setActive] = useState(0);
  const [chapterProgress, setChapterProgress] = useState(0);
  const stepRefs = useRef<(HTMLElement | null)[]>([]);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const elements = stepRefs.current.filter((element): element is HTMLElement => Boolean(element));
    if (!elements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible) return;
        setActive(Number((visible.target as HTMLElement).dataset.storyIndex ?? 0));
      },
      { rootMargin: "-44% 0px -46% 0px", threshold: [0.02, 0.15, 0.35, 0.65] }
    );

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let frame = 0;

    const updateProgress = () => {
      frame = 0;
      const element = stepRefs.current[active];
      if (!element) return;
      const rect = element.getBoundingClientRect();
      const viewportAnchor = window.innerHeight * 0.52;
      const progress = Math.min(1, Math.max(0, (viewportAnchor - rect.top) / (rect.height * 0.72)));
      setChapterProgress(progress);
    };

    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(updateProgress);
    };

    updateProgress();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [active]);

  function goToStep(index: number) {
    stepRefs.current[index]?.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      block: "center"
    });
  }

  return (
    <section
      aria-labelledby="product-story-title"
      className="relative isolate overflow-clip bg-[#071F31] text-white"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_16%_16%,rgba(99,193,223,0.16),transparent_28%),radial-gradient(circle_at_86%_52%,rgba(54,143,184,0.13),transparent_32%),linear-gradient(180deg,#071f31_0%,#09283c_52%,#071f31_100%)]"
      />

      <div className="relative mx-auto w-[min(1440px,calc(100%-32px))] lg:grid lg:grid-cols-[minmax(0,1.62fr)_minmax(360px,1fr)]">
        <div className="hidden lg:block">
          <div className="sticky top-[74px] flex h-[calc(100svh-74px)] min-h-[650px] flex-col py-7 pr-8 xl:pr-12">
            <div className="relative z-10 transition-all duration-500" style={{ maxHeight: active === 0 ? 185 : 66 }}>
              <div className="text-xs font-semibold tracking-[0.2em] text-[#63C1DF]">系统装配长卷</div>
              <h2
                id="product-story-title"
                className="cjk-heading mt-3 text-[clamp(32px,3.1vw,52px)] font-semibold leading-[1.08] tracking-[-0.025em] transition-all duration-500"
                style={{ opacity: active === 0 ? 1 : 0.22, transform: active === 0 ? "scale(1)" : "scale(0.78)", transformOrigin: "left top" }}
              >
                一套巡检系统，如何逐步装配成形
              </h2>
              <p
                className="cjk-body mt-3 max-w-2xl text-sm leading-6 text-white/62 transition-opacity duration-500 xl:text-base xl:leading-7"
                style={{ opacity: active === 0 ? 1 : 0 }}
              >
                从机器人平台、感知载荷到调度、补能与数据闭环。
              </p>
              {active > 0 && (
                <div className="absolute left-0 top-0 text-xs font-semibold tracking-[0.18em] text-[#BDEAF7]">
                  系统装配 {String(active + 1).padStart(2, "0")} / 06
                </div>
              )}
            </div>

            <ProductStoryVisual active={active} progress={chapterProgress} />
          </div>
        </div>

        <div className="relative py-16 lg:py-0 lg:pl-24">
          <header className="pb-12 lg:hidden">
            <div className="text-xs font-semibold tracking-[0.2em] text-[#63C1DF]">系统装配长卷</div>
            <h2
              id="product-story-title-mobile"
              className="cjk-heading mt-4 text-4xl font-semibold leading-[1.1] tracking-[-0.025em]"
            >
              一套巡检系统，如何逐步装配成形
            </h2>
            <p className="cjk-body mt-4 max-w-2xl text-base leading-7 text-white/62">
              从机器人平台、感知载荷到调度、补能与数据闭环。
            </p>
          </header>

          <nav aria-label="装配长卷步骤" className="pointer-events-none absolute inset-y-0 left-0 hidden w-20 lg:block">
            <div className="pointer-events-auto sticky top-1/2 flex -translate-y-1/2 flex-col gap-5">
              <div className="absolute bottom-4 left-[7px] top-4 w-px bg-white/16" />
              <motion.div
                aria-hidden="true"
                className="absolute left-[6px] top-4 w-[3px] bg-[linear-gradient(180deg,#368FB8,#63C1DF)] shadow-[0_0_14px_rgba(99,193,223,0.7)]"
                animate={{ height: `${Math.min(100, ((active + chapterProgress) / (productStorySteps.length - 1)) * 100)}%` }}
                transition={reduceMotion ? { duration: 0 } : { duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              />
              {productStorySteps.map((step, index) => (
                <button
                  key={step.id}
                  type="button"
                  aria-current={index === active ? "step" : undefined}
                  aria-label={`查看${step.title}`}
                  onClick={() => goToStep(index)}
                  className="group relative z-10 flex w-20 items-center gap-2 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#63C1DF]"
                >
                  <span className={`flex h-[15px] w-[15px] shrink-0 rounded-full border transition ${index <= active ? "border-[#8BD8EE] bg-[#63C1DF] shadow-[0_0_12px_rgba(99,193,223,0.75)]" : "border-white/42 bg-[#0A283B] group-hover:border-white/75"}`} />
                  <span className={`whitespace-nowrap text-[10px] font-semibold tracking-[0.12em] transition-colors ${index === active ? "text-[#BDEAF7]" : "text-white/42 group-hover:text-white/80"}`}>
                    {String(index + 1).padStart(2, "0")} {step.progressLabel}
                  </span>
                </button>
              ))}
            </div>
          </nav>

          {productStorySteps.map((step, index) => (
            <article
              key={step.id}
              id={step.id}
              ref={(element) => {
                stepRefs.current[index] = element;
              }}
              data-story-index={index}
              className="relative scroll-mt-24 border-t border-white/10 py-12 first:border-t-0 lg:flex lg:min-h-[112svh] lg:items-center lg:border-t-0 lg:py-24 lg:pr-4 xl:pr-8"
            >
              {step.aliases.map((alias) => (
                <span key={alias} id={alias} className="pointer-events-none absolute top-0 scroll-mt-24" />
              ))}

              <div className="w-full max-w-xl lg:sticky lg:top-1/2 lg:-translate-y-1/2 lg:py-12">
                <div className="mb-7 lg:hidden">
                  <ProductStoryVisual active={index} compact />
                </div>
                <div className="flex items-center gap-3 text-xs font-semibold tracking-[0.18em] text-[#63C1DF]">
                  <span>{String(index + 1).padStart(2, "0")} / 06</span>
                  <span className="h-px w-8 bg-[#63C1DF]/60" />
                  <span>{step.eyebrow}</span>
                </div>
                <h3 className={`cjk-heading keep-phrase mt-4 text-3xl font-semibold leading-tight transition-colors md:text-4xl ${index === active ? "lg:text-white" : "lg:text-white/45"}`}>
                  {step.title}
                </h3>
                <p className={`cjk-heading mt-4 text-xl font-semibold leading-8 transition-colors ${index === active ? "text-[#BDEAF7] lg:text-[#BDEAF7]" : "text-[#BDEAF7] lg:text-white/58"}`}>
                  {step.tagline}
                </p>
                <p className={`cjk-body mt-5 text-base leading-8 transition-colors ${index === active ? "text-white/76" : "text-white/72 lg:text-white/58"}`}>
                  {step.description}
                </p>
                <div className="mt-7 border-t border-white/14">
                  {step.capabilities.map((capability) => (
                    <div key={capability.title} className="grid gap-1 border-b border-white/10 py-3.5 sm:grid-cols-[minmax(132px,0.42fr)_1fr] sm:gap-4">
                      <h4 className="cjk-heading keep-phrase text-sm font-semibold text-white/92">{capability.title}</h4>
                      <p className="cjk-body text-sm leading-6 text-white/60">{capability.description}</p>
                    </div>
                  ))}
                </div>
                <p className="cjk-body mt-5 border-l-2 border-[#63C1DF] pl-4 text-sm leading-6 text-[#BDEAF7]">
                  {step.systemRole}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProductStoryVisual({
  active,
  compact = false,
  progress = 1
}: {
  active: number;
  compact?: boolean;
  progress?: number;
}) {
  const reduceMotion = useReducedMotion();
  const transition = reduceMotion ? "duration-0" : "duration-700";

  return (
    <div
      className={`relative isolate overflow-hidden rounded-[1.25rem] border border-white/10 bg-[radial-gradient(circle_at_48%_46%,rgba(54,143,184,0.22),transparent_48%),linear-gradient(150deg,rgba(9,38,57,0.78),rgba(5,24,37,0.24))] ${compact ? "aspect-[1.08]" : "mt-5 min-h-0 flex-1"}`}
    >
      <StoryVisualContent active={active} progress={compact ? 1 : progress} transition={transition} />
    </div>
  );
}

function StoryVisualContent({
  active,
  progress,
  transition
}: {
  active: number;
  progress?: number;
  transition: string;
}) {
  const clamp = (value: number) => Math.min(1, Math.max(0, value));
  const stageAmount = (stage: number) => (active > stage ? 1 : active === stage ? clamp(progress ?? 1) : 0);
  const platformAmount = stageAmount(0);
  const assemblyAmount = stageAmount(1);
  const navigationAmount = stageAmount(2);
  const rspAmount = stageAmount(3);
  const chargingAmount = stageAmount(4);
  const dataAmount = stageAmount(5);

  const platformNodes = [
    ["地形通过性", "通道 / 坡度", "left-[4%] top-[16%]", 0.12],
    ["载荷能力", "背包 / 任务载荷", "right-[4%] top-[20%]", 0.25],
    ["续航能力", "作业范围 / 频次", "left-[6%] bottom-[20%]", 0.38],
    ["接口适配", "机械 / 电气 / 通信", "right-[5%] bottom-[18%]", 0.52]
  ] as const;
  const sensorNodes = [
    ["VIS", "left-[37%] top-[23%]", 0.18],
    ["IR", "left-[49%] top-[19%]", 0.34],
    ["ROBOX", "right-[23%] top-[28%]", 0.52]
  ] as const;
  const navigationStates = ["建图", "定位", "路线", "避障"];
  const dataStates = ["采集", "识别", "报告", "归档"];

  return (
    <div className="absolute inset-0 text-[10px] md:text-xs">
      <div aria-hidden="true" className="absolute inset-x-[8%] bottom-[8%] h-px bg-[linear-gradient(90deg,transparent,rgba(139,216,238,0.34),transparent)]" />

      <div
        aria-hidden="true"
        className={`absolute inset-0 overflow-hidden transition-opacity ${transition}`}
        style={{ opacity: navigationAmount * 0.34 }}
      >
        <Image src="/images/tianrong/final-assets/logistics-yard-road.png" alt="" fill sizes="(max-width: 1024px) 100vw, 62vw" className="object-cover" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,#071F31_0%,rgba(7,31,49,0.56)_48%,rgba(7,31,49,0.26)_100%),linear-gradient(0deg,#071F31_2%,transparent_58%)]" />
      </div>

      <div
        className={`absolute inset-x-[7%] bottom-[10%] h-[68%] transition-all ${transition}`}
        style={{ opacity: 0.28 + platformAmount * 0.72, transform: `translate3d(${navigationAmount * 3 - rspAmount * 12}%, 0, 0) scale(${0.94 + platformAmount * 0.06})` }}
      >
        <Image src="/images/generated/argos-body.png" alt="巡检机器人平台" fill sizes="(max-width: 1024px) 70vw, 48vw" className="object-contain drop-shadow-[0_24px_40px_rgba(0,0,0,0.42)]" />
      </div>

      {platformNodes.map(([label, detail, position, threshold]) => (
        <div
          key={label}
          className={`absolute ${position} w-[27%] transition-opacity ${transition}`}
          style={{ opacity: platformAmount >= Number(threshold) ? 1 : 0.16 }}
        >
          <div className="flex items-center gap-2 font-semibold text-[#BDEAF7]"><span className="h-1.5 w-1.5 rounded-full bg-[#63C1DF] shadow-[0_0_8px_rgba(99,193,223,0.9)]" />{label}</div>
          <div className="mt-1 text-[9px] leading-4 text-white/45">{detail}</div>
          <div className="mt-2 h-px w-full bg-[linear-gradient(90deg,rgba(99,193,223,0.62),transparent)]" />
        </div>
      ))}

      <div
        className={`absolute left-[16%] top-[21%] h-[31%] w-[68%] transition-all ${transition}`}
        style={{ opacity: assemblyAmount, transform: `translateY(${(1 - assemblyAmount) * -24}px) scale(${0.86 + assemblyAmount * 0.14})` }}
      >
        <Image src="/images/generated/modular-backpack.png" alt="装配到机器人背部的模块化背包" fill sizes="(max-width: 1024px) 80vw, 46vw" className="object-contain drop-shadow-[0_20px_30px_rgba(2,16,26,0.48)]" />
      </div>

      {sensorNodes.map(([label, position, threshold]) => (
        <div
          key={label}
          className={`absolute ${position} flex items-center gap-1.5 transition-all ${transition}`}
          style={{ opacity: assemblyAmount >= Number(threshold) ? 1 : 0.12, transform: `translateY(${(1 - assemblyAmount) * -18}px)` }}
        >
          <span className={`flex h-6 min-w-8 items-center justify-center rounded border px-1 text-[8px] font-bold tracking-[0.08em] ${label === "ROBOX" ? "border-[#F1A85B]/80 bg-[#F1A85B]/20 text-[#FFD3A4]" : "border-[#BDEAF7]/70 bg-[#BDEAF7]/15 text-[#BDEAF7]"}`}>{label}</span>
          <span className="h-px w-4 bg-[#63C1DF]/65" />
        </div>
      ))}
      <div className={`absolute bottom-[8%] left-[29%] right-[29%] flex items-center justify-center gap-2 tracking-[0.14em] text-white/42 transition-opacity ${transition}`} style={{ opacity: assemblyAmount }}>
        <span className="h-px flex-1 bg-gradient-to-r from-transparent to-[#63C1DF]/45" />
        部件装到本体
        <span className="h-px flex-1 bg-gradient-to-l from-transparent to-[#63C1DF]/45" />
      </div>

      <div className={`absolute inset-x-[6%] bottom-[12%] h-[48%] transition-opacity ${transition}`} style={{ opacity: navigationAmount }}>
        <svg className="h-full w-full" viewBox="0 0 800 260" fill="none" preserveAspectRatio="none" aria-hidden="true">
          <path d="M28 224C156 236 148 164 258 174C364 184 370 84 486 108C586 128 612 42 772 50" stroke="rgba(139,216,238,0.28)" strokeWidth="2" strokeDasharray="8 10" />
          <path d="M28 224C156 236 148 164 258 174C364 184 370 84 486 108C586 128 612 42 772 50" pathLength="1" stroke="#63C1DF" strokeWidth="4" strokeDasharray="1" strokeDashoffset={1 - navigationAmount} />
          {["28,224", "258,174", "486,108", "772,50"].map((point, index) => {
            const [cx, cy] = point.split(",");
            return <circle key={point} cx={cx} cy={cy} r={index === 3 ? 6 : 4} fill={index === 3 ? "#F1A85B" : "#63C1DF"} fillOpacity={navigationAmount > index * 0.22 ? 1 : 0.28} />;
          })}
        </svg>
        <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between text-[9px] text-white/62 md:text-[10px]">
          {navigationStates.map((state, index) => <span key={state} className={navigationAmount > index * 0.22 ? "text-[#BDEAF7]" : "text-white/32"}>{state}</span>)}
        </div>
      </div>
      <div className={`absolute left-[8%] top-[13%] rounded-full border border-[#63C1DF]/55 bg-[#071F31]/70 px-2.5 py-1 text-[9px] text-[#BDEAF7] transition-opacity ${transition}`} style={{ opacity: navigationAmount > 0.55 ? 1 : 0 }}>
        路线开始执行
      </div>

      <div className={`absolute right-[5%] top-[10%] w-[42%] max-w-[250px] rounded-xl border border-[#63C1DF]/45 bg-[#071F31]/88 p-3 shadow-[0_20px_50px_rgba(0,0,0,0.28)] transition-all ${transition}`} style={{ opacity: rspAmount, transform: `translateY(${(1 - rspAmount) * 18}px)` }}>
        <div className="flex items-center justify-between border-b border-white/10 pb-2 text-[9px] font-semibold tracking-[0.14em] text-[#BDEAF7]"><span>RSP 调度</span><span className="text-[#63C1DF]">ONLINE</span></div>
        <div className="mt-3 grid gap-2">
          <div className="flex items-center justify-between rounded bg-white/5 px-2 py-1.5"><span className="text-white/56">任务下发</span><span className="text-[#63C1DF]">PATROL-06</span></div>
          <div className="flex items-center justify-between rounded bg-white/5 px-2 py-1.5"><span className="text-white/56">机器人状态</span><span className="text-[#63C1DF]">执行中</span></div>
          <div className="flex items-center justify-between rounded bg-[#F1A85B]/10 px-2 py-1.5"><span className="text-white/56">异常节点</span><span className="text-[#FFD3A4]">远程接管</span></div>
        </div>
        <div className="mt-3 flex items-center gap-2 text-[9px] text-white/48"><span className="h-1.5 w-1.5 rounded-full bg-[#F1A85B]" />任务下发 · 执行 · 状态回传</div>
      </div>
      <div className={`absolute right-[36%] top-[38%] h-px w-[19%] origin-right bg-[linear-gradient(90deg,transparent,#63C1DF)] transition-opacity ${transition}`} style={{ opacity: rspAmount * 0.9 }} />
      <div className={`absolute right-[36%] top-[35%] rounded-full border border-[#F1A85B]/65 bg-[#071F31]/80 px-2 py-1 text-[9px] text-[#FFD3A4] transition-opacity ${transition}`} style={{ opacity: rspAmount > 0.62 ? 1 : 0 }}>
        远程处置完成
      </div>

      <div className={`absolute bottom-[14%] right-[4%] h-[34%] w-[34%] overflow-hidden rounded-lg border border-[#F1A85B]/45 bg-[#071F31]/70 shadow-[0_18px_36px_rgba(0,0,0,0.3)] transition-all ${transition}`} style={{ opacity: chargingAmount * 0.92, transform: `translateX(${(1 - chargingAmount) * 20}px)` }}>
        <Image src="/images/tianrong/matrix/autonomous-charging-station.png" alt="自主充电站区域" fill sizes="24vw" className="object-cover" />
        <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(5,24,37,0.82),transparent_65%)]" />
        <div className="absolute bottom-2 left-2 text-[9px] text-[#FFD3A4]">补能站 · READY</div>
      </div>
      <div className={`absolute inset-x-[22%] bottom-[17%] h-[22%] transition-opacity ${transition}`} style={{ opacity: chargingAmount }}>
        <svg className="h-full w-full" viewBox="0 0 520 110" fill="none" preserveAspectRatio="none" aria-hidden="true">
          <path d="M20 86C156 90 204 70 296 72C366 74 420 46 500 34" stroke="rgba(139,216,238,0.24)" strokeWidth="2" strokeDasharray="8 10" />
          <path d="M20 86C156 90 204 70 296 72C366 74 420 46 500 34" pathLength="1" stroke="#F1A85B" strokeWidth="3" strokeDasharray="1" strokeDashoffset={1 - chargingAmount} />
          <circle cx="500" cy="34" r="5" fill="#F1A85B" fillOpacity={chargingAmount > 0.78 ? 1 : 0.3} />
        </svg>
      </div>
      <div className={`absolute bottom-[9%] right-[5%] flex gap-2 text-[9px] text-white/64 transition-opacity ${transition}`} style={{ opacity: chargingAmount }}>
        {["返航", "驻留", "补能"].map((state, index) => <span key={state} className={`rounded-full border px-2 py-1 ${chargingAmount > index * 0.28 ? "border-[#F1A85B]/60 text-[#FFD3A4]" : "border-white/15 text-white/32"}`}>{state}</span>)}
      </div>

      <div className={`absolute bottom-[7%] left-[5%] right-[5%] rounded-xl border border-[#63C1DF]/45 bg-[#071F31]/90 p-3 shadow-[0_20px_50px_rgba(0,0,0,0.3)] transition-all ${transition}`} style={{ opacity: dataAmount, transform: `translateY(${(1 - dataAmount) * 18}px)` }}>
        <div className="flex items-center justify-between border-b border-white/10 pb-2"><span className="text-[9px] font-semibold tracking-[0.14em] text-[#BDEAF7]">巡检数据闭环</span><span className="text-[9px] text-[#F1A85B]">REPORT READY</span></div>
        <div className="mt-3 flex items-center justify-between gap-2">
          {dataStates.map((state, index) => <div key={state} className="flex min-w-0 flex-1 items-center gap-1.5 text-[9px] text-white/65"><span className={`h-1.5 w-1.5 shrink-0 rounded-full ${dataAmount > index * 0.2 ? index === 3 ? "bg-[#F1A85B]" : "bg-[#63C1DF]" : "bg-white/25"}`} /><span className="truncate">{state}</span>{index < dataStates.length - 1 && <span className="h-px flex-1 bg-white/16" />}</div>)}
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2 text-[9px]
          text-white/52"><span>异常 02 项</span><span>报告 01 份</span><span className="text-right text-[#BDEAF7]">数据已归档</span></div>
      </div>
      <div className={`absolute left-[34%] top-[33%] h-px w-[26%] bg-[linear-gradient(90deg,#63C1DF,transparent)] transition-opacity ${transition}`} style={{ opacity: dataAmount * 0.75 }} />
      <div className={`absolute left-[37%] top-[31%] flex items-center gap-2 text-[9px] text-[#BDEAF7] transition-opacity ${transition}`} style={{ opacity: dataAmount > 0.4 ? 1 : 0 }}>
        <span className="h-1.5 w-1.5 rounded-full bg-[#63C1DF] shadow-[0_0_10px_rgba(99,193,223,0.8)]" />数据汇入平台
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

function RevealSection({ id, className, children }: { id?: string; className: string; children: React.ReactNode }) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.section
      id={id}
      className={`module-section ${className}`}
      initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 48, scale: 0.985 }}
      whileInView={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.16, margin: "-100px 0px" }}
      transition={reduceMotion ? { duration: 0.2 } : { duration: 0.72, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="mx-auto w-[min(1240px,calc(100%-32px))]">{children}</div>
    </motion.section>
  );
}

function ScrollDrivenSection({ id, className, children }: { id?: string; className: string; children: React.ReactNode }) {
  const sectionRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "start center"]
  });
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0, 0.72, 1]);
  const y = useTransform(scrollYProgress, [0, 1], [136, 0]);

  return (
    <section ref={sectionRef} id={id} className={className}>
      <motion.div
        data-testid="matrix-scroll-content"
        className="module-section mx-auto w-[min(1240px,calc(100%-32px))]"
        initial={false}
        style={reduceMotion ? undefined : { opacity, y }}
      >
        {children}
      </motion.div>
    </section>
  );
}

function TianrongFooter() {
  return (
    <footer className="tr-deep-section border-t border-white/10 text-white">
      <div className="mx-auto grid w-[min(1240px,calc(100%-32px))] gap-10 py-12 md:grid-cols-[1.2fr_0.8fr_0.8fr]">
        <div>
          <Link href="#top" className="inline-flex items-center gap-3">
            <Image
              src="/images/tianrong/tianrong-logo.png"
              alt="天戎科技"
              width={1080}
              height={820}
              className="h-12 w-16 shrink-0 object-contain"
              style={{ filter: "brightness(0) saturate(100%) invert(31%) sepia(97%) saturate(3697%) hue-rotate(211deg) brightness(98%) contrast(107%)" }}
            />
            <span className="text-base font-semibold text-white">天戎科技</span>
          </Link>
          <p className="mt-5 max-w-xs text-sm leading-6 text-white/62">机器人本体、任务载荷、远程接入与调度平台，为项目提供可组合、可集成的软硬件能力。</p>
        </div>
        <div>
          <h2 className="cjk-heading whitespace-nowrap text-base font-semibold text-white">快速浏览</h2>
          <div className="mt-4 flex flex-col items-start gap-3 text-base text-white/62">
            <a href="#matrix" className="keep-phrase hover:text-[#87C8EA]">产品矩阵</a>
            <a href="#case" className="keep-phrase hover:text-[#87C8EA]">实践案例</a>
            <a href="#contact" className="keep-phrase hover:text-[#87C8EA]">联系我们</a>
          </div>
        </div>
        <div>
          <h2 className="cjk-heading whitespace-nowrap text-base font-semibold text-white">联系天戎</h2>
          <a href="mailto:contact@tianrongtech.com" className="mt-4 inline-block whitespace-nowrap text-base text-white/62 hover:text-[#87C8EA]">contact@tianrongtech.com</a>
        </div>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-sm text-white/48">Copyright © 2026 <span className="keep-phrase">杭州天戎智能科技有限公司</span> 版权所有</div>
    </footer>
  );
}

function ContactMeta({ label, value, href }: { label: string; value: string; href?: string }) {
  return (
    <div className="border-t border-white/15 pt-4">
      <div className="text-sm font-semibold text-[#9CC4FF]">{label}</div>
      {href ? <a href={href} className="cjk-body mt-2 inline-block text-base leading-7 text-white/80 transition hover:text-white">{value}</a> : <div className="cjk-body mt-2 text-base leading-7 text-white/75">{value}</div>}
    </div>
  );
}

function ContactField({ label, required = false, className = "", children }: { label: string; required?: boolean; className?: string; children: ReactNode }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-2 block text-sm font-semibold text-[#3D3D3D]">
        {label}{required && <span className="ml-1 text-[#0F62FE]" aria-hidden="true">*</span>}
      </span>
      {children}
    </label>
  );
}
