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
    image: "/images/generated/modular-backpack.png",
    images: ["/images/generated/modular-backpack.png"],
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
    target: "#contact",
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
    target: "#rsp-platform",
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
    target: "#rsp-platform",
    cta: "了解更多"
  }
];

const robotBodies = [
  { model: "TR-S1", name:  "轻型点足本体", image: "/images/tianrong/final-assets/body-tr-s1.png", note: "适用于室内通道、轻量巡检。" },
  { model: "TR-M1", name:  "中型点足本体", image: "/images/tianrong/final-assets/body-tr-m1.png", note: "适用于园区和安防的巡逻巡检。" },
  { model: "TR-L1", name:  "重载点足本体", image: "/images/tianrong/final-assets/body-tr-l1.png", note: "面向高负载、长续航和复杂地形任务。" },
  { model: "TR-S1W", name: "轻型轮足本体", image: "/images/tianrong/final-assets/body-tr-s1w.png", note: "适用于平整路面和短距离高频巡检。" },
  { model: "TR-M1W", name: "中型轮足本体", image: "/images/tianrong/final-assets/body-tr-m1w.png", note: "适用于园区道路、仓储通道和长距离巡检。" },
  { model: "TR-L1W", name: "重载轮足本体", image: "/images/tianrong/final-assets/body-tr-l1w.png", note: "适用于大范围场地和复杂路况下的连续作业。" }
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

        <RevealSection id="robot-series" className="bg-[var(--tr-surface)] py-20 md:py-24">
          <span id="bodies" className="block scroll-mt-20" />
          <SectionHeading
            title={<span className="keep-phrase">四足机器人本体</span>}
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
                transition={{ delay: index * 0.08, duration: 0.62 }}
                className="group overflow-hidden bg-transparent transition duration-500 hover:-translate-y-2 focus:outline-none focus:ring-2 focus:ring-[#0F62FE]/35"
              >
                <div className="relative aspect-[1.38] overflow-hidden border border-[var(--tr-line)] bg-[var(--tr-panel)]">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-contain p-5 transition duration-700 ease-out group-hover:scale-[1.12] group-hover:-translate-y-1 group-focus:scale-[1.12]"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>
                <div className="pt-5">
                  <div className="text-sm font-semibold tracking-[0.12em] text-[#0F62FE]">{item.model}</div>
                  <h3 className="cjk-heading keep-phrase mt-2 text-2xl font-semibold">{item.name}</h3>
                  <p className="cjk-body mt-2 max-h-0 overflow-hidden text-base leading-7 text-[#525252] opacity-0 transition-all duration-300 max-md:max-h-16 max-md:opacity-100 md:group-hover:max-h-16 md:group-hover:opacity-100 md:group-focus-within:max-h-16 md:group-focus-within:opacity-100">{item.note}</p>
                </div>
              </motion.article>
            ))}
          </div>
        </RevealSection>

        <RevealSection id="payload-modules" className="bg-[var(--tr-surface-soft)] py-20 md:py-24">
          <span id="modules" className="block scroll-mt-20" />
          <SectionHeading
            title={<>面向巡检任务的 <span className="keep-phrase">模块化载荷</span></>}
            description={<>根据巡检、检测、通信和现场交互需求，灵活选择和组合不同功能模块。</>}
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
                transition={{ delay: index * 0.08, duration: 0.62 }}
                className="group overflow-hidden bg-transparent transition duration-500 hover:-translate-y-2 focus:outline-none focus:ring-2 focus:ring-[#0F62FE]/35"
              >
                <div className="relative aspect-[1.42] overflow-hidden border border-[var(--tr-line)] bg-[#F4F8FC]">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-contain p-7 transition duration-700 ease-out group-hover:scale-[1.14] group-hover:-translate-y-1 group-focus:scale-[1.14]"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>
                <div className="pt-5">
                  <h3 className="cjk-heading keep-phrase text-2xl font-semibold">{item.name}</h3>
                  <p className="cjk-body keep-phrase mt-2 text-base font-semibold text-[#0F62FE]">{item.tag}</p>
                  <p className="cjk-body mt-2 max-h-0 overflow-hidden text-base leading-7 text-[#525252] opacity-0 transition-all duration-300 max-md:max-h-16 max-md:opacity-100 md:group-hover:max-h-16 md:group-hover:opacity-100 md:group-focus-within:max-h-16 md:group-focus-within:opacity-100">{item.note}</p>
                </div>
              </motion.article>
            ))}
          </div>
        </RevealSection>

        <RevealSection id="robox" className="bg-[var(--tr-surface)] py-20">
          <SectionHeading
            title={<span className="keep-phrase">ROBOX 远程控制盒</span>}
            description={<>将机器人、<span className="keep-phrase">现场网络</span>与<span className="keep-phrase">远程管理平台</span>安全连接，实现视频、<span className="keep-phrase">设备状态</span>和<span className="keep-phrase">告警数据</span>回传，并支持<span className="keep-phrase">远程诊断</span>、<span className="keep-phrase">配置与控制</span>。</>}
            align="left"
          />
          <div className="mt-12">
            <div className="grid lg:grid-cols-[0.95fr_1.05fr]">
              <div className="tr-glass-panel relative min-h-[500px] overflow-hidden md:min-h-[560px]">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(54,143,184,0.22),transparent_52%)]" />
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
                    {["机器人与现场设备", "ROBOX", "机器人调度平台"].map((item, index) => (
                      <div key={item} className="flex items-center gap-3">
                        <div className="keep-phrase px-1 py-3 text-base font-semibold text-[#393939]">{item}</div>
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

        <RevealSection id="rsp-platform" className="bg-[var(--tr-surface-soft)] py-20">
          <span id="rsp" className="block scroll-mt-20" />
          <SectionHeading
            title={<span className="keep-phrase">机器人调度平台</span>}
            description={<><span className="keep-phrase">集中管理</span>机器人、地图、任务和现场数据，支持<span className="keep-phrase">多机器人任务编排</span>、<span className="keep-phrase">运行监控</span>、<span className="keep-phrase">异常处理</span>和<span className="keep-phrase">远程运维</span>。</>}
            align="left"
          />
          <div className="mt-12 grid gap-10 lg:grid-cols-[1.18fr_0.82fr] lg:items-start">
            <div className="tr-glass-panel relative overflow-hidden p-3 md:p-5">
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

        <RevealSection id="about" className="overflow-hidden bg-[var(--tr-surface-soft)] pb-0 pt-20 md:pt-32">
          <div className="relative lg:min-h-[720px]">
            <div className="relative z-10 max-w-[660px]">
              <div className="text-[13px] font-medium tracking-[0.08em] text-[#737373]">关于天戎</div>
              <h2 className="cjk-heading mt-8 max-w-[720px] text-left text-[clamp(40px,10.5vw,48px)] font-semibold leading-[1.1] tracking-[-0.035em] md:text-[clamp(52px,4.4vw,68px)] md:leading-[1.1]">
                <span className="block keep-phrase lg:whitespace-nowrap">以洞见启程，</span>
                <span className="block keep-phrase lg:whitespace-nowrap">以智能抵达</span>
              </h2>
              <div className="cjk-body mt-12 max-w-[660px] space-y-6 text-[17px] leading-[1.9] text-[#4E514F] md:text-[18px]">
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
              <div
                className={`absolute inset-0 ${
                  product.id === "payload-modules"
                    ? "bg-[radial-gradient(circle_at_66%_38%,rgba(99,193,223,0.48),transparent_32%),linear-gradient(135deg,#d7eaf4_0%,#a9cedf_48%,#4b85a8_100%)]"
                    : "bg-[#0B2435]"
                }`}
              >
                <Image
                  src={product.images[0]}
                  alt={product.title}
                  fill
                  sizes="100vw"
                  className={`transition duration-700 ease-out group-hover:scale-[1.015] ${
                    product.id === "payload-modules"
                      ? "object-contain object-top p-8 pb-[270px] md:p-14 md:pb-[300px] lg:p-16 lg:pb-[320px]"
                      : "object-cover"
                  }`}
                  priority={index === 0}
                />
              </div>
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(6,28,43,0.54)_0%,rgba(6,28,43,0.18)_40%,transparent_76%),linear-gradient(0deg,rgba(6,28,43,0.66)_0%,rgba(6,28,43,0.06)_58%,transparent_100%)]" />

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

function SectionHeading({ title, description, align = "center" }: { title: React.ReactNode; description?: React.ReactNode; align?: "center" | "left" }) {
  const isLeftAligned = align === "left";

  return (
    <div className={`section-heading ${isLeftAligned ? "max-w-3xl text-left" : "mx-auto max-w-4xl text-center"}`}>
      <h2 className="cjk-heading section-title text-4xl font-semibold leading-tight md:text-5xl">{title}</h2>
      {description && <p className={`${isLeftAligned ? "mx-0" : "mx-auto"} cjk-body section-description mt-5 max-w-3xl text-lg leading-8 text-[#525252]`}>{description}</p>}
    </div>
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
          <h3 className="cjk-heading keep-phrase text-lg font-semibold text-[#161616]">{title}</h3>
          <p className="cjk-body card-description mt-2 text-base leading-7 text-[#525252]">{description}</p>
        </div>
      </div>
    </article>
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
