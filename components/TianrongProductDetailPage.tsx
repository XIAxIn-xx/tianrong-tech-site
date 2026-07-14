import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";

type ProductKey = "body" | "payload" | "robox" | "rsp";

type CatalogItem = {
  title: string;
  model: string;
  description: string;
  image: string;
};

type Feature = {
  title: string;
  description: string;
};

type ProductDetail = {
  label: string;
  title: string;
  description: string;
  heroImage: string;
  heroAlt: string;
  overview: string;
  highlights: string[];
  catalog?: CatalogItem[];
  features?: Feature[];
};

const productDetails: Record<ProductKey, ProductDetail> = {
  body: {
    label: "机器人本体",
    title: "足式与轮足式机器人本体",
    description: "覆盖不同尺寸和运动形态的移动平台，根据负载、地形和巡检距离选择合适的机器人本体。",
    heroImage: "/images/tianrong/final-assets/body-tr-m1.png",
    heroAlt: "中型四足机器人",
    overview: "从室内通道、园区道路到复杂地形，天戎机器人本体为任务载荷和远程平台提供稳定的移动基础。",
    highlights: ["足式平台适合坡面、台阶和复杂地形", "轮足平台适合平整道路和长距离移动", "支持按任务组合不同载荷与接入设备"],
    catalog: [
      { model: "TR-S1", title: "小型四足平台", description: "适用于室内通道、轻量巡检和教学展示。", image: "/images/tianrong/final-assets/body-tr-s1.png" },
      { model: "TR-M1", title: "中型四足平台", description: "适用于园区巡逻、安防和工业巡检。", image: "/images/tianrong/final-assets/body-tr-m1.png" },
      { model: "TR-L1", title: "大型四足平台", description: "面向高负载、长续航和复杂地形任务。", image: "/images/tianrong/final-assets/body-tr-l1.png" },
      { model: "TR-S1W", title: "小型轮足平台", description: "适用于平整路面和短距离高频巡检。", image: "/images/tianrong/final-assets/body-tr-s1w.png" },
      { model: "TR-M1W", title: "中型轮足平台", description: "适用于园区道路、仓储通道和长距离巡检。", image: "/images/tianrong/final-assets/body-tr-m1w.png" },
      { model: "TR-L1W", title: "大型轮足平台", description: "适用于大范围场地和复杂路况下的连续作业。", image: "/images/tianrong/final-assets/body-tr-l1w.png" }
    ]
  },
  payload: {
    label: "任务载荷",
    title: "面向巡检任务的模块化载荷",
    description: "围绕视频、检测、通信、计算和现场交互需求，选择适合任务的功能模块。",
    heroImage: "/images/tianrong/final-assets/payload-visible-light.png",
    heroAlt: "可见光巡检载荷",
    overview: "任务载荷可以根据机器人本体和现场环境灵活组合，让同一平台适配不同巡检与检测任务。",
    highlights: ["可见光与热成像覆盖常规巡检和温度识别", "气体检测与边缘计算支持现场风险识别", "通信增强与广播交互适配复杂作业环境"],
    catalog: [
      { model: "VIS", title: "可见光巡检载荷", description: "用于常规视频巡检、点位复核和远程查看。", image: "/images/tianrong/final-assets/payload-visible-light.png" },
      { model: "THERMAL", title: "热成像载荷", description: "用于设备温度异常、热源变化和状态识别。", image: "/images/tianrong/final-assets/payload-thermal.png" },
      { model: "GAS", title: "气体检测载荷", description: "用于气体风险识别和工业现场安全监测。", image: "/images/tianrong/final-assets/payload-gas.png" },
      { model: "COM", title: "通信增强载荷", description: "用于弱网区域、复杂园区和远距链路增强。", image: "/images/tianrong/final-assets/payload-communication.png" },
      { model: "EDGE", title: "边缘计算载荷", description: "用于现场推理、事件初筛和低延迟处理。", image: "/images/tianrong/final-assets/payload-edge-compute.png" },
      { model: "VOICE", title: "广播交互载荷", description: "用于安防巡逻、现场提示和远程交互。", image: "/images/tianrong/final-assets/payload-broadcast.png" }
    ]
  },
  robox: {
    label: "ROBOX",
    title: "ROBOX 机器人远程接入网关",
    description: "将机器人、现场网络与远程管理平台安全连接，实现视频、状态和告警数据回传，并支持远程诊断与控制。",
    heroImage: "/images/generated/robox.png",
    heroAlt: "ROBOX 机器人远程接入网关",
    overview: "ROBOX 位于机器人和远程平台之间，负责现场设备接入、数据回传和远程运维链路。",
    highlights: ["机器人与现场设备", "ROBOX 接入网关", "RSP 平台 / 远程运维端"],
    features: [
      { title: "现场设备接入", description: "统一接入机器人、摄像头和传感器，适配有线与无线网络环境。" },
      { title: "实时数据回传", description: "持续回传视频画面、机器人状态、任务进度和异常告警。" },
      { title: "远程诊断与控制", description: "远程查看设备状态、排查故障、调整配置，并在需要时接管设备。" },
      { title: "平台安全连接", description: "连接现场设备与 RSP 平台，为跨区域运维和多站点管理提供稳定通道。" }
    ]
  },
  rsp: {
    label: "RSP",
    title: "RSP 多机器人调度管理平台",
    description: "集中管理机器人、地图、任务和现场数据，支持多机器人任务编排、运行监控、异常处理和远程运维。",
    heroImage: "/images/tianrong/final-assets/rsp-platform-complete.png",
    heroAlt: "RSP 多机器人调度管理平台界面",
    overview: "RSP 将地图、任务、设备和现场数据集中到统一工作界面，帮助团队完成从任务配置到结果复盘的完整流程。",
    highlights: ["地图与任务编排", "多机器人协同调度", "实时监控、告警与远程运维"],
    features: [
      { title: "地图与任务编排", description: "在统一地图中配置巡检点位、路线、执行时间和任务规则。" },
      { title: "多机器人协同调度", description: "根据机器人状态、位置和任务优先级分配任务，支持多区域协同运行。" },
      { title: "实时监控与异常告警", description: "查看机器人位置、任务进度、设备状态和现场视频，集中处理异常。" },
      { title: "远程运维与控制", description: "支持任务暂停、恢复、重新下发，以及必要时的远程控制和故障处理。" },
      { title: "数据记录与复盘", description: "保存任务结果、巡检记录、告警信息和设备运行数据，方便追溯与分析。" }
    ]
  }
};

export function TianrongProductDetailPage({ product }: { product: ProductKey }) {
  const detail = productDetails[product];

  return (
    <main className="min-h-screen bg-white text-[#161616]">
      <header className="border-b border-[#E0E0E0] bg-white">
        <div className="mx-auto flex h-16 w-[min(1240px,calc(100%-32px))] items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center bg-[#161616] text-sm font-semibold text-white">TR</span>
            <span className="text-base font-semibold">天戎科技</span>
          </Link>
          <Link href="/#matrix" className="inline-flex items-center text-base font-semibold text-[#0F62FE] hover:text-[#0050E6]">
            <ArrowLeft className="mr-2 h-4 w-4" />
            返回产品总览
          </Link>
        </div>
      </header>

      <section className="border-b border-[#E0E0E0] bg-[#F4F8FC]">
        <div className="mx-auto grid min-h-[620px] w-[min(1240px,calc(100%-32px))] items-center gap-12 py-20 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <p className="text-base font-semibold text-[#0F62FE]">{detail.label}</p>
            <h1 className="mt-5 max-w-3xl text-5xl font-semibold leading-tight md:text-6xl">{detail.title}</h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-[#525252]">{detail.description}</p>
            <Link href="/#contact" className="mt-9 inline-flex items-center text-base font-semibold text-[#0F62FE] hover:text-[#0050E6]">
              咨询产品方案
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
          <div className="relative flex min-h-[360px] items-center justify-center bg-white p-8 md:min-h-[460px] md:p-14">
            <div className="absolute inset-0 tianrong-product-grid opacity-20" />
            <Image src={detail.heroImage} alt={detail.heroAlt} width={1672} height={941} className="relative max-h-[420px] w-full object-contain" priority />
          </div>
        </div>
      </section>

      <section className="mx-auto grid w-[min(1240px,calc(100%-32px))] gap-12 py-20 lg:grid-cols-[0.7fr_1.3fr]">
        <div>
          <p className="text-base font-semibold text-[#0F62FE]">产品定位</p>
          <h2 className="mt-4 text-3xl font-semibold leading-tight md:text-4xl">围绕真实任务组织产品能力</h2>
        </div>
        <div>
          <p className="max-w-3xl text-xl leading-9 text-[#1F4F82]">{detail.overview}</p>
          <div className="mt-9 grid gap-x-8 gap-y-5 border-y border-[#D8E6F5] py-6 md:grid-cols-3">
            {detail.highlights.map((item, index) => (
              <div key={item} className="flex gap-3">
                <span className="text-base font-semibold text-[#0F62FE]">{String(index + 1).padStart(2, "0")}</span>
                <p className="text-base leading-7 text-[#393939]">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {detail.catalog && <ProductCatalog items={detail.catalog} />}
      {detail.features && <ProductFeatures items={detail.features} product={product} />}

      <section className="bg-[#161616] py-20 text-white">
        <div className="mx-auto flex w-[min(1240px,calc(100%-32px))] flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-3xl font-semibold md:text-4xl">需要进一步了解产品配置？</h2>
            <p className="mt-4 text-lg leading-8 text-white/70">告诉我们项目场景和阶段，我们会协助你完成产品选型与组合。</p>
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

function ProductCatalog({ items }: { items: CatalogItem[] }) {
  return (
    <section className="border-y border-[#E0E0E0] bg-[#F4F4F4] py-20">
      <div className="mx-auto w-[min(1240px,calc(100%-32px))]">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-base font-semibold text-[#0F62FE]">产品目录</p>
            <h2 className="mt-3 text-3xl font-semibold md:text-4xl">根据任务选择合适的产品</h2>
          </div>
          <p className="max-w-xl text-base leading-7 text-[#525252]">页面展示产品定位与适用方向，具体配置可根据项目环境进一步确认。</p>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <article key={item.model} className="bg-white">
              <div className="relative aspect-[1.35] overflow-hidden bg-[#F4F8FC]">
                <Image src={item.image} alt={item.title} fill className="object-contain p-8" sizes="(max-width: 768px) 100vw, 33vw" />
              </div>
              <div className="border-t border-[#D8E6F5] p-6">
                <p className="text-base font-semibold text-[#0F62FE]">{item.model}</p>
                <h3 className="mt-2 text-2xl font-semibold">{item.title}</h3>
                <p className="mt-3 text-base leading-7 text-[#525252]">{item.description}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProductFeatures({ items, product }: { items: Feature[]; product: ProductKey }) {
  return (
    <section className="border-y border-[#E0E0E0] bg-[#F4F4F4] py-20">
      <div className="mx-auto grid w-[min(1240px,calc(100%-32px))] gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
        <div className="relative overflow-hidden bg-white p-3 md:p-5">
          <Image
            src={product === "rsp" ? "/images/tianrong/final-assets/rsp-platform-complete.png" : "/images/generated/robox.png"}
            alt={product === "rsp" ? "RSP 调度平台界面" : "ROBOX 接入网关"}
            width={1672}
            height={941}
            className="w-full object-contain"
          />
        </div>
        <div>
          <p className="text-base font-semibold text-[#0F62FE]">核心能力</p>
          <div className="mt-4 border-y border-[#C7DBF2]">
            {items.map((item, index) => (
              <article key={item.title} className="border-t border-[#C7DBF2] py-5 first:border-t-0">
                <div className="flex gap-4">
                  <span className="text-base font-semibold text-[#0F62FE]">{String(index + 1).padStart(2, "0")}</span>
                  <div>
                    <h3 className="text-xl font-semibold">{item.title}</h3>
                    <p className="mt-2 text-base leading-7 text-[#525252]">{item.description}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
