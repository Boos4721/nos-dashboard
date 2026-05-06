"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import { geoMercator, geoPath, geoInterpolate } from "d3-geo";
import type { GeoProjection } from "d3-geo";
import * as topojson from "topojson-client";
import type { Topology, GeometryCollection } from "topojson-specification";
import countriesTopo from "@/lib/world-countries.json";
import type { Locale, DatacenterDynamicSnapshot, LiveDatacenterSnapshot } from "@/content/datacenters";
import { datacenters, useDynamicDatacenters, useLiveDatacenters } from "@/content/datacenters";
import { t } from "@/lib/i18n";
import { useTelemetryDemoState } from "@/lib/useTelemetryDemoState";
import { useInView } from "@/lib/useInView";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
type DcId = string;

interface RegionLine {
  from: DcId;
  to: DcId;
}

/* ------------------------------------------------------------------ */
/*  Map metadata                                                       */
/* ------------------------------------------------------------------ */
const regionLines: RegionLine[] = [
  { from: "kelamayi", to: "yichang" },
  { from: "shiyan", to: "hong-kong" },
  { from: "yichang", to: "singapore" },
  { from: "hong-kong", to: "bangkok" },
  { from: "singapore", to: "bangkok" },
  { from: "yichang", to: "hangzhou" },
  { from: "hangzhou", to: "hong-kong" },
  { from: "yichang", to: "chengdu" },
  { from: "chengdu", to: "kelamayi" },
];

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
  commandCenter: { en: "COMMAND CENTER", zh: "指挥中心" },
  eventFlow: { en: "EVENT FLOW", zh: "事件流" },
  focusNode: { en: "FOCUS NODE", zh: "焦点节点" },
  globalScreen: { en: "GLOBAL SCREEN", zh: "全局大屏" },
} as const;

/* ------------------------------------------------------------------ */
/*  World map data                                                     */
/* ------------------------------------------------------------------ */
const worldTopology = countriesTopo as unknown as Topology;
const countriesGeo = topojson.feature(
  worldTopology,
  worldTopology.objects.countries as GeometryCollection,
);

/* ------------------------------------------------------------------ */
/*  Great-circle arc generator                                         */
/* ------------------------------------------------------------------ */
function generateArcPath(
  from: [number, number],
  to: [number, number],
  projection: GeoProjection,
): string {
  const interpolator = geoInterpolate(from, to);
  const numPoints = 64;
  const points: [number, number][] = [];
  for (let i = 0; i <= numPoints; i++) {
    points.push(interpolator(i / numPoints));
  }
  const projected = points
    .map((p) => projection(p))
    .filter((p): p is [number, number] => p !== null);
  if (projected.length < 2) return "";
  let d = `M ${projected[0][0]} ${projected[0][1]}`;
  for (let i = 1; i < projected.length; i++) {
    d += ` L ${projected[i][0]} ${projected[i][1]}`;
  }
  return d;
}

/* ------------------------------------------------------------------ */
/*  Status color helper                                                */
/* ------------------------------------------------------------------ */
function statusColor(status: string) {
  if (status === "expanding") return "var(--amber)";
  if (status === "observing") return "var(--cyan)";
  return "var(--emerald)";
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
export function WorldMap({
  locale,
  selectedId,
  onSelect,
  onOpenServers,
  chainBlockNumber,
  simulated = false,
}: {
  locale: Locale;
  selectedId: string;
  onSelect: (id: string) => void;
  onOpenServers: () => void;
  chainBlockNumber?: number;
  simulated?: boolean;
}) {
  const dynamicDatacenters = simulated
    ? useDynamicDatacenters()
    : useLiveDatacenters(chainBlockNumber);
  const telemetryDemo = useTelemetryDemoState();
  const dynamicMap = new Map(dynamicDatacenters.map((item) => [item.id, item] as const));
  const selected = datacenters.find((dc) => dc.id === selectedId) ?? datacenters[0];
  const selectedDynamic = dynamicMap.get(selected.id);
  const { ref, inView } = useInView();

  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 960, height: 480 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width } = entry.contentRect;
        if (width > 0) {
          setDimensions({ width, height: Math.max(340, Math.round(width * 0.5)) });
        }
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const { projection, pathGenerator } = useMemo(() => {
    const { width, height } = dimensions;
    const proj = geoMercator()
      .center([75, 28])
      .scale(width * 0.85)
      .translate([width / 2, height / 2]);
    return { projection: proj, pathGenerator: geoPath(proj) };
  }, [dimensions]);

  const countryPaths = useMemo(() => {
    return countriesGeo.features.map((feature, index) => ({
      id: feature.id ?? `c${index}`,
      d: pathGenerator(feature) ?? "",
    }));
  }, [pathGenerator]);

  const projectedDatacenters = useMemo(() => {
    return datacenters.map((dc) => {
      const pos = projection(dc.coordinates);
      return { ...dc, x: pos?.[0] ?? 0, y: pos?.[1] ?? 0, visible: pos !== null };
    });
  }, [projection]);

  const arcPaths = useMemo(() => {
    return regionLines.map((line) => {
      const fromDc = datacenters.find((dc) => dc.id === line.from);
      const toDc = datacenters.find((dc) => dc.id === line.to);
      if (!fromDc || !toDc) return { ...line, d: "", visible: false };
      const d = generateArcPath(fromDc.coordinates, toDc.coordinates, projection);
      return { ...line, d, visible: d !== "" };
    });
  }, [projection]);

  const mapTitle = locale === "zh" ? "[ 全球运维地图 ]" : "[ GLOBAL_OPERATIONS_MAP ]";
  const isMobile = dimensions.width < 500;
  const routeCapacity = telemetryDemo.routeCapacity;
  const signalArc = telemetryDemo.signalArc;
  const pulseLatency = telemetryDemo.pulseLatencyMs;
  const { width, height } = dimensions;

  return (
    <section
      id="datacenters"
      ref={ref as React.RefObject<HTMLElement>}
      className={`scroll-reveal ${inView ? "in-view" : ""}`}
      suppressHydrationWarning
    >
      {/* ─── Section Header ─── */}
      <div className="mx-auto max-w-7xl px-4 pt-12 pb-4 sm:px-6 sm:pt-16 sm:pb-6 lg:px-10 lg:pt-24 lg:pb-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          <p
            className="font-mono text-[10px] font-bold uppercase tracking-[0.3em]"
            style={{ color: "var(--accent-bright)" }}
          >
            {mapTitle}
          </p>
          <div className="hidden sm:block h-px flex-1" style={{ background: "var(--border)" }} />
          <div className="flex items-center gap-3">
            <span className="font-mono text-[9px]" style={{ color: "var(--muted)" }}>
              {locale === "zh" ? "节点" : "NODES"}: {datacenters.length}
            </span>
            <span className="font-mono text-[9px]" style={{ color: "var(--muted)" }}>
              {locale === "zh" ? "区域" : "REGIONS"}: 08
            </span>
          </div>
        </div>
      </div>

      {/* ─── Full-Width Map ─── */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
        <div
          ref={containerRef}
          className="stagger-child relative overflow-hidden rounded-xl border"
          style={{ background: "var(--background-elevated)", borderColor: "var(--border)" }}
        >
          {/* Ambient gradients */}
          <div
            className="pointer-events-none absolute inset-0 opacity-80"
            style={{
              background:
                "radial-gradient(circle at 22% 18%, rgba(109,93,252,0.16), transparent 26%), radial-gradient(circle at 84% 24%, rgba(34,211,238,0.14), transparent 24%), linear-gradient(180deg, rgba(255,255,255,0.02), transparent 35%)",
            }}
          />
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-px"
            style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)" }}
          />
          <div className="scanline pointer-events-none absolute inset-0 z-10" />

          {/* Status badges — top right */}
          <div className="pointer-events-none absolute right-3 top-3 z-20 hidden items-center gap-1.5 sm:right-4 sm:top-4 sm:flex sm:flex-wrap sm:gap-2">
            <span
              className="rounded-full border px-2.5 py-1 font-mono text-[8px] tracking-[0.24em]"
              style={{ borderColor: "rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)", color: "var(--accent-bright)" }}
            >
              {t(mapStatusCopy.liveMatrix, locale)}
            </span>
            <span
              className="rounded-full border px-2.5 py-1 font-mono text-[8px] tracking-[0.24em]"
              style={{ borderColor: "rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.04)", color: "var(--muted)" }}
            >
              {t(mapStatusCopy.routeMesh, locale)}
            </span>
            <span
              className="rounded-full border px-2.5 py-1 font-mono text-[8px] tracking-[0.24em]"
              style={{ borderColor: "rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.04)", color: "var(--cyan)" }}
            >
              {t(mapStatusCopy.commandCenter, locale)}
            </span>
          </div>
          {/* Mobile-only compact status */}
          <div className="pointer-events-none absolute right-3 top-3 z-20 flex sm:hidden">
            <span
              className="rounded-full border px-2 py-0.5 font-mono text-[7px] tracking-[0.2em]"
              style={{ borderColor: "rgba(255,255,255,0.1)", background: "rgba(0,0,0,0.5)", color: "var(--accent-bright)", backdropFilter: "blur(4px)" }}
            >
              ● LIVE
            </span>
          </div>

          {/* Selected node info — bottom left overlay */}
          <div className="pointer-events-none absolute bottom-3 left-3 z-20 sm:bottom-4 sm:left-4">
            <div
              className="rounded-lg border px-3 py-2 sm:px-4 sm:py-3"
              style={{ borderColor: "rgba(255,255,255,0.08)", background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)" }}
            >
              <p className="font-mono text-[7px] tracking-[0.2em] sm:text-[8px]" style={{ color: "var(--muted)" }}>
                {t(mapStatusCopy.selectedHub, locale)}
              </p>
              <p className="mt-1 text-xs font-light sm:text-sm" style={{ color: "var(--heading)" }}>
                {t(selected.name, locale)}
              </p>
              <p className="mt-0.5 font-mono text-[9px]" style={{ color: "var(--muted)" }}>
                {t(selected.region, locale)} // {t(selected.country, locale)}
              </p>
              <div className="mt-2 flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--emerald)" }} />
                <span className="font-mono text-[9px]" style={{ color: "var(--accent-bright)" }}>
                  {selectedDynamic?.hashrate ?? selected.hashrate}
                </span>
                <span className="font-mono text-[8px]" style={{ color: "var(--muted)" }}>·</span>
                <span className="font-mono text-[9px]" style={{ color: "var(--cyan)" }}>
                  {t(selectedDynamic?.latency ?? selected.latency, locale)}
                </span>
              </div>
            </div>
          </div>

          {/* SVG World Map */}
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="relative z-10 h-full w-full"
            role="img"
            style={{ minHeight: "320px", maxHeight: "560px" }}
          >
            <defs>
              <linearGradient id="arcGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.3" />
                <stop offset="50%" stopColor="var(--cyan)" stopOpacity="0.6" />
                <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.3" />
              </linearGradient>
              <linearGradient id="routeBeam" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="rgba(255,255,255,0)" />
                <stop offset="45%" stopColor="rgba(255,255,255,0)" />
                <stop offset="50%" stopColor="rgba(255,255,255,0.95)" />
                <stop offset="55%" stopColor="rgba(255,255,255,0)" />
                <stop offset="100%" stopColor="rgba(255,255,255,0)" />
              </linearGradient>
              <filter id="nodeGlow" x="-100%" y="-100%" width="300%" height="300%">
                <feGaussianBlur stdDeviation="6" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <filter id="arcGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Graticule */}
            <g opacity="0.06" stroke="var(--muted)" strokeWidth="0.5" fill="none">
              {[-60, -30, 0, 30, 60].map((lat) => {
                const pts: string[] = [];
                for (let lng = -180; lng <= 180; lng += 5) {
                  const p = projection([lng, lat]);
                  if (p) pts.push(`${p[0]},${p[1]}`);
                }
                return pts.length > 1 ? <polyline key={`la${lat}`} points={pts.join(" ")} /> : null;
              })}
              {[-120, -60, 0, 60, 120].map((lng) => {
                const pts: string[] = [];
                for (let lat = -80; lat <= 80; lat += 5) {
                  const p = projection([lng, lat]);
                  if (p) pts.push(`${p[0]},${p[1]}`);
                }
                return pts.length > 1 ? <polyline key={`lo${lng}`} points={pts.join(" ")} /> : null;
              })}
            </g>

            {/* Countries */}
            <g>
              {countryPaths.map((c) => (
                <path key={c.id} d={c.d} fill="var(--muted-dim)" stroke="var(--border)" strokeWidth="0.5" opacity="0.6" />
              ))}
            </g>

            {/* Arcs */}
            <g>
              {arcPaths.map((arc, idx) => {
                if (!arc.visible) return null;
                const sel = arc.from === selected.id || arc.to === selected.id;
                return (
                  <g key={`${arc.from}-${arc.to}`}>
                    <path
                      d={arc.d}
                      fill="none"
                      stroke="url(#arcGradient)"
                      strokeWidth={sel ? "2" : "1"}
                      strokeOpacity={sel ? 0.85 : 0.35}
                      filter={sel ? "url(#arcGlow)" : undefined}
                      strokeLinecap="round"
                    />
                    {sel && (
                      <path d={arc.d} fill="none" stroke="url(#routeBeam)" strokeWidth="2.5" strokeLinecap="round" opacity={0.9}>
                        <animate attributeName="stroke-dasharray" values="0 300;60 240;0 300" dur={`${2.5 + idx * 0.3}s`} repeatCount="indefinite" />
                        <animate attributeName="stroke-dashoffset" values="0;-300" dur={`${2.5 + idx * 0.3}s`} repeatCount="indefinite" />
                      </path>
                    )}
                  </g>
                );
              })}
            </g>

            {/* Radar sweep */}
            {projectedDatacenters
              .filter((dc) => dc.id === selected.id && dc.visible)
              .map((dc) => (
                <g key={`radar-${dc.id}`} opacity="0.12">
                  <circle cx={dc.x} cy={dc.y} r="80" fill="none" stroke="var(--heading)" strokeWidth="0.3" strokeDasharray="3 6" />
                  <circle cx={dc.x} cy={dc.y} r="140" fill="none" stroke="var(--heading)" strokeWidth="0.2" strokeDasharray="2 8" />
                  <line
                    x1={dc.x} y1={dc.y} x2={dc.x} y2={dc.y - 140}
                    stroke="var(--heading)" strokeWidth="0.4"
                    className="origin-center animate-[spin_12s_linear_infinite]"
                    style={{ transformOrigin: `${dc.x}px ${dc.y}px` }}
                  />
                </g>
              ))}

            {/* Datacenter markers */}
            {projectedDatacenters.filter((dc) => dc.visible).map((dc) => {
              const active = dc.id === selected.id;
              const dyn = dynamicMap.get(dc.id);
              const nodeStrength = dyn?.nodeCount ?? dc.nodeCount;
              const sc = statusColor(dc.status);
              const mSize = active ? 5 : dc.status === "expanding" ? 4 : 3;
              const pRadius = active ? 36 : 18 + (nodeStrength % 8);

              return (
                <g
                  key={dc.id}
                  className="cursor-pointer"
                  onClick={() => onSelect(dc.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSelect(dc.id); } }}
                >
                  <circle cx={dc.x} cy={dc.y} r={pRadius} fill="var(--accent)" opacity={active ? 0.08 : 0.025} />
                  <circle
                    cx={dc.x} cy={dc.y} r={active ? 28 : 14 + (nodeStrength % 5)}
                    fill="none" stroke="var(--accent)" strokeOpacity={active ? 0.2 : 0.08}
                    strokeWidth="0.7" strokeDasharray="2 4" className="animate-pulse"
                  />
                  {active && (
                    <circle cx={dc.x} cy={dc.y} r="42" fill="none" stroke="rgba(34,211,238,0.16)" strokeWidth="0.6" strokeDasharray="3 7">
                      <animate attributeName="r" values="34;42;34" dur="3.2s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.2;0.65;0.2" dur="3.2s" repeatCount="indefinite" />
                    </circle>
                  )}
                  <circle cx={dc.x} cy={dc.y} r={mSize} fill={active ? "var(--heading)" : sc} filter={active ? "url(#nodeGlow)" : undefined} />
                  <circle cx={dc.x} cy={dc.y} r={mSize + 2} fill="none" stroke={sc} strokeWidth="0.6" strokeOpacity={active ? 0.6 : 0.3} />
                  <circle cx={dc.x} cy={dc.y} r="16" fill="transparent" />
                  {active && (
                    <text x={dc.x + 12} y={dc.y + 4} fill="var(--heading)" className="font-mono text-[9px] font-bold tracking-tighter" style={{ textShadow: "0 1px 4px rgba(0,0,0,0.8)" }}>
                      {t(dc.name, locale)}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* ─── Datacenter Cards Grid ─── */}
      <div className="mx-auto max-w-7xl px-3 pt-4 sm:px-4 sm:pt-6 lg:px-10 lg:pt-10">
        <div className="stagger-child grid grid-cols-2 gap-px sm:grid-cols-4" style={{ background: "var(--border)" }}>
          {datacenters.map((dc) => {
            const isActive = dc.id === selected.id;
            const dyn = dynamicMap.get(dc.id);
            const sc = statusColor(dc.status);
            return (
              <button
                key={dc.id}
                onClick={() => onSelect(dc.id)}
                className="p-3 sm:p-4 lg:p-5 text-left transition-colors group"
                style={{ background: isActive ? "var(--accent-glow)" : "var(--background-elevated)" }}
                onMouseEnter={(e) => { if (!isActive) (e.currentTarget as HTMLElement).style.background = "var(--background-surface-hover)"; }}
                onMouseLeave={(e) => { if (!isActive) (e.currentTarget as HTMLElement).style.background = "var(--background-elevated)"; }}
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full" style={{ background: sc }} />
                    <p
                      className="font-mono text-[10px] font-bold tracking-wider"
                      style={{ color: isActive ? "var(--heading)" : "var(--muted)" }}
                    >
                      {dc.id.toUpperCase()}
                    </p>
                  </div>
                  {isActive && (
                    <span className="font-mono text-[7px] tracking-[0.2em] px-2 py-0.5 rounded-full border" style={{ borderColor: "rgba(255,255,255,0.1)", color: "var(--accent-bright)" }}>
                      {locale === "zh" ? "选中" : "SEL"}
                    </span>
                  )}
                </div>

                {/* Location */}
                <p className="font-mono text-[9px] mb-3" style={{ color: "var(--muted)" }}>
                  {t(dc.name, locale)}
                </p>

                {/* Metrics grid */}
                <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 sm:gap-x-3 sm:gap-y-2">
                  <div>
                    <p className="font-mono text-[7px]" style={{ color: "var(--muted)" }}>
                      {t(mapMetricLabels.hashrate, locale)}
                    </p>
                    <p className="font-mono text-[11px] font-medium" style={{ color: "var(--heading)" }}>
                      {dyn?.hashrate ?? dc.hashrate}
                    </p>
                  </div>
                  <div>
                    <p className="font-mono text-[7px]" style={{ color: "var(--muted)" }}>
                      {t(mapMetricLabels.nodes, locale)}
                    </p>
                    <p className="font-mono text-[11px] font-medium" style={{ color: "var(--heading)" }}>
                      {dyn?.nodeCount ?? dc.nodeCount}
                    </p>
                  </div>
                  <div>
                    <p className="font-mono text-[7px]" style={{ color: "var(--muted)" }}>
                      {t(mapMetricLabels.latency, locale)}
                    </p>
                    <p className="font-mono text-[11px] font-medium" style={{ color: "var(--cyan)" }}>
                      {(dyn?.latency ? t(dyn.latency, locale) : t(dc.latency, locale)).split(" ")[0]} ms
                    </p>
                  </div>
                  <div>
                    <p className="font-mono text-[7px]" style={{ color: "var(--muted)" }}>
                      {t(mapMetricLabels.power, locale)}
                    </p>
                    <p className="font-mono text-[11px] font-medium" style={{ color: "var(--body)" }}>
                      {t(dc.powerMix, locale)}
                    </p>
                  </div>
                </div>

                {/* Tags */}
                <div className="mt-2 hidden flex-wrap gap-1 sm:flex">
                  {dc.tags.slice(0, 2).map((tag) => (
                    <span
                      key={t(tag, locale)}
                      className="font-mono text-[7px] px-1.5 py-0.5 rounded border"
                      style={{ borderColor: "rgba(255,255,255,0.06)", color: "var(--muted)" }}
                    >
                      {t(tag, locale)}
                    </span>
                  ))}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── Telemetry Row ─── */}
      <div className="mx-auto max-w-7xl px-3 pt-4 pb-10 sm:px-4 sm:pt-6 sm:pb-12 lg:px-10 lg:pt-10 lg:pb-24">
        <div className="stagger-child grid grid-cols-2 gap-px sm:grid-cols-4" style={{ background: "var(--border)" }}>
          {[
            { label: t(mapStatusCopy.routeCapacity, locale), value: `${routeCapacity}%`, color: "var(--heading)" },
            { label: t(mapStatusCopy.telemetry, locale), value: t(mapStatusCopy.online, locale), color: "var(--accent-bright)" },
            { label: t(mapStatusCopy.pathPulse, locale), value: `${pulseLatency} ms`, color: "var(--cyan)" },
            { label: t(mapStatusCopy.signalArc, locale), value: `${signalArc}%`, color: "var(--heading)" },
          ].map((item) => (
            <div
              key={item.label}
              className="p-3 sm:p-4 lg:p-5 relative overflow-hidden"
              style={{ background: "var(--background-elevated)" }}
            >
              <p className="font-mono text-[8px] tracking-[0.2em]" style={{ color: "var(--muted)" }}>
                {item.label}
              </p>
              <p className="mt-2 font-mono text-[18px] sm:text-[20px]" style={{ color: item.color }}>
                {item.value}
              </p>
            </div>
          ))}
        </div>

        {/* View Servers CTA */}
        <div className="mt-5 flex justify-center sm:mt-6">
          <button
            onClick={onOpenServers}
            className="flex w-full items-center justify-center gap-2 rounded-md border px-6 py-2.5 font-mono text-[10px] font-bold uppercase tracking-widest transition-all sm:w-auto sm:px-8"
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
              (e.currentTarget as HTMLElement).style.background =
                "linear-gradient(135deg, rgba(109,93,252,0.12), rgba(34,211,238,0.08))";
              (e.currentTarget as HTMLElement).style.color = "var(--accent-bright)";
            }}
          >
            {locale === "zh" ? "查看服务器详情" : "View Server Details"}
            <svg className="h-3 w-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M2 6h8M7 3l3 3-3 3" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}
