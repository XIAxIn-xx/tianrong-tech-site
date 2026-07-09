import {
  AlertTriangle,
  BadgeCheck,
  Building2,
  ClipboardCheck,
  Factory,
  Flame,
  Headphones,
  Map,
  PackageCheck,
  Radio,
  Route,
  ShieldCheck,
  Truck,
  Wrench
} from "lucide-react";

export type TianrongLocale = "zh-cn";

export type TianrongContent = (typeof content)[TianrongLocale];

const iconMap = {
  AlertTriangle,
  BadgeCheck,
  Building2,
  ClipboardCheck,
  Factory,
  Flame,
  Headphones,
  Map,
  PackageCheck,
  Radio,
  Route,
  ShieldCheck,
  Truck,
  Wrench
};

export function getTianrongIcon(name: keyof typeof iconMap) {
  return iconMap[name];
}

export const content = {
  "zh-cn": {
    lang: "zh-CN",
    nav: ["解决方案", "应用场景", "产品与平台", "项目流程", "服务模式", "联系我们"],
    seo: {
      title: "天戎科技 | 机器人巡检与智能安防解决方案供应商",
      description:
        "天戎科技面向园区、工厂、仓储物流与重点设施，提供四足机器人巡逻、工业巡检、远程操控、租赁部署与运维服务。",
      keywords: ["天戎科技", "机器人巡检", "智能安防", "四足机器人巡逻", "工业巡检", "租赁部署"]
    },
    hero: {
      label: "机器人巡检与智能安防解决方案",
      title: "把机器人巡检部署到真实现场",
      subtitle:
        "天戎科技面向园区、工厂、仓储物流与重点设施，提供四足机器人巡逻、工业巡检、远程操控、租赁部署与运维服务，帮助客户提升巡检效率、降低人工巡查风险，实现更稳定、更可追溯的现场管理。",
      primary: "获取解决方案",
      secondary: "查看应用场景",
      metrics: [
        ["现场勘查", "先看环境，再定方案"],
        ["路线规划", "按巡检点位设计任务"],
        ["租赁部署", "降低一次性投入"],
        ["运维支持", "培训、维保、响应闭环"]
      ]
    },
    capabilityTitle: "从机器人设备到现场交付的一体化能力",
    capabilities: [
      ["PackageCheck", "四足机器人巡逻", "适配园区道路、厂区通道、仓储周界等巡逻路线。"],
      ["Route", "自主巡航与路线规划", "围绕点位、频次、时段与异常规则配置巡检任务。"],
      ["Radio", "远程操控与异常处置", "支持现场画面回传、远程查看、辅助接管和事件上报。"],
      ["ClipboardCheck", "巡检记录与任务管理", "形成巡检过程留痕，方便复盘、考核和管理。"],
      ["Wrench", "租赁部署与运维服务", "按项目提供购买、租赁、培训、维保与服务支持。"]
    ],
    scenarioTitle: "面向真实场景的机器人巡检应用",
    scenarios: [
      ["ShieldCheck", "园区安防巡逻", "夜间巡查、周界巡视、异常画面回传"],
      ["Factory", "工业厂区巡检", "设备区域、危险点位、重复巡检任务"],
      ["Truck", "仓储物流园区", "库区外围、装卸通道、车辆出入口"],
      ["Flame", "消防与应急辅助", "先期侦察、热源查看、危险区域探查"],
      ["Building2", "重点设施巡查", "能源、管廊、地下空间与重点区域"],
      ["AlertTriangle", "异常上报处置", "视频留痕、远程查看、联动响应"]
    ],
    valueTitle: "让巡检更高频、更安全、更可追溯",
    values: [
      "降低夜间和高风险区域人工巡逻压力",
      "提升巡检覆盖范围和执行稳定性",
      "异常情况远程查看、上报与处置",
      "巡检过程形成记录，便于追溯和管理",
      "支持购买、租赁和项目制部署"
    ],
    processTitle: "从现场勘查到运维支持的完整交付流程",
    process: ["需求沟通", "现场勘查", "方案设计", "路线规划", "设备部署", "人员培训", "试运行", "运维支持"],
    serviceTitle: "灵活的购买、租赁与运维服务模式",
    services: [
      ["设备购买", "适合长期固定场景和自有团队运营。"],
      ["短期/长期租赁", "适合试点、临时项目或预算分期投入。"],
      ["远程代操", "为缺少操作人员的客户提供远程协助。"],
      ["部署培训", "把操作、巡检、应急流程教给现场团队。"],
      ["维保服务", "覆盖设备巡检、故障处理与配置优化。"],
      ["SLA 支持", "按项目约定响应机制和服务周期。"]
    ],
    experienceTitle: "适用于园区、工厂与仓储物流等多类现场",
    experiences: [
      "园区夜间安防巡逻方案",
      "工厂重点设备巡检方案",
      "仓储物流周界巡查方案"
    ],
    contactTitle: "告诉我们你的现场与巡检需求",
    contactCopy:
      "无论是园区夜间巡逻、工业设备巡检，还是仓储物流园区的安防与运维需求，天戎科技都可以根据现场环境、巡检路线和服务模式，协助匹配合适的机器人巡检解决方案。",
    contactButton: "联系天戎科技"
  }
} as const;

export function getTianrongContent(locale: TianrongLocale) {
  return content[locale];
}
