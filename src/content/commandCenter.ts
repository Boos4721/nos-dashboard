import type { Locale, LocalizedText } from "@/content/datacenters";

export type CommandCenterEvent = {
  id: string;
  level: "critical" | "warning" | "info";
  code: string;
  message: LocalizedText;
  timestamp: string;
};

export type CommandCenterSignal = {
  label: LocalizedText;
  value: string;
  tone: "accent" | "cyan" | "emerald" | "amber";
};

const eventPool: Omit<CommandCenterEvent, "id" | "timestamp">[] = [
  {
    level: "warning",
    code: "LATENCY_SPIKE",
    message: {
      en: "Hangzhou edge ingress latency rose above baseline and auto-routed to backup mesh.",
      zh: "杭州边缘入口延迟高于基线，系统已自动切换到备用链路。",
    },
  },
  {
    level: "critical",
    code: "POWER_BAND",
    message: {
      en: "Karamay backbone entered constrained power band. Capacity throttling policy engaged.",
      zh: "克拉玛依骨干进入功耗约束带，已启用容量节流策略。",
    },
  },
  {
    level: "info",
    code: "PATCH_WINDOW",
    message: {
      en: "Singapore gateway finished rolling patch window with no packet loss detected.",
      zh: "新加坡网关滚动补丁窗口已完成，未检测到丢包。",
    },
  },
  {
    level: "warning",
    code: "ROUTE_SHIFT",
    message: {
      en: "Bangkok relay accepted overflow traffic from Hong Kong public route mesh.",
      zh: "曼谷中继已承接来自香港公网链路的溢出流量。",
    },
  },
  {
    level: "info",
    code: "BLOCK_SYNC",
    message: {
      en: "Chain telemetry sync completed. Global control surface aligned to latest block window.",
      zh: "链上遥测同步完成，全球控制面已对齐到最新区块窗口。",
    },
  },
];

export function buildCommandCenterEvents(blockNumber?: number) {
  const seed = blockNumber ?? Math.floor(Date.now() / 15000);

  return Array.from({ length: 4 }, (_, index) => {
    const source = eventPool[(seed + index) % eventPool.length];
    const minutesAgo = (seed + index * 3) % 11;

    return {
      ...source,
      id: `${source.code}-${index}`,
      timestamp: minutesAgo === 0 ? "now" : `${minutesAgo}m`,
    } satisfies CommandCenterEvent;
  });
}

export function buildCommandCenterSignals(locale: Locale, blockNumber?: number): CommandCenterSignal[] {
  const seed = blockNumber ?? Math.floor(Date.now() / 15000);
  const flow = 92 + (seed % 6);
  const alertCount = 2 + (seed % 3);
  const response = 38 + (seed % 9);
  const reserve = 74 + (seed % 11);

  return [
    {
      label: locale === "zh" ? { en: "Flow Index", zh: "流量指数" } : { en: "Flow Index", zh: "流量指数" },
      value: `${flow}%`,
      tone: "accent",
    },
    {
      label: locale === "zh" ? { en: "Alert Queue", zh: "告警队列" } : { en: "Alert Queue", zh: "告警队列" },
      value: `${alertCount}`,
      tone: "amber",
    },
    {
      label: locale === "zh" ? { en: "Response SLA", zh: "响应 SLA" } : { en: "Response SLA", zh: "响应 SLA" },
      value: `${response} ms`,
      tone: "cyan",
    },
    {
      label: locale === "zh" ? { en: "Reserve Capacity", zh: "备用容量" } : { en: "Reserve Capacity", zh: "备用容量" },
      value: `${reserve}%`,
      tone: "emerald",
    },
  ];
}
