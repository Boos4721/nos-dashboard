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

/* ── Types ─────────────────────────────────────────────────────── */
type DcId = string;
interface RegionLine { from: DcId; to: DcId }

/* ── Route topology ────────────────────────────────────────────── */
const regionLines: RegionLine[] = [
  { from: "xinjiang", to: "hubei" },
  { from: "shandong", to: "hong-kong" },
  { from: "hubei", to: "singapore" },
  { from: "hong-kong", to: "thailand" },
  { from: "singapore", to: "thailand" },
  { from: "hubei", to: "zhejiang" },
  { from: "zhejiang", to: "hong-kong" },
  { from: "hubei", to: "sichuan" },
  { from: "sichuan", to: "xinjiang" },
  { from: "hong-kong", to: "germany" },
  { from: "germany", to: "france" },
  { from: "singapore", to: "germany" },
  { from: "singapore", to: "malaysia" },
  { from: "germany", to: "usa" },
];

/* ── Copy ──────────────────────────────────────────────────────── */
const M = {
  title:      { en: "[ GLOBAL_OPERATIONS_MAP ]", zh: "[ 全球运维地图 ]" },
  liveMatrix: { en: "LIVE NETWORK MATRIX", zh: "实时网络矩阵" },
  routeMesh:  { en: "ROUTE MESH", zh: "链路拓扑" },
  cmdCenter:  { en: "COMMAND CENTER", zh: "指挥中心" },
  hub:        { en: "SELECTED HUB", zh: "当前节点" },
  online:     { en: "ONLINE", zh: "在线" },
  hr:         { en: "HASHRATE", zh: "算力" },
  nodes:      { en: "NODES", zh: "节点数" },
  lat:        { en: "LATENCY", zh: "延迟" },
  pwr:        { en: "POWER", zh: "供电" },
  cap:        { en: "ROUTE CAPACITY", zh: "链路容量" },
  tlm:        { en: "TELEMETRY", zh: "遥测" },
  pulse:      { en: "PATH PULSE", zh: "路径脉冲" },
  arc:        { en: "SIGNAL ARC", zh: "信号弧带" },
} as const;

/* ── World map data ────────────────────────────────────────────── */
const topo = countriesTopo as unknown as Topology;
const geo = topojson.feature(topo, topo.objects.countries as GeometryCollection);

/* ── Helpers ───────────────────────────────────────────────────── */
function arcPath(from: [number, number], to: [number, number], proj: GeoProjection) {
  const interp = geoInterpolate(from, to);
  const pts = Array.from({ length: 64 }, (_, i) => proj(interp(i / 63))).filter(Boolean) as [number, number][];
  if (pts.length < 2) return "";
  return pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0]} ${p[1]}`).join(" ");
}

function dcColor(s: string) {
  return s === "expanding" ? "var(--amber)" : s === "observing" ? "var(--cyan)" : "var(--emerald)";
}

/* ── Component ─────────────────────────────────────────────────── */
export function WorldMap({
  locale, selectedId, onSelect, onOpenServers, chainBlockNumber, simulated = false,
}: {
  locale: Locale;
  selectedId: string;
  onSelect: (id: string) => void;
  onOpenServers: () => void;
  chainBlockNumber?: number;
  simulated?: boolean;
}) {
  const dynAll = simulated ? useDynamicDatacenters() : useLiveDatacenters(chainBlockNumber);
  const tele = useTelemetryDemoState();
  const dynMap = new Map(dynAll.map(d => [d.id, d]));
  const sel = datacenters.find(d => d.id === selectedId) ?? datacenters[0];
  const selDyn = dynMap.get(sel.id);
  const { ref, inView } = useInView();

  /* ── Fluid responsive container ── */
  const boxRef = useRef<HTMLDivElement>(null);
  const [vw, setVw] = useState(typeof window !== "undefined" ? window.innerWidth : 1200);
  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const update = () => setVw(el.clientWidth);
    update();
    const ro = new ResizeObserver(() => update());
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  /* ── Breakpoints (JS-driven, fluid) ── */
  const isMobile = vw < 640;
  const isTablet = vw >= 640 && vw < 1024;
  const isDesktop = vw >= 1024;
  const isWide = vw >= 1440;

  /* ── Map dimensions ── */
  const mapW = vw;
  const mapH = isMobile ? Math.round(mapW * 0.7) : isTablet ? Math.round(mapW * 0.55) : Math.round(mapW * 0.5);

  /* ── Projection — full world view ── */
  const { proj, pathGen } = useMemo(() => {
    const p = geoMercator()
      .center([15, 18])
      .scale(mapW * (isMobile ? 0.11 : isTablet ? 0.1 : 0.095))
      .translate([mapW / 2, mapH * 0.48]);
    return { proj: p, pathGen: geoPath(p) };
  }, [mapW, mapH, isMobile, isTablet]);

  const countries = useMemo(() => geo.features.map((f, i) => ({
    id: f.id ?? `c${i}`, d: pathGen(f) ?? "",
  })), [pathGen]);

  const nodes = useMemo(() => datacenters.map(dc => {
    const pos = proj(dc.coordinates);
    return { ...dc, x: pos?.[0] ?? 0, y: pos?.[1] ?? 0, vis: pos !== null };
  }), [proj]);

  const arcs = useMemo(() => regionLines.map(l => {
    const a = datacenters.find(d => d.id === l.from);
    const b = datacenters.find(d => d.id === l.to);
    if (!a || !b) return { ...l, d: "", ok: false };
    const d = arcPath(a.coordinates, b.coordinates, proj);
    return { ...l, d, ok: d !== "" };
  }), [proj]);

  /* ── Fluid font sizes ── */
  const fs = {
    title: isMobile ? 14 : isTablet ? 16 : 18,
    badge: isMobile ? 11 : 12,
    label: isMobile ? 10 : 11,
    overlayTitle: isMobile ? 16 : isTablet ? 18 : 22,
    overlaySub: isMobile ? 11 : 12,
    overlayVal: isMobile ? 14 : isTablet ? 15 : 16,
    cardTitle: isMobile ? 13 : isTablet ? 14 : 15,
    cardLabel: isMobile ? 10 : 11,
    cardVal: isMobile ? 16 : isTablet ? 18 : 20,
    teleLabel: isMobile ? 11 : 12,
    teleVal: isMobile ? 24 : isTablet ? 28 : 32,
  };

  /* ── Marker sizing ── */
  const markerBase = isMobile ? 2.5 : isTablet ? 3.5 : 4.5;

  return (
    <section
      id="datacenters"
      ref={ref as React.RefObject<HTMLElement>}
      className={`scroll-reveal ${inView ? "in-view" : ""}`}
      suppressHydrationWarning
    >
      {/* ══════ Full-bleed Map Container ══════ */}
      <div
        ref={boxRef}
        className="relative w-full overflow-hidden"
        style={{ background: "var(--background-elevated)" }}
      >
        {/* Ambient glow */}
        <div className="pointer-events-none absolute inset-0" style={{
          background: "radial-gradient(ellipse at 25% 30%, rgba(109,93,252,0.12), transparent 50%), radial-gradient(ellipse at 75% 25%, rgba(34,211,238,0.10), transparent 45%), radial-gradient(ellipse at 50% 80%, rgba(109,93,252,0.06), transparent 60%)",
        }} />
        <div className="scanline pointer-events-none absolute inset-0 z-10" />

        {/* ── Top Bar: Title + Badges ── */}
        <div className="relative z-20 flex items-center justify-between"
          style={{ padding: isMobile ? "12px 12px 0" : isTablet ? "16px 24px 0" : "20px 32px 0" }}>
          <p className="font-mono font-bold uppercase tracking-[0.3em]"
            style={{ fontSize: fs.title, color: "var(--accent-bright)" }}>
            {t(M.title, locale)}
          </p>
          {!isMobile && (
            <div className="flex items-center gap-3">
              <span className="font-mono" style={{ fontSize: fs.badge, color: "var(--muted)" }}>
                {locale === "zh" ? "节点" : "NODES"}: {datacenters.length}
              </span>
              <span className="font-mono" style={{ fontSize: fs.badge, color: "var(--muted)" }}>
                {locale === "zh" ? "区域" : "REGIONS"}: {datacenters.length}
              </span>
            </div>
          )}
        </div>

        {/* ── Status Badges (absolute positioned) ── */}
        {isDesktop && (
          <div className="pointer-events-none absolute right-6 top-16 z-20 flex gap-2">
            {[M.liveMatrix, M.routeMesh, M.cmdCenter].map((label, i) => (
              <span key={i} className="glass-badge rounded-full border px-2.5 py-1 font-mono tracking-[0.18em] backdrop-blur-md"
                style={{
                  fontSize: fs.badge,
                  color: i === 0 ? "var(--accent-bright)" : i === 2 ? "var(--cyan)" : "var(--muted)",
                }}>
                {t(label, locale)}
              </span>
            ))}
          </div>
        )}
        {isMobile && (
          <div className="pointer-events-none absolute right-3 top-3 z-20">
            <span className="glass-badge rounded-full border px-2 py-0.5 font-mono tracking-[0.16em] backdrop-blur-md"
              style={{ fontSize: 13, color: "var(--accent-bright)" }}>
              ● LIVE
            </span>
          </div>
        )}

        {/* ── SVG Map ── */}
        <svg viewBox={`0 0 ${mapW} ${mapH}`}
          className="relative z-10 block w-full"
          style={{ height: mapH }}
          role="img">
          <defs>
            <linearGradient id="arcG" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.25" />
              <stop offset="50%" stopColor="var(--cyan)" stopOpacity="0.55" />
              <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.25" />
            </linearGradient>
            <linearGradient id="beam" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="rgba(255,255,255,0)" />
              <stop offset="45%" stopColor="rgba(255,255,255,0)" />
              <stop offset="50%" stopColor="rgba(255,255,255,0.9)" />
              <stop offset="55%" stopColor="rgba(255,255,255,0)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0)" />
            </linearGradient>
            <filter id="nGlow" x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur stdDeviation="4" result="b" />
              <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <filter id="aGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2" result="b" />
              <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          {/* Graticule */}
          <g opacity="0.04" stroke="var(--muted)" strokeWidth="0.5" fill="none">
            {[-60, -30, 0, 30, 60].map(lat => {
              const pts: string[] = [];
              for (let lng = -180; lng <= 180; lng += 5) {
                const p = proj([lng, lat]);
                if (p) pts.push(`${p[0]},${p[1]}`);
              }
              return pts.length > 1 ? <polyline key={`a${lat}`} points={pts.join(" ")} /> : null;
            })}
            {[-120, -60, 0, 60, 120].map(lng => {
              const pts: string[] = [];
              for (let lat = -80; lat <= 80; lat += 5) {
                const p = proj([lng, lat]);
                if (p) pts.push(`${p[0]},${p[1]}`);
              }
              return pts.length > 1 ? <polyline key={`o${lng}`} points={pts.join(" ")} /> : null;
            })}
          </g>

          {/* Countries */}
          {countries.map(c => (
            <path key={c.id} d={c.d}
              fill="var(--muted-dim)" stroke="var(--border)" strokeWidth="0.5" opacity="0.5" />
          ))}

          {/* Arcs */}
          {arcs.map((a, i) => {
            if (!a.ok) return null;
            const active = a.from === selectedId || a.to === selectedId;
            return (
              <g key={`${a.from}-${a.to}`}>
                <path d={a.d} fill="none" stroke="url(#arcG)"
                  strokeWidth={active ? (isMobile ? 1.2 : 1.8) : (isMobile ? 0.5 : 0.7)}
                  strokeOpacity={active ? 0.85 : 0.25}
                  filter={active ? "url(#aGlow)" : undefined}
                  strokeLinecap="round" />
                {active && (
                  <path d={a.d} fill="none" stroke="url(#beam)"
                    strokeWidth={isMobile ? 1.5 : 2}
                    strokeLinecap="round" opacity={0.85}>
                    <animate attributeName="stroke-dasharray" values="0 300;60 240;0 300" dur={`${2.4 + i * 0.3}s`} repeatCount="indefinite" />
                    <animate attributeName="stroke-dashoffset" values="0;-300" dur={`${2.4 + i * 0.3}s`} repeatCount="indefinite" />
                  </path>
                )}
              </g>
            );
          })}

          {/* Radar on selected */}
          {nodes.filter(n => n.id === selectedId && n.vis).map(n => (
            <g key={`r${n.id}`} opacity="0.08">
              <circle cx={n.x} cy={n.y} r={mapW * 0.08} fill="none" stroke="var(--heading)"
                strokeWidth="0.3" strokeDasharray="3 6" />
              <circle cx={n.x} cy={n.y} r={mapW * 0.14} fill="none" stroke="var(--heading)"
                strokeWidth="0.2" strokeDasharray="2 8" />
              {!isMobile && (
                <line x1={n.x} y1={n.y} x2={n.x} y2={n.y - mapW * 0.14}
                  stroke="var(--heading)" strokeWidth="0.4"
                  style={{ transformOrigin: `${n.x}px ${n.y}px`, animation: "spin 12s linear infinite" }} />
              )}
            </g>
          ))}

          {/* Markers */}
          {nodes.filter(n => n.vis).map(n => {
            const active = n.id === selectedId;
            const dc = dynMap.get(n.id);
            const strength = dc?.nodeCount ?? n.nodeCount;
            const sz = active ? markerBase * 1.3 : (n.status === "expanding" ? markerBase * 1.1 : markerBase);
            const ring = active ? (isMobile ? 24 : 32) : 10 + (strength % 5);
            const col = dcColor(n.status);
            return (
              <g key={n.id} className="cursor-pointer" onClick={() => onSelect(n.id)}
                role="button" tabIndex={0}
                onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSelect(n.id); } }}>
                {/* Outer glow */}
                <circle cx={n.x} cy={n.y} r={ring} fill="var(--accent)"
                  opacity={active ? 0.07 : 0.02} />
                {/* Pulse ring */}
                <circle cx={n.x} cy={n.y} r={active ? (isMobile ? 18 : 24) : 8 + (strength % 4)}
                  fill="none" stroke="var(--accent)" strokeOpacity={active ? 0.18 : 0.06}
                  strokeWidth="0.5" strokeDasharray="2 4">
                  <animate attributeName="opacity" values="0.5;1;0.5" dur="3s" repeatCount="indefinite" />
                </circle>
                {/* Animated outer ring for active */}
                {active && !isMobile && (
                  <circle cx={n.x} cy={n.y} r="36" fill="none" stroke="rgba(34,211,238,0.14)" strokeWidth="0.6" strokeDasharray="3 7">
                    <animate attributeName="r" values="28;36;28" dur="3.2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.15;0.5;0.15" dur="3.2s" repeatCount="indefinite" />
                  </circle>
                )}
                {/* Core dot */}
                <circle cx={n.x} cy={n.y} r={sz}
                  fill={active ? "var(--heading)" : col}
                  filter={active ? "url(#nGlow)" : undefined} />
                {/* Border ring */}
                <circle cx={n.x} cy={n.y} r={sz + 1.5} fill="none"
                  stroke={col} strokeWidth="0.5" strokeOpacity={active ? 0.55 : 0.2} />
                {/* Hit area */}
                <circle cx={n.x} cy={n.y} r={isMobile ? 12 : 16} fill="transparent" />
                {/* Label */}
                {active && !isMobile && (
                  <text x={n.x + 10} y={n.y + 3} fill="var(--heading)"
                    className="font-mono font-bold tracking-tighter"
                    style={{ fontSize: "14px", textShadow: "0 1px 6px rgba(0,0,0,0.9)" }}>
                    {t(n.name, locale)}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {/* ── Selected Node Overlay (bottom-left) ── */}
        <div className="pointer-events-none absolute bottom-3 left-3 z-20"
          style={{ bottom: isMobile ? 8 : 12, left: isMobile ? 8 : 16 }}>
          <div className="glass-overlay rounded-lg border backdrop-blur-xl"
            style={{
              padding: isMobile ? "8px 10px" : isTablet ? "10px 14px" : "12px 18px",
            }}>
            <p className="font-mono tracking-[0.2em]"
              style={{ fontSize: fs.label, color: "var(--muted)" }}>
              {t(M.hub, locale)}
            </p>
            <p className="mt-0.5 font-light"
              style={{ fontSize: fs.overlayTitle, color: "var(--heading)" }}>
              {t(sel.name, locale)}
            </p>
            {!isMobile && (
              <p className="mt-0.5 font-mono"
                style={{ fontSize: fs.overlaySub, color: "var(--muted)" }}>
                {t(sel.region, locale)} // {t(sel.country, locale)}
              </p>
            )}
            <div className="mt-1 flex items-center gap-1.5">
              <div className="h-1 w-1 rounded-full"
                style={{ background: "var(--emerald)" }} />
              <span className="font-mono"
                style={{ fontSize: fs.overlayVal, color: "var(--accent-bright)" }}>
                {selDyn?.hashrate ?? sel.hashrate}
              </span>
              <span className="font-mono" style={{ fontSize: 12, color: "var(--muted)" }}>·</span>
              <span className="font-mono"
                style={{ fontSize: fs.overlayVal, color: "var(--cyan)" }}>
                {t(selDyn?.latency ?? sel.latency, locale)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ══════ DC Cards — Full Width ══════ */}
      <div style={{ padding: isMobile ? "8px 0" : isTablet ? "12px 0" : "16px 0" }}>
        {/* Mobile: horizontal scroll */}
        {isMobile ? (
          <div className="flex gap-px overflow-x-auto px-3 pb-1"
            style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch" }}>
            {datacenters.map(dc => {
              const active = dc.id === selectedId;
              const d = dynMap.get(dc.id);
              const col = dcColor(dc.status);
              return (
                <button key={dc.id} onClick={() => onSelect(dc.id)}
                  className="shrink-0 text-left transition-colors"
                  style={{
                    width: 140,
                    padding: "10px 12px",
                    background: active ? "var(--accent-glow)" : "var(--background-elevated)",
                    borderRight: "1px solid var(--border)",
                  }}>
                  <div className="flex items-center gap-1.5">
                    <div className="h-1.5 w-1.5 rounded-full" style={{ background: col }} />
                    <p className="font-mono font-bold tracking-wider"
                      style={{ fontSize: fs.cardTitle, color: active ? "var(--heading)" : "var(--muted)" }}>
                      {dc.id.toUpperCase()}
                    </p>
                  </div>
                  <p className="mt-0.5 font-mono" style={{ fontSize: fs.cardLabel, color: "var(--muted)" }}>
                    {t(dc.name, locale)}
                  </p>
                  <div className="mt-1 flex gap-3">
                    <div>
                      <p className="font-mono" style={{ fontSize: 10, color: "var(--muted)" }}>{t(M.hr, locale)}</p>
                      <p className="font-mono font-medium" style={{ fontSize: fs.cardVal, color: "var(--heading)" }}>
                        {d?.hashrate ?? dc.hashrate}
                      </p>
                    </div>
                    <div>
                      <p className="font-mono" style={{ fontSize: 10, color: "var(--muted)" }}>{t(M.nodes, locale)}</p>
                      <p className="font-mono font-medium" style={{ fontSize: fs.cardVal, color: "var(--heading)" }}>
                        {d?.nodeCount ?? dc.nodeCount}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          /* Tablet/Desktop: grid */
          <div className="mx-auto grid gap-px"
            style={{
              maxWidth: isWide ? 1536 : "100%",
              gridTemplateColumns: isTablet ? "repeat(4, 1fr)" : "repeat(5, 1fr)",
              padding: isTablet ? "0 24px" : "0 32px",
              background: "var(--border)",
            }}>
            {datacenters.map(dc => {
              const active = dc.id === selectedId;
              const d = dynMap.get(dc.id);
              const col = dcColor(dc.status);
              return (
                <button key={dc.id} onClick={() => onSelect(dc.id)}
                  className="text-left transition-colors"
                  style={{
                    padding: isTablet ? "12px" : "16px",
                    background: active ? "var(--accent-glow)" : "var(--background-elevated)",
                  }}
                  onMouseEnter={e => { if (!active) e.currentTarget.style.background = "var(--background-surface-hover)"; }}
                  onMouseLeave={e => { if (!active) e.currentTarget.style.background = "var(--background-elevated)"; }}>
                  <div className="flex items-center gap-1.5">
                    <div className="h-2 w-2 rounded-full" style={{ background: col }} />
                    <p className="font-mono font-bold tracking-wider"
                      style={{ fontSize: fs.cardTitle, color: active ? "var(--heading)" : "var(--muted)" }}>
                      {dc.id.toUpperCase()}
                    </p>
                  </div>
                  <p className="mt-0.5 font-mono" style={{ fontSize: fs.cardLabel, color: "var(--muted)" }}>
                    {t(dc.name, locale)}
                  </p>
                  <div className="mt-1.5 grid grid-cols-2 gap-x-2 gap-y-1">
                    <div>
                      <p className="font-mono" style={{ fontSize: fs.cardLabel, color: "var(--muted)" }}>{t(M.hr, locale)}</p>
                      <p className="font-mono font-medium" style={{ fontSize: fs.cardVal, color: "var(--heading)" }}>
                        {d?.hashrate ?? dc.hashrate}
                      </p>
                    </div>
                    <div>
                      <p className="font-mono" style={{ fontSize: fs.cardLabel, color: "var(--muted)" }}>{t(M.nodes, locale)}</p>
                      <p className="font-mono font-medium" style={{ fontSize: fs.cardVal, color: "var(--heading)" }}>
                        {d?.nodeCount ?? dc.nodeCount}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ══════ Telemetry Row + CTA ══════ */}
      <div style={{ padding: isMobile ? "0 12px 24px" : isTablet ? "0 24px 32px" : "0 32px 48px" }}>
        <div className="mx-auto grid gap-px"
          style={{
            maxWidth: isWide ? 1536 : "100%",
            gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(4, 1fr)",
          }}>
          {[
            { l: M.cap, v: `${tele.routeCapacity}%`, c: "var(--heading)" },
            { l: M.tlm, v: t(M.online, locale), c: "var(--accent-bright)" },
            { l: M.pulse, v: `${tele.pulseLatencyMs} ms`, c: "var(--cyan)" },
            { l: M.arc, v: `${tele.signalArc}%`, c: "var(--heading)" },
          ].map(item => (
            <div key={item.l.en}
              className="transition-colors"
              style={{
                padding: isMobile ? "10px" : isTablet ? "12px 16px" : "16px 20px",
                background: "var(--background-elevated)",
              }}>
              <p className="font-mono tracking-[0.16em]"
                style={{ fontSize: fs.teleLabel, color: "var(--muted)" }}>
                {t(item.l, locale)}
              </p>
              <p className="mt-1 font-mono"
                style={{ fontSize: fs.teleVal, color: item.c }}>
                {item.v}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-4 flex justify-center" style={{ marginTop: isMobile ? 12 : 16 }}>
          <button onClick={onOpenServers}
            className="flex items-center justify-center gap-2 rounded-md border font-mono font-bold uppercase tracking-widest transition-all"
            style={{
              width: isMobile ? "100%" : "auto",
              padding: isMobile ? "12px" : "12px 32px",
              fontSize: fs.badge + 1,
              borderColor: "var(--border-accent)",
              color: "var(--accent-bright)",
              background: "linear-gradient(135deg, rgba(109,93,252,0.12), rgba(34,211,238,0.08))",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "var(--accent)"; e.currentTarget.style.color = "#fff"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "linear-gradient(135deg, rgba(109,93,252,0.12), rgba(34,211,238,0.08))"; e.currentTarget.style.color = "var(--accent-bright)"; }}>
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
