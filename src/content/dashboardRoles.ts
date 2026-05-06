import type { Locale, LocalizedText } from "@/content/datacenters";
import { datacenters } from "@/content/datacenters";
import { serversByDatacenter } from "@/content/servers";
import type { ChainData } from "@/lib/useChainData";

export type DashboardRole = "visitor" | "operator" | "developer";

export type RoleOption = {
  id: DashboardRole;
  label: LocalizedText;
  hint: LocalizedText;
};

export type EconomyMetric = {
  label: LocalizedText;
  value: string;
  tone?: "accent" | "cyan" | "emerald" | "amber";
};

export type EfficiencyNode = {
  id: string;
  name: LocalizedText;
  efficiencyScore: number;
  dailyOutputNos: string;
  costPerPh: string;
  powerPerPh: string;
};

export type RevenuePoint = {
  label: string;
  outputNos: number;
  utilization: number;
};

export const dashboardRoles: RoleOption[] = [
  {
    id: "visitor",
    label: { en: "Visitor", zh: "访客" },
    hint: { en: "Brand + network overview", zh: "品牌与网络总览" },
  },
  {
    id: "operator",
    label: { en: "Operator", zh: "运营" },
    hint: { en: "Fleet health + routing", zh: "节点健康与调度" },
  },
  {
    id: "developer",
    label: { en: "Developer", zh: "开发者" },
    hint: { en: "API + integration status", zh: "接口与接入状态" },
  },
];

function totalServerCount() {
  return Object.values(serversByDatacenter).reduce((sum, servers) => sum + servers.length, 0);
}

function onlineServerCount() {
  return Object.values(serversByDatacenter).reduce(
    (sum, servers) => sum + servers.filter((server) => server.status === "online").length,
    0,
  );
}

function totalPowerWatts() {
  return Object.values(serversByDatacenter).reduce(
    (sum, servers) => sum + servers.reduce((dcSum, server) => dcSum + server.powerWatts, 0),
    0,
  );
}

function formatNos(value: number) {
  return value.toFixed(1);
}

function roleAwareChainMultiplier(chainData: ChainData | null) {
  if (!chainData) return 1;
  return 1 + (chainData.txCount % 11) / 100;
}

export function buildEconomyMetrics(locale: Locale, chainData: ChainData | null): EconomyMetric[] {
  const totalHashrate = datacenters.reduce((sum, dc) => sum + Number.parseFloat(dc.hashrate), 0);
  const multiplier = roleAwareChainMultiplier(chainData);
  const dailyOutput = totalHashrate * 8.6 * multiplier;
  const monthlyRevenue = dailyOutput * 30 * 0.83;
  const powerMw = totalPowerWatts() / 1_000_000;
  const onlineRatio = onlineServerCount() / Math.max(totalServerCount(), 1);

  return [
    {
      label: locale === "zh" ? { en: "24H Output", zh: "24H 产出" } : { en: "24H Output", zh: "24H 产出" },
      value: `${formatNos(dailyOutput)} NOS`,
      tone: "accent",
    },
    {
      label: locale === "zh" ? { en: "Monthly Revenue", zh: "预估月产值" } : { en: "Monthly Revenue", zh: "Monthly Revenue" },
      value: `${formatNos(monthlyRevenue)} NOS`,
      tone: "emerald",
    },
    {
      label: locale === "zh" ? { en: "Power Draw", zh: "实时功耗" } : { en: "Power Draw", zh: "实时功耗" },
      value: `${powerMw.toFixed(2)} MW`,
      tone: "cyan",
    },
    {
      label: locale === "zh" ? { en: "Availability", zh: "在线率" } : { en: "Availability", zh: "Availability" },
      value: `${(onlineRatio * 100).toFixed(2)}%`,
      tone: "amber",
    },
  ];
}

export function buildEfficiencyNodes(): EfficiencyNode[] {
  return datacenters
    .map((dc, index) => {
      const baseHashrate = Number.parseFloat(dc.hashrate);
      const serverCount = serversByDatacenter[dc.id]?.length ?? dc.nodeCount;
      const efficiencyScore = Math.round(78 + baseHashrate * 2.1 - index * 1.4 + (serverCount % 5));
      const dailyOutput = baseHashrate * 8.2 + (serverCount % 7) * 0.6;
      const costPerPh = 182 + index * 9 + (serverCount % 4) * 3;
      const powerPerPh = 0.22 + index * 0.01;

      return {
        id: dc.id,
        name: dc.name,
        efficiencyScore,
        dailyOutputNos: `${dailyOutput.toFixed(1)} NOS`,
        costPerPh: `$${costPerPh.toFixed(0)}/PH`,
        powerPerPh: `${powerPerPh.toFixed(2)} MW/PH`,
      };
    })
    .sort((a, b) => b.efficiencyScore - a.efficiencyScore)
    .slice(0, 5);
}

export function buildRevenueSeries(chainData: ChainData | null): RevenuePoint[] {
  const base = chainData?.blockNumber ?? 0;
  return Array.from({ length: 7 }, (_, index) => {
    const wave = Math.sin((base + index * 13) / 37);
    const utilization = 82 + wave * 9 + index;
    const outputNos = 168 + wave * 18 + index * 5;

    return {
      label: `${index + 1}D`,
      outputNos: Number(outputNos.toFixed(1)),
      utilization: Number(utilization.toFixed(1)),
    };
  });
}

export function buildRoleSummary(locale: Locale, role: DashboardRole) {
  const summaries: Record<DashboardRole, LocalizedText> = {
    visitor: {
      en: "Global network showcase with live chain telemetry and compute posture.",
      zh: "聚焦品牌展示、全球网络态势与实时链上可视化。",
    },
    operator: {
      en: "Operate fleet health, maintenance rhythm, and routing posture from one surface.",
      zh: "把节点健康、维护节奏与链路态势收敛到同一控制面。",
    },
    developer: {
      en: "Track RPC, API, and integration readiness for external builders.",
      zh: "面向接入方展示 RPC、API 与集成就绪状态。",
    },
  };

  return summaries[role][locale];
}
