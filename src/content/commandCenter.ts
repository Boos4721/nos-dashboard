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
      en: "Zhejiang edge ingress latency rose above baseline and auto-routed to backup mesh.",
      zh: "浙江边缘入口延迟高于基线，系统已自动切换到备用链路。",
    },
  },
  {
    level: "critical",
    code: "POWER_BAND",
    message: {
      en: "Xinjiang backbone entered constrained power band. Capacity throttling policy engaged.",
      zh: "新疆骨干进入功耗约束带，已启用容量节流策略。",
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
      en: "Thailand relay accepted overflow traffic from Hong Kong public route mesh.",
      zh: "泰国中继已承接来自香港公网链路的溢出流量。",
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
  {
    level: "warning",
    code: "COOLING_DRIFT",
    message: {
      en: "Hubei compute cluster cooling delta widened. Thermal balancing policy raised fan curve.",
      zh: "湖北算力集群冷却温差扩大，系统已提升散热曲线。",
    },
  },
  {
    level: "info",
    code: "VALIDATOR_ROTATE",
    message: {
      en: "Primary validator quorum rotated successfully with no missed block signatures.",
      zh: "主验证节点法定集已平滑轮换，未出现缺失签名。",
    },
  },
  {
    level: "warning",
    code: "BANDWIDTH_SURGE",
    message: {
      en: "Hong Kong public relay observed ingress surge and opened reserve bandwidth lane.",
      zh: "香港公网中继检测到入口流量突增，已开启备用带宽通道。",
    },
  },
  {
    level: "critical",
    code: "STORAGE_REBUILD",
    message: {
      en: "Sichuan storage shard entered rebuild mode after integrity threshold alert.",
      zh: "四川存储分片因完整性阈值告警进入重建模式。",
    },
  },
  {
    level: "info",
    code: "EDGE_CACHE_WARM",
    message: {
      en: "Regional edge cache warm-up finished and request latency returned to target envelope.",
      zh: "区域边缘缓存预热完成，请求延迟已回归目标区间。",
    },
  },
  {
    level: "warning",
    code: "ACCESS_HANDSHAKE",
    message: {
      en: "Secure access layer retried handshake on one ingress segment and restored tunnel continuity.",
      zh: "安全接入层在单入口段重试握手后已恢复隧道连续性。",
    },
  },
  {
    level: "info",
    code: "CONTROL_RELAY",
    message: {
      en: "Command relay heartbeat stabilized across the cross-region ops fabric.",
      zh: "跨区域运维链路的控制中继心跳已恢复稳定。",
    },
  },
];

export function buildCommandCenterEvents(blockNumber?: number) {
  const seed = blockNumber ?? Math.floor(Date.now() / 15000);

  return Array.from({ length: 8 }, (_, index) => {
    const source = eventPool[(seed + index) % eventPool.length];
    const minutesAgo = (seed + index * 2) % 17;

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
