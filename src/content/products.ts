export type ProductLink = {
  name: { en: string; zh: string };
  href: string;
  label: { en: string; zh: string };
  summary: { en: string; zh: string };
  points: { en: string; zh: string }[];
};

export const products: ProductLink[] = [
  {
    name: { en: "NOS Official Site", zh: "NOS 官网" },
    href: "https://notes.bet",
    label: { en: "Project website", zh: "项目官网" },
    summary: {
      en: "Public-facing official website for the NOS project, suitable as the main external brand and ecosystem entry point.",
      zh: "NOS 项目的官方对外网站，适合作为品牌展示与生态入口。",
    },
    points: [
      { en: "Official brand surface", zh: "官方品牌入口" },
      { en: "Project introduction", zh: "项目介绍" },
      { en: "Public ecosystem entry", zh: "公网生态入口" },
    ],
  },
  {
    name: { en: "NOS Miner", zh: "NOS Miner" },
    href: "https://nos-miner.noschain.org",
    label: { en: "Operator portal", zh: "运营入口" },
    summary: {
      en: "Operator-oriented entry point for NOSPOW workflows, throughput awareness, and compute-facing activity.",
      zh: "面向运营者的 NOSPOW 入口，用于算力调度、吞吐观察与节点相关操作。",
    },
    points: [
      { en: "Public operator entry", zh: "公网运营入口" },
      { en: "Future hashrate integrations", zh: "后续接入实时算力" },
      { en: "Operator workflow path", zh: "运营操作路径" },
    ],
  },
  {
    name: { en: "NOS Scan", zh: "NOS Scan" },
    href: "https://nosscan.noschain.org",
    label: { en: "Explorer surface", zh: "浏览器入口" },
    summary: {
      en: "Chain browser entry for blocks, transactions, validators, and network-side public transparency.",
      zh: "区块、交易、验证节点与网络可视化的链浏览器入口。",
    },
    points: [
      { en: "Block and tx discovery", zh: "区块与交易查询" },
      { en: "Validator/explorer framing", zh: "验证节点 / 浏览器视图" },
      { en: "Public network transparency", zh: "公网网络透明度" },
    ],
  },
  {
    name: { en: "Web3S Box", zh: "Web3S Box" },
    href: "https://box.web3s.finance/",
    label: { en: "Tool portal", zh: "工具门户" },
    summary: {
      en: "Additional external portal that can act as an ecosystem-facing access layer for supporting tools and navigation.",
      zh: "额外的对外门户，可作为生态工具与入口导航的辅助层。",
    },
    points: [
      { en: "External ecosystem entry", zh: "外部生态入口" },
      { en: "Support tool aggregation", zh: "支持工具聚合" },
      { en: "Public navigation layer", zh: "公网导航层" },
    ],
  },
  {
    name: { en: "NOS Monitor DApp", zh: "NOS Monitor DApp" },
    href: "https://box.web3s.finance/dapps/nos-monitor",
    label: { en: "Monitoring dApp", zh: "监控 DApp" },
    summary: {
      en: "Dedicated dApp entry for nos-monitor, useful as a monitoring-oriented companion surface beside the main dashboard.",
      zh: "nos-monitor 的专用 DApp 入口，可作为主 dashboard 旁边的监控型配套页面。",
    },
    points: [
      { en: "Monitoring entry", zh: "监控入口" },
      { en: "DApp surface", zh: "DApp 页面" },
      { en: "Companion operations view", zh: "配套运维视图" },
    ],
  },
];
