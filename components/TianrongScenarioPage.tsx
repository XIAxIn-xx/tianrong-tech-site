"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  CircleDot,
  Layers3,
  Languages,
  MonitorCog,
  Route,
  ShieldCheck,
  type LucideIcon
} from "lucide-react";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import DotField from "@/components/DotField";
import { HeroRobotPreview } from "@/components/hero/hero-robot-preview";
import CircularGallery from "@/components/effects/circular-gallery";

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


const matrix = [
  { title: "机器人本体系列", copy: "提供四足机器人移动底座，承载巡检、安防与行业作业模块。", image: "/images/generated/argos-body.png" },
  { title: "模块化背包系列", copy: "围绕任务快速换装，把巡检、检测、通信和算力装到同一平台。", image: "/images/generated/modular-backpack.png" },
  { title: "标准足端模块", copy: "面向楼梯、坡道、碎石和室内外混合地面，保证稳定支撑。", image: "/images/generated/standard-feet.png" },
  { title: "轮足运动模块", copy: "在园区道路和仓储通道中提升长距离移动效率。", image: "/images/generated/wheel-foot-module.png" },
  { title: "ROBOX 盒子", copy: "作为现场接入与边缘控制单元，连接机器人、网络和远程操控。", image: "/images/generated/robox.png" },
  { title: "机器人调度平台", copy: "统一地图、任务、设备、告警、数据回传和运行记录。", image: "/images/generated/mission-control-ui.png" }
];

const matrixFlow = ["机器人本体", "模块化背包", "标准足端 / 轮足", "ROBOX 接入", "调度平台", "场景落地"];

const robotBodies = [
  ["小型四足机器人", "适合轻量巡检、教育展示、室内通道与轻载任务。", "轻量级", "室内 / 轻载"],
  ["中型四足机器人", "适合园区巡检、安防巡逻、工业点位巡检等常规任务。", "标准级", "园区 / 工业"],
  ["大型四足机器人", "适合更高负载、更复杂地形与更长时间任务。", "高负载", "复杂地形"],
  ["轮足四足机器人", "适合园区道路、仓储通道、长距离巡检与效率优先场景。", "高效率", "道路 / 仓储"]
];

const bodyDimensions = ["尺寸等级", "负载能力", "续航能力", "地形适应", "适配场景", "可扩展接口"];

const backpacks = [
  ["标准巡检背包", "园区、厂区、仓储通道巡检", "视频回传、路线任务、巡检记录", "相机、补光、定位模块"],
  ["安防巡逻背包", "周界巡视、夜间巡逻、异常复核", "喊话、警示、实时画面", "云台、照明、声光模块"],
  ["工业检测背包", "设备区、管廊、重点点位巡检", "热成像、气体检测、数据采集", "传感器、边缘网关"],
  ["通信增强背包", "弱网、室外大范围、复杂园区", "链路增强、远距回传", "通信模组、中继设备"],
  ["边缘算力背包", "本地识别、模型推理、低延迟任务", "边缘计算、事件初筛", "算力盒、存储模块"]
];

const rspFeatures = ["地图管理", "任务调度", "设备管理", "告警联动", "数据回传", "报告生成", "多终端访问", "远程控制入口"];

const casePoints = [
  "围绕物流园区道路、仓储外围与重点点位进行机器人巡检实践。",
  "验证四足机器人在园区巡检、任务执行、远程查看与数据留痕中的适配能力。",
  "为后续安防、巡检、仓储和应急等行业方案提供软硬件能力样板。"
];

const caseImages = [
  ["/images/tianrong/logistics-route-a.png", "物流园区路线实践"],
  ["/images/tianrong/logistics-route-b.png", "仓储物流园区巡检路线"],
  ["/images/tianrong/park-west-gate.png", "园区出入口巡检实践"]
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
          <Link href="/en" className="inline-flex items-center gap-2 border border-[#E0E0E0] bg-white px-3 py-2 text-sm font-semibold">
            <Languages className="h-4 w-4" />
            EN
          </Link>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden border-b border-[#E0E0E0] bg-[#F4F4F4]">
          <div className="absolute inset-0 tianrong-product-grid opacity-70" />
          <DotField
            className="absolute inset-0 pointer-events-none"
            dotRadius={1.5}
            dotSpacing={13}
            bulgeStrength={75}
            glowRadius={180}
            sparkle={false}
            waveAmplitude={0}
            cursorRadius={520}
            cursorForce={0.12}
            bulgeOnly
            gradientFrom="rgba(70, 150, 255, 0.45)"
            gradientTo="rgba(120, 100, 220, 0.28)"
            glowColor="#071426"
          />
          <div className="relative z-10 mx-auto grid min-h-[calc(100vh-4rem)] w-[min(1240px,calc(100%-32px))] items-center gap-8 py-16 lg:grid-cols-[0.8fr_1.2fr]">
            <div className="relative z-10">
              <div className="inline-flex border border-[#E0E0E0] bg-white px-3 py-2 text-sm text-[#525252]">
                ARGOS / ROBOX / RSP
              </div>
              <motion.h1
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.65, delay: 0.08 }}
                className="mt-7 max-w-4xl text-5xl font-light leading-[1.08] md:text-7xl"
              >
                机器人软硬件能力平台
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.65, delay: 0.16 }}
                className="mt-7 max-w-2xl text-lg leading-8 text-[#525252]"
              >
                天戎科技提供机器人本体系列、模块化背包系列、足端与运动模块，为行业机器人解决方案提供能力底座。
              </motion.p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg" className="rounded-none bg-[#0F62FE] text-white shadow-none hover:bg-[#0050E6]">
                  <a href="#matrix">
                    查看产品矩阵
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </a>
                </Button>
                <Button asChild variant="dark" size="lg" className="rounded-none border border-[#161616] bg-white text-[#161616] hover:bg-[#E0E0E0]">
                  <a href="#modules">查看模块能力</a>
                </Button>
              </div>
            </div>

            <ProductStage />
          </div>
        </section>

        <RevealSection id="matrix" className="bg-white py-20">
          <SectionTitle eyebrow="产品矩阵" title="从本体到平台的机器人能力矩阵" />
          <div className="mt-8 grid border border-[#E0E0E0] bg-[#E0E0E0] lg:grid-cols-[1.05fr_0.95fr]">
            <div className="relative min-h-[620px] overflow-hidden bg-[#F4F4F4]">
              <div className="absolute inset-0 tianrong-product-grid opacity-45" />
              <div className="absolute left-6 top-6 z-20 border border-[#E0E0E0] bg-white px-3 py-2 text-sm text-[#525252]">
                可组合能力单元
              </div>
              <CircularGallery
                items={matrix.map((item) => ({ image: item.image, text: item.title }))}
                bend={2.2}
                textColor="#161616"
                borderRadius={0.01}
                scrollSpeed={1.6}
                scrollEase={0.045}
                font="600 26px sans-serif"
              />
            </div>
            <div className="grid bg-white lg:grid-rows-[auto_1fr]">
              <div className="border-b border-[#E0E0E0] p-8">
                <p className="max-w-2xl text-xl leading-8 text-[#393939]">
                  围绕机器人本体系列、模块化背包系列、足端与轮足运动模块、ROBOX 盒子、机器人调度平台和场景化集成服务，形成可组合的机器人软硬件能力体系。
                </p>
              </div>
              <div className="grid gap-px bg-[#E0E0E0] md:grid-cols-2 lg:grid-cols-1">
                {matrix.map((item, index) => (
                  <div key={item.title} className="grid grid-cols-[64px_1fr] bg-white">
                    <div className="border-r border-[#E0E0E0] p-5 text-sm font-semibold text-[#0F62FE]">
                      {String(index + 1).padStart(2, "0")}
                    </div>
                    <div className="p-5">
                      <div className="font-semibold text-[#161616]">{item.title}</div>
                      <div className="mt-2 leading-6 text-[#525252]">{item.copy}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-6 grid border border-[#E0E0E0] bg-[#E0E0E0] text-sm font-semibold text-[#525252] md:grid-cols-6">
            {matrixFlow.map((item, index) => (
              <div key={item} className="bg-[#F4F4F4] p-4">
                <div className="text-xs text-[#8C8C8C]">STEP {String(index + 1).padStart(2, "0")}</div>
                <div className="mt-3 flex items-center justify-between gap-3">
                  <span>{item}</span>
                  {index < matrixFlow.length - 1 && <ArrowRight className="h-4 w-4 shrink-0 text-[#0F62FE]" />}
                </div>
              </div>
            ))}
          </div>
        </RevealSection>

        <RevealSection id="bodies" className="border-y border-[#E0E0E0] bg-[#F4F4F4] py-20">
          <SectionTitle eyebrow="机器人本体系列" title="机器人本体系列" />
          <div className="mt-8 grid border border-[#E0E0E0] bg-white lg:grid-cols-[0.92fr_1.08fr]">
            <div className="relative min-h-[540px] overflow-hidden border-b border-[#E0E0E0] bg-white lg:border-b-0 lg:border-r">
              <div className="absolute inset-0 tianrong-product-grid opacity-35" />
              <div className="absolute left-6 top-6 z-10 border border-[#E0E0E0] bg-white px-3 py-2 text-sm text-[#525252]">
                ARGOS body family
              </div>
              <div className="relative flex h-full min-h-[540px] items-center justify-center p-10">
                <Image
                  src="/images/generated/argos-body.png"
                  alt="天戎科技机器人本体系列"
                  width={960}
                  height={720}
                  className="max-h-[420px] w-full object-contain"
                />
              </div>
            </div>
            <div className="grid bg-[#E0E0E0] md:grid-cols-2">
              <div className="bg-white p-8 md:col-span-2">
                <p className="max-w-3xl text-xl leading-8 text-[#393939]">
                  覆盖小型、中型、大型与轮足形态的四足机器人本体，面向不同负载、续航、地形与部署场景，提供可组合的移动作业基础。
                </p>
              </div>
              {robotBodies.map(([name, copy, level, scene], index) => (
                <motion.article
                  key={name}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ delay: index * 0.04 }}
                  className="bg-white p-6"
                >
                  <div className="text-xs font-semibold text-[#0F62FE]">BODY / {index + 1}</div>
                  <h3 className="mt-8 text-2xl font-semibold">{name}</h3>
                  <p className="mt-4 leading-7 text-[#525252]">{copy}</p>
                  <div className="mt-6 flex flex-wrap gap-2 text-sm font-semibold text-[#525252]">
                    <span className="border border-[#E0E0E0] bg-[#F4F4F4] px-3 py-2">{level}</span>
                    <span className="border border-[#E0E0E0] bg-[#F4F4F4] px-3 py-2">{scene}</span>
                  </div>
                </motion.article>
              ))}
            </div>
          </div>
          <div className="mt-4 grid border border-[#E0E0E0] bg-[#E0E0E0] text-sm font-semibold text-[#525252] sm:grid-cols-3 lg:grid-cols-6">
            {bodyDimensions.map((item) => (
              <span key={item} className="bg-white p-4">{item}</span>
            ))}
          </div>
        </RevealSection>

        <RevealSection id="modules" className="border-y border-[#E0E0E0] bg-[#F4F4F4] py-20">
          <SectionTitle eyebrow="模块化背包系列" title="模块化背包系列" />
          <div className="mt-8 grid border border-[#E0E0E0] bg-[#E0E0E0] lg:grid-cols-[0.95fr_1.05fr]">
            <div className="relative min-h-[560px] overflow-hidden bg-white">
              <div className="absolute left-6 top-6 z-10 border border-[#E0E0E0] bg-white px-3 py-2 text-sm text-[#525252]">
                Mission payload system
              </div>
              <Image
                src="/images/tianrong/backpack-series.png"
                alt="天戎科技模块化背包系列"
                width={1456}
                height={1024}
                className="h-full min-h-[560px] w-full object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 border-t border-[#E0E0E0] bg-white/92 p-6 backdrop-blur">
                <div className="flex items-start gap-4">
                  <Layers3 className="mt-1 h-7 w-7 shrink-0 text-[#0F62FE]" />
                  <p className="max-w-2xl text-lg leading-8 text-[#393939]">
                    面向巡检、安防、工业检测、通信增强与边缘计算等任务需求，提供可快速组合和替换的模块化载荷能力。
                  </p>
                </div>
              </div>
            </div>
            <div className="grid gap-px bg-[#E0E0E0]">
              {backpacks.map(([name, task, core, extend], index) => (
                <motion.article
                  key={name}
                  initial={{ opacity: 0, x: 24 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ delay: index * 0.04 }}
                  className="grid bg-white md:grid-cols-[0.48fr_0.52fr]"
                >
                  <div className="border-b border-[#E0E0E0] p-6 md:border-b-0 md:border-r">
                    <div className="text-sm font-semibold text-[#0F62FE]">BACKPACK / {index + 1}</div>
                    <h3 className="mt-8 text-2xl font-semibold">{name}</h3>
                  </div>
                  <div className="grid gap-px bg-[#E0E0E0] sm:grid-cols-3 md:grid-cols-1">
                    <MiniSpec label="适配任务" value={task} />
                    <MiniSpec label="核心能力" value={core} />
                    <MiniSpec label="可扩展组件" value={extend} />
                  </div>
                </motion.article>
              ))}
            </div>
          </div>
        </RevealSection>

        <RevealSection className="bg-white py-20">
          <SectionTitle eyebrow="运动扩展" title="标准足端与轮足运动模块" />
          <div className="mt-12 overflow-hidden border border-[#E0E0E0] bg-[#F4F4F4]">
            <Image
              src="/images/tianrong/foot-wheel-module.png"
              alt="标准足端模块与轮足运动模块对比"
              width={1456}
              height={1024}
              className="h-auto w-full object-cover"
            />
          </div>
          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <MotionModule title="标准足端模块" icon={CircleDot} copy="常规足式移动、稳定支撑与复杂地形通过。" labels={["稳定支撑", "复杂地形", "常规巡检"]} />
            <MotionModule title="轮足运动模块" icon={Route} copy="平整道路、仓储通道和长距离巡检，提升移动效率。" labels={["长距离移动", "平整道路", "效率提升"]} />
          </div>
        </RevealSection>

        <RevealSection id="robox" className="bg-white py-20">
          <SectionTitle eyebrow="ROBOX 盒子" title="ROBOX 盒子" />
          <div className="mt-8 border border-[#E0E0E0] bg-white">
            <div className="grid border-b border-[#E0E0E0] lg:grid-cols-[0.95fr_1.05fr]">
              <div className="relative min-h-[460px] overflow-hidden border-b border-[#E0E0E0] bg-[#F4F4F4] lg:border-b-0 lg:border-r">
                <div className="absolute inset-0 tianrong-product-grid opacity-40" />
                <div className="absolute left-6 top-6 z-10 border border-[#E0E0E0] bg-white px-3 py-2 text-sm text-[#525252]">
                  Edge control unit
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
                  面向机器人远程控制与现场接入的边缘控制单元，连接机器人本体、网络链路与调度平台，为远程查看、远程接管和任务协同提供硬件入口。
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
                ["网络接口", "待补充"],
                ["视频输入", "待补充"],
                ["控制接口", "待补充"],
                ["电源输入", "待补充"],
                ["工作温度", "待补充"],
                ["安装方式", "待补充"],
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

        <RevealSection id="rsp" className="border-y border-[#E0E0E0] bg-[#F4F4F4] py-20">
          <SectionTitle eyebrow="机器人调度平台" title="机器人调度平台" />
          <div className="mt-8 grid border border-[#E0E0E0] bg-[#E0E0E0] lg:grid-cols-[1.1fr_0.9fr]">
            <div className="relative overflow-hidden bg-white p-6">
              <div className="mb-4 flex items-center gap-3 text-sm font-semibold text-[#525252]">
                <MonitorCog className="h-5 w-5 text-[#0F62FE]" />
                Mission control interface
              </div>
              <Image
                src="/images/tianrong/rsp-monitor.png"
                alt="机器人调度平台真实界面"
                width={1088}
                height={1392}
                className="h-full max-h-[680px] w-full object-cover object-top"
              />
            </div>
            <div className="grid bg-white">
              <div className="border-b border-[#E0E0E0] p-8">
                <h3 className="max-w-xl text-4xl font-semibold leading-tight">用真实平台界面承载地图、任务、设备和远程控制入口。</h3>
                <p className="mt-5 leading-8 text-[#525252]">
                  面向项目团队、集成伙伴与运营人员，提供地图管理、任务调度、设备管理、告警联动、报告生成与远程控制入口，帮助团队统一管理机器人任务。
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
              <h3 className="mt-24 text-4xl font-semibold leading-tight">围绕物流园区验证机器人本体、模块化背包、任务路线与远程查看能力。</h3>
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

function ProductStage() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.7 }}
      className="relative z-10 h-[420px] overflow-visible md:h-[520px]"
    >
      <HeroRobotPreview />
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

function MiniSpec({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white p-5">
      <div className="text-sm font-semibold text-[#0F62FE]">{label}</div>
      <p className="mt-4 leading-7 text-[#525252]">{value}</p>
    </div>
  );
}

function MotionModule({ title, icon: Icon, copy, labels }: { title: string; icon: LucideIcon; copy: string; labels: string[] }) {
  return (
    <article className="relative min-h-[360px] overflow-hidden border border-[#E0E0E0] bg-[#F4F4F4] p-7">
      <div className="absolute right-8 top-8 grid h-28 w-28 place-items-center rounded-full border border-[#0F62FE] bg-white tianrong-wheel-spin">
        <Icon className="h-12 w-12 text-[#0F62FE]" />
      </div>
      <h3 className="max-w-sm text-4xl font-semibold">{title}</h3>
      <p className="mt-5 max-w-md leading-8 text-[#525252]">{copy}</p>
      <div className="absolute bottom-7 left-7 right-7 flex flex-wrap gap-2">
        {labels.map((label) => (
          <span key={label} className="border border-[#E0E0E0] bg-white px-3 py-2 text-sm font-semibold">
            {label}
          </span>
        ))}
      </div>
    </article>
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
