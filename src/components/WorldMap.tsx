"use client";

import type { Locale, DatacenterDynamicSnapshot } from "@/content/datacenters";
import { datacenters, useDynamicDatacenters } from "@/content/datacenters";
import { t } from "@/lib/i18n";
import { useTelemetryDemoState } from "@/lib/useTelemetryDemoState";
import { useInView } from "@/lib/useInView";

const regionLines = [
  { from: "kelamayi", to: "yichang", d: "M 208 150 C 312 148, 424 146, 540 156" },
  { from: "shiyan", to: "hong-kong", d: "M 528 160 C 544 184, 576 214, 610 234" },
  { from: "yichang", to: "singapore", d: "M 540 156 C 582 198, 626 248, 676 302" },
  { from: "hong-kong", to: "bangkok", d: "M 610 234 C 602 264, 592 282, 584 302" },
  { from: "singapore", to: "bangkok", d: "M 676 302 C 652 315, 620 318, 584 302" },
  { from: "yichang", to: "hangzhou", d: "M 540 156 C 568 158, 600 162, 622 170" },
  { from: "hangzhou", to: "hong-kong", d: "M 622 170 C 618 192, 614 216, 610 234" },
] as const;

const mapMetricLabels = {
  hashrate: { en: "HASHRATE", zh: "算力" },
  nodes: { en: "NODES", zh: "节点数" },
  latency: { en: "LATENCY", zh: "延迟" },
  power: { en: "POWER", zh: "供电" },
} as const;

const mapStatusCopy = {
  liveMatrix: { en: "LIVE NETWORK MATRIX", zh: "实时网络矩阵" },
  routeMesh: { en: "ROUTE MESH", zh: "链路拓扑" },
  selectedHub: { en: "SELECTED HUB", zh: "当前节点" },
  routeCapacity: { en: "ROUTE CAPACITY", zh: "链路容量" },
  telemetry: { en: "TELEMETRY", zh: "遥测" },
  online: { en: "ONLINE", zh: "在线" },
  routeStable: { en: "ROUTE_STABLE", zh: "链路稳定" },
  telemetryLive: { en: "TELEMETRY LIVE", zh: "遥测在线" },
  connectedTo: { en: "CONNECTED_TO", zh: "已接入节点" },
  pathPulse: { en: "PATH_PULSE", zh: "路径脉冲" },
  signalArc: { en: "SIGNAL ARC", zh: "信号弧带" },
} as const;

function project([longitude, latitude]: [number, number]) {
  const x = ((longitude + 180) / 360) * 980;
  const y = ((90 - latitude) / 180) * 470;
  return [x, y] as const;
}

export function WorldMap({
  locale,
  selectedId,
  onSelect,
  onOpenServers,
}: {
  locale: Locale;
  selectedId: string;
  onSelect: (id: string) => void;
  onOpenServers: () => void;
}) {
  const dynamicDatacenters = useDynamicDatacenters();
  const telemetryDemo = useTelemetryDemoState();
  const dynamicMap = new Map(dynamicDatacenters.map((item) => [item.id, item] as const));
  const selected = datacenters.find((dc) => dc.id === selectedId) ?? datacenters[0];
  const selectedDynamic = dynamicMap.get(selected.id);
  const { ref, inView } = useInView();
  const mapTitle = locale === "zh" ? "[ 全球运维地图 ]" : "[ GLOBAL_OPERATIONS_MAP ]";
  const nodesLabel = locale === "zh" ? "节点数" : "NODES";
  const activeRegionsLabel = locale === "zh" ? "活跃区域" : "ACTIVE_REGIONS";
  const manifestLabel = locale === "zh" ? "节点清单" : "MANIFEST_DATA";
  const nodeLogsLabel = locale === "zh" ? "节点日志" : "NODE_LOGS";
  const statusLabel = locale === "zh" ? "状态" : "STATUS";
  const operationalLabel = locale === "zh" ? "运行中" : "OPERATIONAL";
  const pingLabel = locale === "zh" ? "延迟" : "PING";
  const streamingLabel = locale === "zh" ? "遥测流已接入..." : "STREAMING_TELEMETRY...";
  const routeCapacity = telemetryDemo.routeCapacity;
  const signalArc = telemetryDemo.signalArc;
  const pulseLatency = telemetryDemo.pulseLatencyMs;

  return (
    <section
      id="datacenters"
      ref={ref as React.RefObject<HTMLElement>}
      className={`mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-10 lg:py-24 scroll-reveal ${inView ? "in-view" : ""}`}
    >
      <div className="flex flex-col gap-8 sm:gap-12">
        {/* Label row */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.3em]" style={{ color: "var(--accent-bright)" }}>
            {mapTitle}
          </p>
          <div className="hidden sm:block h-px flex-1" style={{ background: "var(--border)" }} />
          <div className="flex items-center gap-3">
            <span className="font-mono text-[9px]" style={{ color: "var(--muted)" }}>
              {nodesLabel}: {datacenters.length}
            </span>
            <span className="font-mono text-[9px]" style={{ color: "var(--muted)" }}>
              {activeRegionsLabel}: 07
            </span>
          </div>
        </div>

        {/* Map panel — stacks on mobile */}
        <div className="stagger-child grid gap-px lg:grid-cols-[1.2fr_0.8fr]" style={{ background: "var(--border)" }}>
          {/* Map */}
          <div className="relative p-3 sm:p-4 lg:p-8 overflow-hidden" style={{ background: "var(--background-elevated)" }}>
            <div className="pointer-events-none absolute inset-0 opacity-80" style={{ background: "radial-gradient(circle at 22% 18%, rgba(109,93,252,0.16), transparent 26%), radial-gradient(circle at 84% 24%, rgba(34,211,238,0.14), transparent 24%), linear-gradient(180deg, rgba(255,255,255,0.02), transparent 35%)" }} />
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)" }} />
            <div className="scanline pointer-events-none absolute inset-0 z-10" />
            <div className="pointer-events-none absolute right-4 top-4 z-20 flex flex-wrap items-center gap-2">
              <span className="rounded-full border px-2.5 py-1 font-mono text-[8px] tracking-[0.24em]" style={{ borderColor: "rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)", color: "var(--accent-bright)" }}>{t(mapStatusCopy.liveMatrix, locale)}</span>
              <span className="rounded-full border px-2.5 py-1 font-mono text-[8px] tracking-[0.24em]" style={{ borderColor: "rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.04)", color: "var(--muted)" }}>{t(mapStatusCopy.routeMesh, locale)}</span>
            </div>
            <svg viewBox="0 0 980 470" className="relative z-10 h-full w-full" role="img">
              <defs>
                <linearGradient id="routeGlow" x1="0" x2="1">
                  <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.1" />
                  <stop offset="50%" stopColor="var(--accent)" stopOpacity="0.5" />
                  <stop offset="100%" stopColor="var(--cyan)" stopOpacity="0.4" />
                </linearGradient>
                <linearGradient id="routeBeam" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="rgba(255,255,255,0)" />
                  <stop offset="45%" stopColor="rgba(255,255,255,0)" />
                  <stop offset="50%" stopColor="rgba(255,255,255,0.95)" />
                  <stop offset="55%" stopColor="rgba(255,255,255,0)" />
                  <stop offset="100%" stopColor="rgba(255,255,255,0)" />
                </linearGradient>
                <filter id="mapGlow" x="-30%" y="-30%" width="160%" height="160%">
                  <feGaussianBlur stdDeviation="8" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Grid dots */}
              <pattern id="dotGrid" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                <circle cx="1" cy="1" r="0.5" fill="var(--muted-dim)" />
              </pattern>
              <rect width="980" height="470" fill="url(#dotGrid)" />

              {/* Route lines */}
              <g opacity="0.6">
                {regionLines.map((line, index) => {
                  const isSelectedPath = line.from === selected.id || line.to === selected.id;
                  const routeEnergy = isSelectedPath ? Math.max(0.82, telemetryDemo.selectedNodeBoost / 100) : 0.42 + (((telemetryDemo.blockNumber + index * 9) % 18) / 100);
                  return (
                    <g key={`${line.from}-${line.to}`}>
                      <path
                        d={line.d}
                        fill="none"
                        stroke="url(#routeGlow)"
                        strokeWidth={isSelectedPath ? "1.8" : "1"}
                        strokeOpacity={routeEnergy}
                        className="route-animated"
                        filter={isSelectedPath ? "url(#mapGlow)" : undefined}
                      />
                      <path
                        d={line.d}
                        fill="none"
                        stroke="rgba(255,255,255,0.16)"
                        strokeWidth={isSelectedPath ? "1.2" : "0.7"}
                        strokeOpacity={isSelectedPath ? routeEnergy * 0.55 : routeEnergy * 0.28}
                      />
                      {isSelectedPath && (
                        <path d={line.d} fill="none" stroke="url(#routeBeam)" strokeWidth="2.4" strokeLinecap="round" opacity={Math.min(0.98, routeEnergy + 0.08)}>
                          <animate attributeName="stroke-dasharray" values="0 220;50 170;0 220" dur={`${2.4 + index * 0.35}s`} repeatCount="indefinite" />
                          <animate attributeName="stroke-dashoffset" values="0;-220" dur={`${2.4 + index * 0.35}s`} repeatCount="indefinite" />
                        </path>
                      )}
                    </g>
                  );
                })}
              </g>

              {/* Radar sweep */}
              <g className="origin-center animate-[spin_12s_linear_infinite]" opacity="0.1">
                <line x1="490" y1="235" x2="490" y2="0" stroke="var(--heading)" strokeWidth="0.5" />
                <circle cx="490" cy="235" r="235" fill="none" stroke="var(--heading)" strokeWidth="0.25" strokeDasharray="2 4" />
              </g>

              {/* Node markers */}
              {datacenters.map((dc) => {
                const [x, y] = project(dc.coordinates);
                const active = dc.id === selected.id;
                const dynamicDc = dynamicMap.get(dc.id);
                const nodeStrength = dynamicDc?.nodeCount ?? dc.nodeCount;
                const glowBoost = active ? telemetryDemo.selectedNodeBoost : Math.max(18, Math.min(72, nodeStrength + 8));
                const pulseRadius = active ? 28 + glowBoost * 0.18 : 14 + (nodeStrength % 7);
                const nodeFill = active ? "var(--heading)" : glowBoost > 55 ? "var(--accent-bright)" : "var(--muted)";
                return (
                  <g
                    key={dc.id}
                    className="cursor-pointer"
                    onClick={() => onSelect(dc.id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onSelect(dc.id);
                      }
                    }}
                  >
                    <circle cx={x} cy={y} r={pulseRadius} fill="var(--accent)" opacity={active ? 0.1 : 0.04 + glowBoost / 1600} />
                    <circle cx={x} cy={y} r={active ? 32 : 18 + (nodeStrength % 5)} fill="none" stroke="var(--accent)" strokeOpacity={active ? 0.18 : 0.08} strokeWidth="0.8" strokeDasharray="2 4" className="animate-pulse" />
                    {active && (
                      <>
                        <circle cx={x} cy={y} r="46" fill="none" stroke="rgba(34,211,238,0.16)" strokeWidth="0.6" strokeDasharray="3 7">
                          <animate attributeName="r" values="38;46;38" dur="3.2s" repeatCount="indefinite" />
                          <animate attributeName="opacity" values="0.2;0.65;0.2" dur="3.2s" repeatCount="indefinite" />
                        </circle>
                      </>
                    )}
                    <circle cx={x} cy={y} r={active ? 4 : glowBoost > 55 ? 3 : 2} fill={nodeFill} />
                    <circle cx={x} cy={y} r="12" fill="transparent" />
                    {active && (
                      <text x={x + 10} y={y + 4} fill="var(--heading)" className="font-mono text-[8px] font-bold tracking-tighter">
                        {t(dc.name, locale)}
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Sidebar — stacks on mobile */}
          <div className="flex flex-col gap-px">
            <div className="p-5 sm:p-8 relative overflow-hidden" style={{ background: "var(--background-elevated)" }}>
              <div className="pointer-events-none absolute inset-0 opacity-70" style={{ background: "radial-gradient(circle at 78% 18%, rgba(109,93,252,0.12), transparent 22%), linear-gradient(180deg, rgba(255,255,255,0.015), transparent 42%)" }} />
              <div className="relative z-10 flex items-center justify-between gap-4">
                <div>
                  <p className="font-mono text-[9px] font-bold mb-4 sm:mb-6" style={{ color: "var(--muted)" }}>{manifestLabel}</p>
                  <h3 className="text-lg sm:text-xl font-light tracking-tight" style={{ color: "var(--heading)" }}>{t(selected.name, locale)}</h3>
                  <p className="mt-2 font-mono text-[10px]" style={{ color: "var(--muted)" }}>{t(selected.region, locale)} // {t(selected.country, locale)}</p>
                </div>
                <div className="rounded-2xl border px-4 py-3 text-right" style={{ borderColor: "rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)" }}>
                  <p className="font-mono text-[8px] tracking-[0.24em]" style={{ color: "var(--muted)" }}>{t(mapStatusCopy.selectedHub, locale)}</p>
                  <p className="mt-2 font-mono text-[14px]" style={{ color: "var(--accent-bright)" }}>{t(mapStatusCopy.online, locale)}</p>
                </div>
              </div>

              <div className="mt-6 sm:mt-8 grid grid-cols-2 gap-3 sm:gap-4">
                {[
                  { l: t(mapMetricLabels.hashrate, locale), v: selectedDynamic?.hashrate ?? selected.hashrate },
                  { l: t(mapMetricLabels.nodes, locale), v: String(selectedDynamic?.nodeCount ?? selected.nodeCount) },
                  { l: t(mapMetricLabels.latency, locale), v: selectedDynamic?.latency ?? selected.latency },
                  { l: t(mapMetricLabels.power, locale), v: selected.powerMix },
                ].map(item => (
                  <div key={item.l} className="border-b pb-2" style={{ borderColor: "var(--border)" }}>
                    <p className="font-mono text-[7px] sm:text-[8px]" style={{ color: "var(--muted)" }}>{item.l}</p>
                    <p className="mt-1 font-mono text-[10px] sm:text-[11px]" style={{ color: "var(--heading)" }}>{typeof item.v === "string" ? item.v : t(item.v, locale)}</p>
                  </div>
                ))}
              </div>

              {/* View servers CTA */}
              <button
                onClick={onOpenServers}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-md border py-2.5 font-mono text-[10px] font-bold uppercase tracking-widest transition-all"
                style={{
                  borderColor: "var(--border-accent)",
                  color: "var(--accent-bright)",
                  background: "linear-gradient(135deg, rgba(109,93,252,0.12), rgba(34,211,238,0.08))",
                  boxShadow: "0 18px 40px rgba(109,93,252,0.12)",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "var(--accent)";
                  (e.currentTarget as HTMLElement).style.color = "#fff";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "var(--glass)";
                  (e.currentTarget as HTMLElement).style.color = "var(--accent-bright)";
                }}
              >
                {locale === "zh" ? "查看服务器" : "View Servers"}
                <svg className="h-3 w-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M2 6h8M7 3l3 3-3 3" />
                </svg>
              </button>
            </div>

            <div className="p-5 sm:p-8 flex-1 relative overflow-hidden" style={{ background: "var(--background-elevated)" }}>
              <div className="pointer-events-none absolute inset-0 opacity-60" style={{ background: "radial-gradient(circle at 18% 82%, rgba(34,211,238,0.1), transparent 24%), linear-gradient(180deg, rgba(255,255,255,0.012), transparent 40%)" }} />
              <div className="relative z-10 flex items-center justify-between gap-4">
                <p className="font-mono text-[9px] font-bold mb-3 sm:mb-4" style={{ color: "var(--muted)" }}>{nodeLogsLabel}</p>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full border px-2.5 py-1 font-mono text-[8px] tracking-[0.22em]" style={{ borderColor: "rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.04)", color: "var(--accent-bright)" }}>{t(mapStatusCopy.routeStable, locale)}</span>
                  <span className="rounded-full border px-2.5 py-1 font-mono text-[8px] tracking-[0.22em]" style={{ borderColor: "rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.04)", color: "var(--emerald)" }}>{t(mapStatusCopy.telemetryLive, locale)}</span>
                </div>
              </div>
              <div className="relative z-10 mt-2 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border p-4" style={{ borderColor: "rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.025)" }}>
                  <p className="font-mono text-[8px] tracking-[0.2em]" style={{ color: "var(--muted)" }}>{t(mapStatusCopy.routeCapacity, locale)}</p>
                  <p className="mt-2 font-mono text-[18px]" style={{ color: "var(--heading)" }}>{routeCapacity}%</p>
                </div>
                <div className="rounded-2xl border p-4" style={{ borderColor: "rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.025)" }}>
                  <p className="font-mono text-[8px] tracking-[0.2em]" style={{ color: "var(--muted)" }}>{t(mapStatusCopy.telemetry, locale)}</p>
                  <p className="mt-2 font-mono text-[18px]" style={{ color: "var(--accent-bright)" }}>{t(mapStatusCopy.online, locale)}</p>
                </div>
                <div className="rounded-2xl border p-4" style={{ borderColor: "rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.025)" }}>
                  <p className="font-mono text-[8px] tracking-[0.2em]" style={{ color: "var(--muted)" }}>{t(mapStatusCopy.pathPulse, locale)}</p>
                  <p className="mt-2 font-mono text-[18px]" style={{ color: "var(--cyan)" }}>{pulseLatency} ms</p>
                </div>
                <div className="rounded-2xl border p-4" style={{ borderColor: "rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.025)" }}>
                  <p className="font-mono text-[8px] tracking-[0.2em]" style={{ color: "var(--muted)" }}>{t(mapStatusCopy.signalArc, locale)}</p>
                  <p className="mt-2 font-mono text-[18px]" style={{ color: "var(--heading)" }}>{signalArc}%</p>
                </div>
              </div>
              <div className="relative z-10 mt-4 space-y-1 font-mono text-[8px] sm:text-[9px]" style={{ color: "var(--muted)" }}>
                <div style={{ color: "var(--accent-bright)" }}>&gt; {t(mapStatusCopy.connectedTo, locale)} {t(selected.name, locale)}</div>
                <div>&gt; {statusLabel}: {operationalLabel}</div>
                <div>&gt; {pingLabel}: {t(selectedDynamic?.latency ?? selected.latency, locale)}</div>
                <div className="animate-pulse">&gt; {streamingLabel}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Node Selector Grid — responsive for 7 nodes */}
        <div className="stagger-child grid grid-cols-4 gap-px sm:grid-cols-4 lg:grid-cols-7" style={{ background: "var(--border)" }}>
          {datacenters.map((dc) => (
            <button
              key={dc.id}
              onClick={() => onSelect(dc.id)}
              className="p-3 sm:p-5 lg:p-6 text-left transition-colors"
              style={{
                background: dc.id === selected.id ? "var(--accent-glow)" : "var(--background-elevated)",
              }}
              onMouseEnter={(e) => {
                if (dc.id !== selected.id) (e.currentTarget as HTMLElement).style.background = "var(--background-surface-hover)";
              }}
              onMouseLeave={(e) => {
                if (dc.id !== selected.id) (e.currentTarget as HTMLElement).style.background = "var(--background-elevated)";
              }}
            >
              <p className="font-mono text-[9px] sm:text-[10px] font-bold" style={{ color: dc.id === selected.id ? "var(--heading)" : "var(--muted)" }}>
                {dc.id.toUpperCase()}
              </p>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
