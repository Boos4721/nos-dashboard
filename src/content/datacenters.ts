"use client";
import { useEffect, useMemo, useState } from "react";

export type Locale = "en" | "zh";

export type LocalizedText = {
  en: string;
  zh: string;
};

export type Datacenter = {
  id: string;
  name: LocalizedText;
  region: LocalizedText;
  country: LocalizedText;
  coordinates: [number, number];
  hashrate: string;
  nodeCount: number;
  status: "stable" | "expanding" | "observing";
  tags: LocalizedText[];
  notes: LocalizedText;
  latency: LocalizedText;
  powerMix: LocalizedText;
};

export type DatacenterDynamicSnapshot = {
  id: string;
  hashrate: string;
  nodeCount: number;
  latency: LocalizedText;
  updatedAt: number;
};

export type LiveDatacenterSnapshot = {
  id: string;
  hashrate: string;
  nodeCount: number;
  latency: LocalizedText;
  updatedAt: number;
};

const latencyCopy = {
  unit: { en: "ms", zh: "毫秒" },
  intraRegion: { en: "intra-region", zh: "区域内" },
  regional: { en: "regional", zh: "区域级" },
  backbone: { en: "backbone", zh: "骨干网" },
  apacAverage: { en: "APAC average", zh: "亚太平均" },
} as const;

export const datacenters: Datacenter[] = [
  {
    id: "hubei",
    name: { en: "Hubei", zh: "湖北" },
    region: { en: "Central China", zh: "华中" },
    country: { en: "China", zh: "中国" },
    coordinates: [111.2865, 30.6919],
    hashrate: "8.6 PH/s",
    nodeCount: 92,
    status: "stable",
    tags: [
      { en: "Compute", zh: "算力" },
      { en: "Gateway", zh: "网关" },
      { en: "Primary", zh: "主节点" },
    ],
    notes: {
      en: "Core machine room for compute throughput and public-facing service resilience across the mainland cluster.",
      zh: "面向中国大陆集群的核心机房，承担主要算力吞吐与公网服务稳定性。",
    },
    latency: { en: "12 ms intra-region", zh: "12 毫秒 · 区域内" },
    powerMix: { en: "Hydro-priority", zh: "水电优先" },
  },
  {
    id: "shandong",
    name: { en: "Shandong", zh: "山东" },
    region: { en: "East China", zh: "华东" },
    country: { en: "China", zh: "中国" },
    coordinates: [117.0, 36.67],
    hashrate: "6.8 PH/s",
    nodeCount: 65,
    status: "stable",
    tags: [
      { en: "Compute", zh: "算力" },
      { en: "Edge Node", zh: "边缘节点" },
      { en: "Coastal", zh: "沿海" },
    ],
    notes: {
      en: "Shandong coastal compute cluster serving edge inference and cross-region traffic across the Bohai Rim.",
      zh: "山东沿海算力集群，服务边缘推理与环渤海跨区域流量。",
    },
    latency: { en: "11 ms intra-region", zh: "11 毫秒 · 区域内" },
    powerMix: { en: "Grid + wind", zh: "电网 + 风电" },
  },
  {
    id: "xinjiang",
    name: { en: "Xinjiang", zh: "新疆" },
    region: { en: "Western China", zh: "中国西部" },
    country: { en: "China", zh: "中国" },
    coordinates: [84.8892, 45.5799],
    hashrate: "11.2 PH/s",
    nodeCount: 108,
    status: "expanding",
    tags: [
      { en: "Compute", zh: "算力" },
      { en: "Scale-out", zh: "扩容中" },
      { en: "High Throughput", zh: "高吞吐" },
    ],
    notes: {
      en: "Large-capacity western cluster optimized for scale and long-run throughput efficiency.",
      zh: "西部大容量集群，面向规模化扩展与长期吞吐效率优化。",
    },
    latency: { en: "38 ms backbone", zh: "38 毫秒 · 骨干网" },
    powerMix: { en: "Thermal + renewable mix", zh: "火电 + 新能源混合" },
  },
  {
    id: "singapore",
    name: { en: "Singapore", zh: "新加坡" },
    region: { en: "Southeast Asia", zh: "东南亚" },
    country: { en: "Singapore", zh: "新加坡" },
    coordinates: [103.8198, 1.3521],
    hashrate: "4.2 PH/s",
    nodeCount: 38,
    status: "stable",
    tags: [
      { en: "International", zh: "国际" },
      { en: "Gateway", zh: "网关" },
      { en: "API Edge", zh: "API 边缘" },
    ],
    notes: {
      en: "Low-latency international ingress point for operators, dashboards, and cross-region user traffic.",
      zh: "面向运营者、仪表盘与跨区域用户流量的低延迟国际入口。",
    },
    latency: { en: "48 ms APAC average", zh: "48 毫秒 · 亚太平均" },
    powerMix: { en: "Grid optimized", zh: "城市电网优化" },
  },
  {
    id: "hong-kong",
    name: { en: "Hong Kong", zh: "香港" },
    region: { en: "Greater China", zh: "大中华区" },
    country: { en: "China", zh: "中国" },
    coordinates: [114.1694, 22.3193],
    hashrate: "3.8 PH/s",
    nodeCount: 32,
    status: "observing",
    tags: [
      { en: "Explorer", zh: "浏览器" },
      { en: "Relay", zh: "中继" },
      { en: "Public Access", zh: "公网访问" },
    ],
    notes: {
      en: "Edge relay and explorer-friendly region focused on public access, visibility, and cross-border routing.",
      zh: "以公网访问、可视化与跨境路由为重点的边缘中继与浏览器友好区域。",
    },
    latency: { en: "21 ms regional", zh: "21 毫秒 · 区域级" },
    powerMix: { en: "Metro grid", zh: "城市电网" },
  },
  {
    id: "bangkok",
    name: { en: "Bangkok, Thailand", zh: "泰国曼谷" },
    region: { en: "Southeast Asia", zh: "东南亚" },
    country: { en: "Thailand", zh: "泰国" },
    coordinates: [100.5018, 13.7563],
    hashrate: "3.4 PH/s",
    nodeCount: 27,
    status: "expanding",
    tags: [
      { en: "International", zh: "国际" },
      { en: "Gateway", zh: "网关" },
      { en: "Expansion", zh: "扩展节点" },
    ],
    notes: {
      en: "Bangkok node cluster extending Southeast Asia reach for public access, routing diversity, and future capacity growth.",
      zh: "曼谷节点集群扩大东南亚覆盖，用于公网访问、路由多样性与后续容量增长。",
    },
    latency: { en: "56 ms APAC average", zh: "56 毫秒 · 亚太平均" },
    powerMix: { en: "Metro grid", zh: "城市电网" },
  },
  {
    id: "sichuan",
    name: { en: "Sichuan", zh: "四川" },
    region: { en: "Southwest China", zh: "西南" },
    country: { en: "China", zh: "中国" },
    coordinates: [104.0665, 30.5728],
    hashrate: "7.8 PH/s",
    nodeCount: 78,
    status: "expanding",
    tags: [
      { en: "Compute", zh: "算力" },
      { en: "AI Compute", zh: "AI 算力" },
      { en: "Backbone", zh: "骨干节点" },
    ],
    notes: {
      en: "Southwest backbone cluster balancing compute throughput, AI workloads, and resilient routing toward western and central regions.",
      zh: "西南骨干集群，兼顾算力吞吐、AI 负载与面向西部、华中的高韧性路由。",
    },
    latency: { en: "14 ms intra-region", zh: "14 毫秒 · 区域内" },
    powerMix: { en: "Hydro + renewable", zh: "水电 + 新能源" },
  },
  {
    id: "zhejiang",
    name: { en: "Zhejiang", zh: "浙江" },
    region: { en: "East China", zh: "华东" },
    country: { en: "China", zh: "中国" },
    coordinates: [120.1536, 30.2875],
    hashrate: "6.4 PH/s",
    nodeCount: 62,
    status: "expanding",
    tags: [
      { en: "AI Compute", zh: "AI 算力" },
      { en: "Gateway", zh: "网关" },
      { en: "Edge Relay", zh: "边缘中继" },
    ],
    notes: {
      en: "Zhejiang edge cluster optimized for AI inference workloads and low-latency public API routing.",
      zh: "浙江边缘集群，面向 AI 推理负载与低延迟公网 API 路由优化。",
    },
    latency: { en: "9 ms intra-region", zh: "9 毫秒 · 区域内" },
    powerMix: { en: "Grid + renewable", zh: "电网 + 新能源" },
  },
  {
    id: "germany",
    name: { en: "Germany", zh: "德国" },
    region: { en: "Europe", zh: "欧洲" },
    country: { en: "Germany", zh: "德国" },
    coordinates: [8.6821, 50.1109],
    hashrate: "5.8 PH/s",
    nodeCount: 48,
    status: "expanding",
    tags: [
      { en: "Compute", zh: "算力" },
      { en: "EU Gateway", zh: "欧盟网关" },
      { en: "Backbone", zh: "骨干节点" },
    ],
    notes: {
      en: "Frankfurt hub serving EU compute workloads, low-latency relay for European operators and cross-Atlantic backbone.",
      zh: "法兰福枢纽服务欧盟算力负载，面向欧洲运营者的低延迟中继与跨大西洋骨干。",
    },
    latency: { en: "12 ms intra-region", zh: "12 毫秒 · 区域内" },
    powerMix: { en: "Green energy", zh: "绿色能源" },
  },
  {
    id: "france",
    name: { en: "France", zh: "法国" },
    region: { en: "Europe", zh: "欧洲" },
    country: { en: "France", zh: "法国" },
    coordinates: [2.3522, 48.8566],
    hashrate: "3.2 PH/s",
    nodeCount: 28,
    status: "stable",
    tags: [
      { en: "Edge Node", zh: "边缘节点" },
      { en: "API Relay", zh: "API 中继" },
      { en: "Public Access", zh: "公网访问" },
    ],
    notes: {
      en: "Paris edge cluster providing EU API relay, public access surface, and Mediterranean corridor connectivity.",
      zh: "巴黎边缘集群提供欧盟 API 中继、公网访问面与地中海走廊互联。",
    },
    latency: { en: "15 ms regional", zh: "15 毫秒 · 区域级" },
    powerMix: { en: "Nuclear + wind", zh: "核能 + 风电" },
  },
];

export const networkSummary = {
  totalHashrate: "61.2 PH/s",
  totalNodes: 578,
  activeRegions: 10,
  publicSurfaces: 4,
};

const regionLatencyRange: Record<string, [number, number]> = {
  hubei: [10, 15],
  shandong: [9, 14],
  xinjiang: [34, 42],
  singapore: [45, 54],
  "hong-kong": [18, 26],
  bangkok: [51, 60],
  sichuan: [12, 18],
  zhejiang: [8, 13],
  germany: [10, 16],
  france: [13, 19],
};

const regionHashrateVariance: Record<string, number> = {
  hubei: 0.45,
  shandong: 0.42,
  xinjiang: 0.6,
  singapore: 0.18,
  "hong-kong": 0.12,
  bangkok: 0.1,
  sichuan: 0.48,
  zhejiang: 0.38,
  germany: 0.35,
  france: 0.22,
};

const regionNodeVariance: Record<string, number> = {
  hubei: 4,
  shandong: 3,
  xinjiang: 5,
  singapore: 2,
  "hong-kong": 1,
  bangkok: 1,
  sichuan: 4,
  zhejiang: 3,
  germany: 3,
  france: 2,
};

function seededJitter(seed: string, bucketMs: number) {
  const bucket = Math.floor(Date.now() / bucketMs);
  const raw = `${seed}:${bucket}`;
  let hash = 0;
  for (let i = 0; i < raw.length; i += 1) {
    hash = (hash * 31 + raw.charCodeAt(i)) >>> 0;
  }
  return (hash % 1000) / 999;
}

function formatDynamicHashrate(base: string, delta: number) {
  const value = Number.parseFloat(base.replace(" PH/s", ""));
  const next = Math.max(0.6, value + delta);
  return `${next.toFixed(1)} PH/s`;
}

function formatDynamicLatency(id: string, baseLabel: string) {
  const [min, max] = regionLatencyRange[id] ?? [10, 20];
  const jitter = seededJitter(`latency:${id}`, 45_000);
  const next = Math.round(min + (max - min) * jitter);

  if (baseLabel.includes(latencyCopy.intraRegion.en) || baseLabel.includes(latencyCopy.intraRegion.zh)) {
    return {
      en: `${next} ${latencyCopy.unit.en} ${latencyCopy.intraRegion.en}`,
      zh: `${next} ${latencyCopy.unit.zh} · ${latencyCopy.intraRegion.zh}`,
    };
  }
  if (baseLabel.includes(latencyCopy.regional.en) || baseLabel.includes(latencyCopy.regional.zh)) {
    return {
      en: `${next} ${latencyCopy.unit.en} ${latencyCopy.regional.en}`,
      zh: `${next} ${latencyCopy.unit.zh} · ${latencyCopy.regional.zh}`,
    };
  }
  if (baseLabel.includes(latencyCopy.backbone.en) || baseLabel.includes(latencyCopy.backbone.zh)) {
    return {
      en: `${next} ${latencyCopy.unit.en} ${latencyCopy.backbone.en}`,
      zh: `${next} ${latencyCopy.unit.zh} · ${latencyCopy.backbone.zh}`,
    };
  }
  if (baseLabel.includes(latencyCopy.apacAverage.en) || baseLabel.includes(latencyCopy.apacAverage.zh)) {
    return {
      en: `${next} ${latencyCopy.unit.en} ${latencyCopy.apacAverage.en}`,
      zh: `${next} ${latencyCopy.unit.zh} · ${latencyCopy.apacAverage.zh}`,
    };
  }
  return {
    en: `${next} ${latencyCopy.unit.en}`,
    zh: `${next} ${latencyCopy.unit.zh}`,
  };
}

function dynamicNodeCount(id: string, base: number) {
  const variance = regionNodeVariance[id] ?? 1;
  const jitter = seededJitter(`nodes:${id}`, 120_000);
  return Math.max(1, base + Math.round((jitter - 0.5) * variance * 2));
}

export function useDynamicDatacenters() {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setTick((prev) => prev + 1);
    }, 45000);

    return () => window.clearInterval(id);
  }, []);

  return useMemo<DatacenterDynamicSnapshot[]>(() => {
    return datacenters.map((dc) => {
      const variance = regionHashrateVariance[dc.id] ?? 0.2;
      const jitter = seededJitter(`hashrate:${dc.id}`, 60_000);
      const delta = (jitter - 0.5) * variance * 2;

      return {
        id: dc.id,
        hashrate: formatDynamicHashrate(dc.hashrate, delta),
        nodeCount: dynamicNodeCount(dc.id, dc.nodeCount),
        latency: formatDynamicLatency(dc.id, dc.latency.en),
        updatedAt: Date.now(),
      };
    });
  }, [tick]);
}

export function useLiveDatacenters(chainBlockNumber?: number) {
  return useMemo<LiveDatacenterSnapshot[]>(() => {
    const now = Date.now();
    const blockSeed = chainBlockNumber ?? Math.floor(now / 15000);

    return datacenters.map((dc, index) => {
      const variance = regionHashrateVariance[dc.id] ?? 0.2;
      const phase = (blockSeed + index * 17) / 9;
      const hashrateDelta = Math.sin(phase) * variance;
      const nodeDelta = Math.round(Math.cos(phase / 1.7) * (regionNodeVariance[dc.id] ?? 1));
      const [min, max] = regionLatencyRange[dc.id] ?? [10, 20];
      const latencyMid = (min + max) / 2;
      const latencySwing = (max - min) / 2;
      const latencyValue = Math.round(latencyMid + Math.sin(phase / 1.4) * latencySwing);
      const baseLabel = dc.latency.en;

      let latency: LocalizedText;
      if (baseLabel.includes(latencyCopy.intraRegion.en) || baseLabel.includes(latencyCopy.intraRegion.zh)) {
        latency = {
          en: `${latencyValue} ${latencyCopy.unit.en} ${latencyCopy.intraRegion.en}`,
          zh: `${latencyValue} ${latencyCopy.unit.zh} · ${latencyCopy.intraRegion.zh}`,
        };
      } else if (baseLabel.includes(latencyCopy.regional.en) || baseLabel.includes(latencyCopy.regional.zh)) {
        latency = {
          en: `${latencyValue} ${latencyCopy.unit.en} ${latencyCopy.regional.en}`,
          zh: `${latencyValue} ${latencyCopy.unit.zh} · ${latencyCopy.regional.zh}`,
        };
      } else if (baseLabel.includes(latencyCopy.backbone.en) || baseLabel.includes(latencyCopy.backbone.zh)) {
        latency = {
          en: `${latencyValue} ${latencyCopy.unit.en} ${latencyCopy.backbone.en}`,
          zh: `${latencyValue} ${latencyCopy.unit.zh} · ${latencyCopy.backbone.zh}`,
        };
      } else if (baseLabel.includes(latencyCopy.apacAverage.en) || baseLabel.includes(latencyCopy.apacAverage.zh)) {
        latency = {
          en: `${latencyValue} ${latencyCopy.unit.en} ${latencyCopy.apacAverage.en}`,
          zh: `${latencyValue} ${latencyCopy.unit.zh} · ${latencyCopy.apacAverage.zh}`,
        };
      } else {
        latency = {
          en: `${latencyValue} ${latencyCopy.unit.en}`,
          zh: `${latencyValue} ${latencyCopy.unit.zh}`,
        };
      }

      return {
        id: dc.id,
        hashrate: formatDynamicHashrate(dc.hashrate, hashrateDelta),
        nodeCount: Math.max(1, dc.nodeCount + nodeDelta),
        latency,
        updatedAt: now,
      };
    });
  }, [chainBlockNumber]);
}
