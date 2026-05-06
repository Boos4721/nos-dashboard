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

  /* ── Responsive container ── */
  const boxRef = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(960);
  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const ro = new ResizeObserver(e => { for (const en of e) { if (en.contentRect.width > 0) setW(Math.round(en.contentRect.width)); } });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const h = Math.round(w * 0.48);
  const small = w < 480;
  const medium = w >= 480 && w < 768;

  /* ── Projection ── */
  const { proj, pathGen } = useMemo(() => {
    const p = geoMercator().center([75, 28]).scale(w * 0.85).translate([w / 2, h / 2]);
    return { proj: p, pathGen: geoPath(p) };
  }, [w, h]);

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

  return (
    <section
      id="datacenters"
      ref={ref as React.RefObject<HTMLElement>}
      className={`scroll-reveal ${inView ? "in-view" : ""}`}
      suppressHydrationWarning
    >
      {/* ══════ Header ══════ */}
      <div className="px-4 pt-8 pb-3 sm:px-6 sm:pt-12 sm:pb-4 lg:px-8 lg:pt-16 lg:pb-5">
        <div className="mx-auto max-w-screen-2xl flex items-center gap-3">
          <p className="font-mono text-[9px] font-bold uppercase tracking-[0.3em] sm:text-[10px]" style={{ color: "var(--accent-bright)" }}>
            {t(M.title, locale)}
          </p>
          <div className="h-px flex-1" style={{ background: "var(--border)" }} />
          <div className="hidden sm:flex items-center gap-3">
            <span className="font-mono text-[9px]" style={{ color: "var(--muted)" }}>
              {locale === "zh" ? "节点" : "NODES"}: {datacenters.length}
            </span>
            <span className="font-mono text-[9px]" style={{ color: "var(--muted)" }}>
              {locale === "zh" ? "区域" : "REGIONS"}: 08
            </span>
          </div>
        </div>
      </div>

      {/* ══════ Full-bleed Map ══════ */}
      <div className="px-2 sm:px-4 lg:px-8">
        <div
          ref={boxRef}
          className="stagger-child relative mx-auto max-w-screen-2xl overflow-hidden rounded-lg sm:rounded-xl border"
          style={{ background: "var(--background-elevated)", borderColor: "var(--border)" }}
        >
          {/* Ambient bg */}
          <div className="pointer-events-none absolute inset-0" style={{
            background: "radial-gradient(circle at 22% 18%, rgba(109,93,252,0.14), transparent 26%), radial-gradient(circle at 84% 24%, rgba(34,211,238,0.12), transparent 24%)",
          }} />
          <div className="scanline pointer-events-none absolute inset-0 z-10" />

          {/* ── Badges (desktop only) ── */}
          {!small && (
            <div className="pointer-events-none absolute right-3 top-3 z-20 flex items-center gap-1.5 sm:right-4 sm:top-4 sm:flex-wrap sm:gap-2">
              {[M.liveMatrix, M.routeMesh, M.cmdCenter].map((label, i) => (
                <span key={i} className="rounded-full border px-2 py-0.5 font-mono tracking-[0.2em] sm:px-2.5 sm:py-1 sm:text-[8px]"
                  style={{
                    fontSize: "7px",
                    borderColor: "rgba(255,255,255,0.08)",
                    background: "rgba(255,255,255,0.04)",
                    color: i === 0 ? "var(--accent-bright)" : i === 2 ? "var(--cyan)" : "var(--muted)",
                  }}>
                  {t(label, locale)}
                </span>
              ))}
            </div>
          )}

          {/* ── Mobile LIVE pill ── */}
          {small && (
            <div className="pointer-events-none absolute right-3 top-3 z-20">
              <span className="rounded-full border px-2 py-0.5 font-mono text-[7px] tracking-[0.18em]"
                style={{ borderColor: "rgba(255,255,255,0.1)", background: "rgba(0,0,0,0.55)", color: "var(--accent-bright)", backdropFilter: "blur(4px)" }}>
                ● LIVE
              </span>
            </div>
          )}

          {/* ── Selected node overlay ── */}
          <div className="pointer-events-none absolute bottom-2 left-2 z-20 sm:bottom-3 sm:left-3 lg:bottom-4 lg:left-4">
            <div className="rounded-md border px-2.5 py-1.5 backdrop-blur-md sm:px-3 sm:py-2 lg:px-4 lg:py-3"
              style={{ borderColor: "rgba(255,255,255,0.08)", background: "rgba(0,0,0,0.6)" }}>
              <p className="font-mono tracking-[0.2em]" style={{ fontSize: small ? "6px" : "7px", color: "var(--muted)" }}>
                {t(M.hub, locale)}
              </p>
              <p className="mt-0.5 font-light sm:mt-1" style={{ fontSize: small ? "11px" : "12px", color: "var(--heading)" }}>
                {t(sel.name, locale)}
              </p>
              {!small && (
                <p className="mt-0.5 font-mono" style={{ fontSize: "8px", color: "var(--muted)" }}>
                  {t(sel.region, locale)} // {t(sel.country, locale)}
                </p>
              )}
              <div className="mt-1 flex items-center gap-1.5 sm:mt-2 sm:gap-2">
                <div className="h-1 w-1 rounded-full sm:h-1.5 sm:w-1.5" style={{ background: "var(--emerald)" }} />
                <span className="font-mono" style={{ fontSize: small ? "8px" : "9px", color: "var(--accent-bright)" }}>
                  {selDyn?.hashrate ?? sel.hashrate}
                </span>
                <span className="font-mono" style={{ fontSize: "7px", color: "var(--muted)" }}>·</span>
                <span className="font-mono" style={{ fontSize: small ? "8px" : "9px", color: "var(--cyan)" }}>
                  {t(selDyn?.latency ?? sel.latency, locale)}
                </span>
              </div>
            </div>
          </div>

          {/* ══════ SVG ══════ */}
          <svg viewBox={`0 0 ${w} ${h}`} className="relative z-10 block w-full" role="img"
            style={{ aspectRatio: `${w} / ${h}` }}>
            <defs>
              <linearGradient id="arcG" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.3" />
                <stop offset="50%" stopColor="var(--cyan)" stopOpacity="0.6" />
                <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.3" />
              </linearGradient>
              <linearGradient id="beam" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="rgba(255,255,255,0)" />
                <stop offset="45%" stopColor="rgba(255,255,255,0)" />
                <stop offset="50%" stopColor="rgba(255,255,255,0.95)" />
                <stop offset="55%" stopColor="rgba(255,255,255,0)" />
                <stop offset="100%" stopColor="rgba(255,255,255,0)" />
              </linearGradient>
              <filter id="nGlow" x="-100%" y="-100%" width="300%" height="300%">
                <feGaussianBlur stdDeviation="5" result="b" />
                <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
              <filter id="aGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="2.5" result="b" />
                <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>

            {/* Graticule */}
            <g opacity="0.05" stroke="var(--muted)" strokeWidth="0.5" fill="none">
              {[-60, -30, 0, 30, 60].map(lat => {
                const pts: string[] = [];
                for (let lng = -180; lng <= 180; lng += 5) { const p = proj([lng, lat]); if (p) pts.push(`${p[0]},${p[1]}`); }
                return pts.length > 1 ? <polyline key={`a${lat}`} points={pts.join(" ")} /> : null;
              })}
              {[-120, -60, 0, 60, 120].map(lng => {
                const pts: string[] = [];
                for (let lat = -80; lat <= 80; lat += 5) { const p = proj([lng, lat]); if (p) pts.push(`${p[0]},${p[1]}`); }
                return pts.length > 1 ? <polyline key={`o${lng}`} points={pts.join(" ")} /> : null;
              })}
            </g>

            {/* Countries */}
            {countries.map(c => (
              <path key={c.id} d={c.d} fill="var(--muted-dim)" stroke="var(--border)" strokeWidth="0.5" opacity="0.55" />
            ))}

            {/* Arcs */}
            {arcs.map((a, i) => {
              if (!a.ok) return null;
              const active = a.from === selectedId || a.to === selectedId;
              return (
                <g key={`${a.from}-${a.to}`}>
                  <path d={a.d} fill="none" stroke="url(#arcG)" strokeWidth={active ? "1.8" : "0.8"}
                    strokeOpacity={active ? 0.85 : 0.3} filter={active ? "url(#aGlow)" : undefined} strokeLinecap="round" />
                  {active && (
                    <path d={a.d} fill="none" stroke="url(#beam)" strokeWidth="2.2" strokeLinecap="round" opacity={0.9}>
                      <animate attributeName="stroke-dasharray" values="0 300;60 240;0 300" dur={`${2.4 + i * 0.3}s`} repeatCount="indefinite" />
                      <animate attributeName="stroke-dashoffset" values="0;-300" dur={`${2.4 + i * 0.3}s`} repeatCount="indefinite" />
                    </path>
                  )}
                </g>
              );
            })}

            {/* Radar on selected */}
            {nodes.filter(n => n.id === selectedId && n.vis).map(n => (
              <g key={`r${n.id}`} opacity="0.1">
                <circle cx={n.x} cy={n.y} r={w * 0.12} fill="none" stroke="var(--heading)" strokeWidth="0.3" strokeDasharray="3 6" />
                <circle cx={n.x} cy={n.y} r={w * 0.21} fill="none" stroke="var(--heading)" strokeWidth="0.2" strokeDasharray="2 8" />
                <line x1={n.x} y1={n.y} x2={n.x} y2={n.y - w * 0.21} stroke="var(--heading)" strokeWidth="0.4"
                  className="origin-center animate-[spin_12s_linear_infinite]" style={{ transformOrigin: `${n.x}px ${n.y}px` }} />
              </g>
            ))}

            {/* Markers */}
            {nodes.filter(n => n.vis).map(n => {
              const active = n.id === selectedId;
              const dc = dynMap.get(n.id);
              const strength = dc?.nodeCount ?? n.nodeCount;
              const sz = active ? (small ? 4 : 5) : n.status === "expanding" ? (small ? 3 : 4) : (small ? 2.5 : 3);
              const ring = active ? (small ? 28 : 36) : 12 + (strength % 6);
              const col = dcColor(n.status);
              return (
                <g key={n.id} className="cursor-pointer" onClick={() => onSelect(n.id)}
                  role="button" tabIndex={0}
                  onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSelect(n.id); } }}>
                  <circle cx={n.x} cy={n.y} r={ring} fill="var(--accent)" opacity={active ? 0.08 : 0.025} />
                  <circle cx={n.x} cy={n.y} r={active ? (small ? 22 : 28) : 10 + (strength % 5)}
                    fill="none" stroke="var(--accent)" strokeOpacity={active ? 0.2 : 0.08}
                    strokeWidth="0.6" strokeDasharray="2 4" className="animate-pulse" />
                  {active && !small && (
                    <circle cx={n.x} cy={n.y} r="40" fill="none" stroke="rgba(34,211,238,0.16)" strokeWidth="0.6" strokeDasharray="3 7">
                      <animate attributeName="r" values="32;40;32" dur="3.2s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.2;0.6;0.2" dur="3.2s" repeatCount="indefinite" />
                    </circle>
                  )}
                  <circle cx={n.x} cy={n.y} r={sz} fill={active ? "var(--heading)" : col}
                    filter={active ? "url(#nGlow)" : undefined} />
                  <circle cx={n.x} cy={n.y} r={sz + 1.5} fill="none" stroke={col} strokeWidth="0.5" strokeOpacity={active ? 0.6 : 0.25} />
                  <circle cx={n.x} cy={n.y} r={small ? 10 : 14} fill="transparent" />
                  {active && !small && (
                    <text x={n.x + 10} y={n.y + 3} fill="var(--heading)"
                      className="font-mono font-bold tracking-tighter"
                      style={{ fontSize: "9px", textShadow: "0 1px 4px rgba(0,0,0,0.8)" }}>
                      {t(n.name, locale)}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* ══════ DC Cards ══════ */}
      <div className="mt-3 px-2 sm:mt-4 sm:px-4 lg:mt-6 lg:px-8">
        <div className="mx-auto max-w-screen-2xl stagger-child grid grid-cols-2 gap-px sm:grid-cols-4 lg:grid-cols-8"
          style={{ background: "var(--border)" }}>
          {datacenters.map(dc => {
            const active = dc.id === selectedId;
            const d = dynMap.get(dc.id);
            const col = dcColor(dc.status);
            return (
              <button key={dc.id} onClick={() => onSelect(dc.id)}
                className="p-2.5 text-left transition-colors sm:p-3 lg:p-4"
                style={{ background: active ? "var(--accent-glow)" : "var(--background-elevated)" }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.background = "var(--background-surface-hover)"; }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.background = "var(--background-elevated)"; }}>
                <div className="flex items-center gap-1.5">
                  <div className="h-1.5 w-1.5 rounded-full sm:h-2 sm:w-2" style={{ background: col }} />
                  <p className="font-mono font-bold tracking-wider" style={{ fontSize: small ? "8px" : "9px", color: active ? "var(--heading)" : "var(--muted)" }}>
                    {dc.id.toUpperCase()}
                  </p>
                </div>
                <p className="mt-1 font-mono" style={{ fontSize: small ? "7px" : "8px", color: "var(--muted)" }}>
                  {t(dc.name, locale)}
                </p>
                <div className="mt-1.5 grid grid-cols-2 gap-x-2 gap-y-1">
                  <div>
                    <p className="font-mono" style={{ fontSize: "6px", color: "var(--muted)" }}>{t(M.hr, locale)}</p>
                    <p className="font-mono font-medium" style={{ fontSize: small ? "9px" : "10px", color: "var(--heading)" }}>
                      {d?.hashrate ?? dc.hashrate}
                    </p>
                  </div>
                  <div>
                    <p className="font-mono" style={{ fontSize: "6px", color: "var(--muted)" }}>{t(M.nodes, locale)}</p>
                    <p className="font-mono font-medium" style={{ fontSize: small ? "9px" : "10px", color: "var(--heading)" }}>
                      {d?.nodeCount ?? dc.nodeCount}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ══════ Telemetry ══════ */}
      <div className="mt-3 px-2 pb-8 sm:mt-4 sm:px-4 sm:pb-12 lg:mt-6 lg:px-8 lg:pb-20">
        <div className="mx-auto max-w-screen-2xl stagger-child grid grid-cols-2 gap-px sm:grid-cols-4"
          style={{ background: "var(--border)" }}>
          {[
            { l: M.cap, v: `${tele.routeCapacity}%`, c: "var(--heading)" },
            { l: M.tlm, v: t(M.online, locale), c: "var(--accent-bright)" },
            { l: M.pulse, v: `${tele.pulseLatencyMs} ms`, c: "var(--cyan)" },
            { l: M.arc, v: `${tele.signalArc}%`, c: "var(--heading)" },
          ].map(item => (
            <div key={t(item.l, locale)} className="p-2.5 sm:p-3 lg:p-4" style={{ background: "var(--background-elevated)" }}>
              <p className="font-mono tracking-[0.18em]" style={{ fontSize: small ? "6px" : "7px", color: "var(--muted)" }}>
                {t(item.l, locale)}
              </p>
              <p className="mt-1 font-mono sm:mt-1.5" style={{ fontSize: small ? "14px" : "16px", color: item.c }}>
                {item.v}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-4 flex justify-center sm:mt-5">
          <button onClick={onOpenServers}
            className="flex w-full items-center justify-center gap-2 rounded-md border py-2.5 font-mono font-bold uppercase tracking-widest transition-all sm:w-auto sm:px-8"
            style={{ fontSize: "10px", borderColor: "var(--border-accent)", color: "var(--accent-bright)", background: "linear-gradient(135deg, rgba(109,93,252,0.12), rgba(34,211,238,0.08))" }}
            onMouseEnter={e => { e.currentTarget.style.background = "var(--accent)"; e.currentTarget.style.color = "#fff"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "linear-gradient(135deg, rgba(109,93,252,0.12), rgba(34,211,238,0.08))"; e.currentTarget.style.color = "var(--accent-bright)"; }}>
            {locale === "zh" ? "查看服务器详情" : "View Server Details"}
            <svg className="h-3 w-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 6h8M7 3l3 3-3 3" /></svg>
          </button>
        </div>
      </div>
    </section>
  );
}
