"use client";

import { useMemo, useCallback, useRef, useState, useEffect } from "react";
import { geoMercator, geoPath, geoInterpolate } from "d3-geo";
import type { GeoProjection, GeoPath } from "d3-geo";
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
  globalScreen: { en: "GLOBAL SCREEN", zh: "全局大屏" },
  focusNode: { en: "FOCUS NODE", zh: "焦点节点" },
} as const;

/* ------------------------------------------------------------------ */
/*  World map data — convert TopoJSON to GeoJSON features              */
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
    const t = i / numPoints;
    // Add altitude curve: bulge at midpoint
    const point = interpolator(t);
    points.push(point);
  }

  const projected = points
    .map((p) => projection(p))
    .filter((p): p is [number, number] => p !== null);

  if (projected.length < 2) return "";

  // Create a smooth SVG path
  let d = `M ${projected[0][0]} ${projected[0][1]}`;
  for (let i = 1; i < projected.length; i++) {
    d += ` L ${projected[i][0]} ${projected[i][1]}`;
  }
  return d;
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
          setDimensions({ width, height: Math.max(320, Math.round(width * 0.52)) });
        }
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const { projection, pathGenerator } = useMemo(() => {
    const { width, height } = dimensions;
    const proj = geoMercator()
      .center([75, 28]) // Center roughly on China/Asia where most nodes are
      .scale(width * 0.85)
      .translate([width / 2, height / 2]);
    const pathGen = geoPath(proj);
    return { projection: proj, pathGenerator: pathGen };
  }, [dimensions]);

  const countryPaths = useMemo(() => {
    return countriesGeo.features.map((feature, index) => ({
      id: feature.id ?? `country-${index}`,
      d: pathGenerator(feature) ?? "",
    }));
  }, [pathGenerator]);

  // Project datacenter coordinates
  const projectedDatacenters = useMemo(() => {
    return datacenters.map((dc) => {
      const pos = projection(dc.coordinates);
      return {
        ...dc,
        x: pos?.[0] ?? 0,
        y: pos?.[1] ?? 0,
        visible: pos !== null,
      };
    });
  }, [projection]);

  // Generate arc paths
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

  const { width, height } = dimensions;

  return (
    <section
      id="datacenters"
      ref={ref as React.RefObject<HTMLElement>}
      className={`mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-10 lg:py-24 scroll-reveal ${inView ? "in-view" : ""}`}
      suppressHydrationWarning
    >
      <div className="flex flex-col gap-8 sm:gap-12">
        {/* Label row */}
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
              {nodesLabel}: {datacenters.length}
            </span>
            <span className="font-mono text-[9px]" style={{ color: "var(--muted)" }}>
              {activeRegionsLabel}: 08
            </span>
          </div>
        </div>

        {/* Map panel — stacks on mobile */}
        <div
          className="stagger-child grid gap-px lg:grid-cols-[1.2fr_0.8fr]"
          style={{ background: "var(--border)" }}
        >
          {/* Map */}
          <div
            ref={containerRef}
            className="relative p-3 sm:p-4 lg:p-6 overflow-hidden"
            style={{ background: "var(--background-elevated)" }}
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

            {/* Status badges */}
            <div className="pointer-events-none absolute right-4 top-4 z-20 flex flex-wrap items-center gap-2">
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

            {/* SVG World Map */}
            <svg
              viewBox={`0 0 ${width} ${height}`}
              className="relative z-10 h-full w-full"
              role="img"
              style={{ minHeight: "280px" }}
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
                {/* Pulse animation for selected node */}
                <radialGradient id="selectedPulse">
                  <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
                </radialGradient>
              </defs>

              {/* Ocean / background */}
              <rect width={width} height={height} fill="transparent" />

              {/* Graticule lines — subtle latitude/longitude grid */}
              <g opacity="0.06" stroke="var(--muted)" strokeWidth="0.5" fill="none">
                {[-60, -30, 0, 30, 60].map((lat) => {
                  const points: string[] = [];
                  for (let lng = -180; lng <= 180; lng += 5) {
                    const p = projection([lng, lat]);
                    if (p) points.push(`${p[0]},${p[1]}`);
                  }
                  return points.length > 1 ? (
                    <polyline key={`lat-${lat}`} points={points.join(" ")} />
                  ) : null;
                })}
                {[-120, -60, 0, 60, 120].map((lng) => {
                  const points: string[] = [];
                  for (let lat = -80; lat <= 80; lat += 5) {
                    const p = projection([lng, lat]);
                    if (p) points.push(`${p[0]},${p[1]}`);
                  }
                  return points.length > 1 ? (
                    <polyline key={`lng-${lng}`} points={points.join(" ")} />
                  ) : null;
                })}
              </g>

              {/* Country outlines */}
              <g>
                {countryPaths.map((country) => (
                  <path
                    key={country.id}
                    d={country.d}
                    fill="var(--muted-dim)"
                    stroke="var(--border)"
                    strokeWidth="0.5"
                    opacity="0.6"
                  />
                ))}
              </g>

              {/* Connection arcs */}
              <g>
                {arcPaths.map((arc, index) => {
                  if (!arc.visible) return null;
                  const isSelectedPath = arc.from === selected.id || arc.to === selected.id;
                  const arcOpacity = isSelectedPath ? 0.85 : 0.35;
                  return (
                    <g key={`${arc.from}-${arc.to}`}>
                      {/* Base arc */}
                      <path
                        d={arc.d}
                        fill="none"
                        stroke="url(#arcGradient)"
                        strokeWidth={isSelectedPath ? "2" : "1"}
                        strokeOpacity={arcOpacity}
                        filter={isSelectedPath ? "url(#arcGlow)" : undefined}
                        strokeLinecap="round"
                      />
                      {/* Animated beam on selected path */}
                      {isSelectedPath && (
                        <path
                          d={arc.d}
                          fill="none"
                          stroke="url(#routeBeam)"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          opacity={0.9}
                        >
                          <animate
                            attributeName="stroke-dasharray"
                            values="0 300;60 240;0 300"
                            dur={`${2.5 + index * 0.3}s`}
                            repeatCount="indefinite"
                          />
                          <animate
                            attributeName="stroke-dashoffset"
                            values="0;-300"
                            dur={`${2.5 + index * 0.3}s`}
                            repeatCount="indefinite"
                          />
                        </path>
                      )}
                    </g>
                  );
                })}
              </g>

              {/* Radar sweep — centered on selected node */}
              {projectedDatacenters
                .filter((dc) => dc.id === selected.id && dc.visible)
                .map((dc) => (
                  <g key={`radar-${dc.id}`} opacity="0.12">
                    <circle
                      cx={dc.x}
                      cy={dc.y}
                      r="80"
                      fill="none"
                      stroke="var(--heading)"
                      strokeWidth="0.3"
                      strokeDasharray="3 6"
                    />
                    <circle
                      cx={dc.x}
                      cy={dc.y}
                      r="140"
                      fill="none"
                      stroke="var(--heading)"
                      strokeWidth="0.2"
                      strokeDasharray="2 8"
                    />
                    <line
                      x1={dc.x}
                      y1={dc.y}
                      x2={dc.x}
                      y2={dc.y - 140}
                      stroke="var(--heading)"
                      strokeWidth="0.4"
                      className="origin-center animate-[spin_12s_linear_infinite]"
                      style={{ transformOrigin: `${dc.x}px ${dc.y}px` }}
                    />
                  </g>
                ))}

              {/* Datacenter markers */}
              {projectedDatacenters
                .filter((dc) => dc.visible)
                .map((dc) => {
                  const active = dc.id === selected.id;
                  const dynamicDc = dynamicMap.get(dc.id);
                  const nodeStrength = dynamicDc?.nodeCount ?? dc.nodeCount;
                  const isExpanding = dc.status === "expanding";
                  const isObserving = dc.status === "observing";

                  const markerSize = active ? 5 : isExpanding ? 4 : 3;
                  const pulseRadius = active ? 36 : 18 + (nodeStrength % 8);
                  const statusColor = isExpanding
                    ? "var(--amber)"
                    : isObserving
                      ? "var(--cyan)"
                      : "var(--emerald)";

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
                      {/* Outer pulse ring */}
                      <circle
                        cx={dc.x}
                        cy={dc.y}
                        r={pulseRadius}
                        fill="var(--accent)"
                        opacity={active ? 0.08 : 0.025}
                      />
                      {/* Dashed ring */}
                      <circle
                        cx={dc.x}
                        cy={dc.y}
                        r={active ? 28 : 14 + (nodeStrength % 5)}
                        fill="none"
                        stroke="var(--accent)"
                        strokeOpacity={active ? 0.2 : 0.08}
                        strokeWidth="0.7"
                        strokeDasharray="2 4"
                        className="animate-pulse"
                      />
                      {/* Selected: expanding outer ring animation */}
                      {active && (
                        <circle
                          cx={dc.x}
                          cy={dc.y}
                          r="42"
                          fill="none"
                          stroke="rgba(34,211,238,0.16)"
                          strokeWidth="0.6"
                          strokeDasharray="3 7"
                        >
                          <animate attributeName="r" values="34;42;34" dur="3.2s" repeatCount="indefinite" />
                          <animate attributeName="opacity" values="0.2;0.65;0.2" dur="3.2s" repeatCount="indefinite" />
                        </circle>
                      )}
                      {/* Core dot */}
                      <circle
                        cx={dc.x}
                        cy={dc.y}
                        r={markerSize}
                        fill={active ? "var(--heading)" : statusColor}
                        filter={active ? "url(#nodeGlow)" : undefined}
                      />
                      {/* Status ring (colored by status) */}
                      <circle
                        cx={dc.x}
                        cy={dc.y}
                        r={markerSize + 2}
                        fill="none"
                        stroke={statusColor}
                        strokeWidth="0.6"
                        strokeOpacity={active ? 0.6 : 0.3}
                      />
                      {/* Hit area */}
                      <circle cx={dc.x} cy={dc.y} r="16" fill="transparent" />
                      {/* Label for selected node */}
                      {active && (
                        <text
                          x={dc.x + 12}
                          y={dc.y + 4}
                          fill="var(--heading)"
                          className="font-mono text-[9px] font-bold tracking-tighter"
                          style={{ textShadow: "0 1px 4px rgba(0,0,0,0.8)" }}
                        >
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
              <div
                className="pointer-events-none absolute inset-0 opacity-70"
                style={{
                  background:
                    "radial-gradient(circle at 78% 18%, rgba(109,93,252,0.12), transparent 22%), linear-gradient(180deg, rgba(255,255,255,0.015), transparent 42%)",
                }}
              />
              <div className="relative z-10 flex items-center justify-between gap-4">
                <div>
                  <p className="font-mono text-[9px] font-bold mb-4 sm:mb-6" style={{ color: "var(--muted)" }}>
                    {manifestLabel}
                  </p>
                  <h3 className="text-lg sm:text-xl font-light tracking-tight" style={{ color: "var(--heading)" }}>
                    {t(selected.name, locale)}
                  </h3>
                  <p className="mt-2 font-mono text-[10px]" style={{ color: "var(--muted)" }}>
                    {t(selected.region, locale)} // {t(selected.country, locale)}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span
                      className="rounded-full border px-2.5 py-1 font-mono text-[8px] tracking-[0.22em]"
                      style={{ borderColor: "rgba(255,255,255,0.08)", color: "var(--accent-bright)" }}
                    >
                      {t(mapStatusCopy.focusNode, locale)}
                    </span>
                    <span
                      className="rounded-full border px-2.5 py-1 font-mono text-[8px] tracking-[0.22em]"
                      style={{ borderColor: "rgba(255,255,255,0.08)", color: "var(--cyan)" }}
                    >
                      {t(mapStatusCopy.globalScreen, locale)}
                    </span>
                  </div>
                </div>
                <div
                  className="rounded-2xl border px-4 py-3 text-right"
                  style={{ borderColor: "rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)" }}
                >
                  <p className="font-mono text-[8px] tracking-[0.24em]" style={{ color: "var(--muted)" }}>
                    {t(mapStatusCopy.selectedHub, locale)}
                  </p>
                  <p className="mt-2 font-mono text-[14px]" style={{ color: "var(--accent-bright)" }}>
                    {t(mapStatusCopy.online, locale)}
                  </p>
                </div>
              </div>

              <div className="mt-6 sm:mt-8 grid grid-cols-2 gap-3 sm:gap-4">
                {[
                  { l: t(mapMetricLabels.hashrate, locale), v: selectedDynamic?.hashrate ?? selected.hashrate },
                  { l: t(mapMetricLabels.nodes, locale), v: String(selectedDynamic?.nodeCount ?? selected.nodeCount) },
                  { l: t(mapMetricLabels.latency, locale), v: selectedDynamic?.latency ?? selected.latency },
                  { l: t(mapMetricLabels.power, locale), v: selected.powerMix },
                ].map((item) => (
                  <div key={item.l} className="border-b pb-2" style={{ borderColor: "var(--border)" }}>
                    <p className="font-mono text-[7px] sm:text-[8px]" style={{ color: "var(--muted)" }}>
                      {item.l}
                    </p>
                    <p className="mt-1 font-mono text-[10px] sm:text-[11px]" style={{ color: "var(--heading)" }}>
                      {typeof item.v === "string" ? item.v : t(item.v, locale)}
                    </p>
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
                  (e.currentTarget as HTMLElement).style.background =
                    "linear-gradient(135deg, rgba(109,93,252,0.12), rgba(34,211,238,0.08))";
                  (e.currentTarget as HTMLElement).style.color = "var(--accent-bright)";
                }}
              >
                {locale === "zh" ? "查看服务器" : "View Servers"}
                <svg className="h-3 w-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M2 6h8M7 3l3 3-3 3" />
                </svg>
              </button>
            </div>

            <div
              className="p-5 sm:p-8 flex-1 relative overflow-hidden"
              style={{ background: "var(--background-elevated)" }}
            >
              <div
                className="pointer-events-none absolute inset-0 opacity-60"
                style={{
                  background:
                    "radial-gradient(circle at 18% 82%, rgba(34,211,238,0.1), transparent 24%), linear-gradient(180deg, rgba(255,255,255,0.012), transparent 40%)",
                }}
              />
              <div className="relative z-10 flex items-center justify-between gap-4">
                <p className="font-mono text-[9px] font-bold mb-3 sm:mb-4" style={{ color: "var(--muted)" }}>
                  {nodeLogsLabel}
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className="rounded-full border px-2.5 py-1 font-mono text-[8px] tracking-[0.22em]"
                    style={{ borderColor: "rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.04)", color: "var(--accent-bright)" }}
                  >
                    {t(mapStatusCopy.routeStable, locale)}
                  </span>
                  <span
                    className="rounded-full border px-2.5 py-1 font-mono text-[8px] tracking-[0.22em]"
                    style={{ borderColor: "rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.04)", color: "var(--emerald)" }}
                  >
                    {t(mapStatusCopy.telemetryLive, locale)}
                  </span>
                </div>
              </div>
              <div className="relative z-10 mt-2 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border p-4" style={{ borderColor: "rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.025)" }}>
                  <p className="font-mono text-[8px] tracking-[0.2em]" style={{ color: "var(--muted)" }}>
                    {t(mapStatusCopy.routeCapacity, locale)}
                  </p>
                  <p className="mt-2 font-mono text-[18px]" style={{ color: "var(--heading)" }}>
                    {routeCapacity}%
                  </p>
                </div>
                <div className="rounded-2xl border p-4" style={{ borderColor: "rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.025)" }}>
                  <p className="font-mono text-[8px] tracking-[0.2em]" style={{ color: "var(--muted)" }}>
                    {t(mapStatusCopy.telemetry, locale)}
                  </p>
                  <p className="mt-2 font-mono text-[18px]" style={{ color: "var(--accent-bright)" }}>
                    {t(mapStatusCopy.online, locale)}
                  </p>
                </div>
                <div className="rounded-2xl border p-4" style={{ borderColor: "rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.025)" }}>
                  <p className="font-mono text-[8px] tracking-[0.2em]" style={{ color: "var(--muted)" }}>
                    {t(mapStatusCopy.pathPulse, locale)}
                  </p>
                  <p className="mt-2 font-mono text-[18px]" style={{ color: "var(--cyan)" }}>
                    {pulseLatency} ms
                  </p>
                </div>
                <div className="rounded-2xl border p-4" style={{ borderColor: "rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.025)" }}>
                  <p className="font-mono text-[8px] tracking-[0.2em]" style={{ color: "var(--muted)" }}>
                    {t(mapStatusCopy.signalArc, locale)}
                  </p>
                  <p className="mt-2 font-mono text-[18px]" style={{ color: "var(--heading)" }}>
                    {signalArc}%
                  </p>
                </div>
              </div>
              <div className="relative z-10 mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border p-4" style={{ borderColor: "rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.025)" }}>
                  <p className="font-mono text-[8px] tracking-[0.2em]" style={{ color: "var(--muted)" }}>
                    {t(mapStatusCopy.commandCenter, locale)}
                  </p>
                  <p className="mt-2 font-mono text-[14px]" style={{ color: "var(--accent-bright)" }}>
                    {locale === "zh" ? "就绪" : "ARMED"}
                  </p>
                </div>
                <div className="rounded-2xl border p-4" style={{ borderColor: "rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.025)" }}>
                  <p className="font-mono text-[8px] tracking-[0.2em]" style={{ color: "var(--muted)" }}>
                    {t(mapStatusCopy.eventFlow, locale)}
                  </p>
                  <p className="mt-2 font-mono text-[14px]" style={{ color: "var(--cyan)" }}>
                    {locale === "zh" ? "持续流入" : "STREAMING"}
                  </p>
                </div>
              </div>
              <div className="relative z-10 mt-4 space-y-1 font-mono text-[8px] sm:text-[9px]" style={{ color: "var(--muted)" }}>
                <div style={{ color: "var(--accent-bright)" }}>
                  &gt; {t(mapStatusCopy.connectedTo, locale)} {t(selected.name, locale)}
                </div>
                <div>
                  &gt; {statusLabel}: {operationalLabel}
                </div>
                <div>
                  &gt; {pingLabel}: {t(selectedDynamic?.latency ?? selected.latency, locale)}
                </div>
                <div className="animate-pulse">&gt; {streamingLabel}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Node Selector Grid — responsive for 8 nodes */}
        <div
          className="stagger-child grid grid-cols-4 gap-px sm:grid-cols-4 lg:grid-cols-8"
          style={{ background: "var(--border)" }}
        >
          {datacenters.map((dc) => {
            const isActive = dc.id === selected.id;
            const statusColor =
              dc.status === "expanding" ? "var(--amber)" : dc.status === "observing" ? "var(--cyan)" : "var(--emerald)";
            return (
              <button
                key={dc.id}
                onClick={() => onSelect(dc.id)}
                className="p-3 sm:p-5 lg:p-6 text-left transition-colors relative"
                style={{
                  background: isActive ? "var(--accent-glow)" : "var(--background-elevated)",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) (e.currentTarget as HTMLElement).style.background = "var(--background-surface-hover)";
                }}
                onMouseLeave={(e) => {
                  if (!isActive) (e.currentTarget as HTMLElement).style.background = "var(--background-elevated)";
                }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: statusColor }}
                  />
                  <p
                    className="font-mono text-[9px] sm:text-[10px] font-bold"
                    style={{ color: isActive ? "var(--heading)" : "var(--muted)" }}
                  >
                    {dc.id.toUpperCase()}
                  </p>
                </div>
                <p className="font-mono text-[7px] sm:text-[8px]" style={{ color: "var(--muted)" }}>
                  {t(dc.name, locale)}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
