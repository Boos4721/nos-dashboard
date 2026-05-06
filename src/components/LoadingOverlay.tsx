"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTheme } from "@/lib/ThemeContext";

interface LoadingOverlayProps {
  ready: boolean;
  /** Fail-safe: force-dismiss after this many ms even if ready is still false. */
  maxVisibleMs?: number;
}

type Locale = "zh" | "en";
type Phase = "boot" | "link" | "handoff" | "done";

const copy: Record<Locale, {
  title: string;
  stage: [string, string, string, string];
  sequence: string[];
  skip: string;
  percent: string;
  footer: string;
  version: string;
  fabric: string;
  core: string;
  mode: string;
  protocol: string;
}> = {
  zh: {
    title: "笔记云算力中心",
    stage: ["系统唤醒", "节点连线", "中枢接管", "已就绪"],
    sequence: [
      "唤醒 NOS 链核心",
      "接入链上实时遥测",
      "展开全球节点视图",
      "确认访问通道安全",
      "点亮主干路由网络",
      "控制中枢已接管界面",
    ],
    skip: "跳过",
    percent: "进度",
    footer: "NOS CHAIN // GLOBAL STARTUP SEQUENCE",
    version: "v0.1 / nos-chain-boot",
    fabric: "网络已联通",
    core: "核心：0x4E4F53",
    mode: "算力调度正在上线",
    protocol: "全球节点链路校准中",
  },
  en: {
    title: "NOTECLOUD COMPUTE CENTER",
    stage: ["SYSTEM WAKE", "NODE LINKUP", "CONTROL HANDOFF", "READY"],
    sequence: [
      "WAKING THE NOS CHAIN CORE",
      "PULLING LIVE CHAIN TELEMETRY",
      "EXPANDING THE GLOBAL NODE GRID",
      "VERIFYING SECURE ACCESS CHANNELS",
      "LIGHTING THE BACKBONE ROUTE FABRIC",
      "CONTROL CENTER HAS TAKEN THE SURFACE",
    ],
    skip: "skip",
    percent: "progress",
    footer: "NOS CHAIN // GLOBAL STARTUP SEQUENCE",
    version: "v0.1 / nos-chain-boot",
    fabric: "FABRIC ONLINE",
    core: "CORE: 0x4E4F53",
    mode: "COMPUTE DISPATCH COMING ONLINE",
    protocol: "CALIBRATING GLOBAL NODE LINKS",
  },
};

export function LoadingOverlay({ ready, maxVisibleMs = 5000 }: LoadingOverlayProps) {
  const { theme } = useTheme();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const [fading, setFading] = useState(false);
  const [skipped, setSkipped] = useState(false);
  const [entered, setEntered] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [overlayArmed, setOverlayArmed] = useState(false);
  const [pulseIndex, setPulseIndex] = useState(0);

  const readyRef = useRef(ready);
  const exitTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const finishStartedRef = useRef(false);
  const minVisibleRef = useRef(false);

  useEffect(() => {
    readyRef.current = ready;
  }, [ready]);

  useEffect(() => {
    setHydrated(true);
    setVisible(true);
    const armTimer = globalThis.setTimeout(() => {
      setOverlayArmed(true);
    }, 20);
    const enterFrame = requestAnimationFrame(() => setEntered(true));
    const minVisibleTimer = globalThis.setTimeout(() => {
      minVisibleRef.current = true;
    }, 3400);
    return () => {
      cancelAnimationFrame(enterFrame);
      globalThis.clearTimeout(armTimer);
      globalThis.clearTimeout(minVisibleTimer);
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const timer = globalThis.setTimeout(() => {
      setSkipped(true);
    }, maxVisibleMs);
    return () => globalThis.clearTimeout(timer);
  }, [hydrated, maxVisibleMs]);

  useEffect(() => {
    if (!hydrated) return;

    const timer = globalThis.setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          globalThis.clearInterval(timer);
          return 100;
        }

        if (!readyRef.current) {
          if (prev < 24) return Math.min(prev + Math.random() * 1.4 + 0.9, 24);
          if (prev < 56) return Math.min(prev + Math.random() * 0.95 + 0.42, 56);
          return Math.min(prev + Math.random() * 0.18 + 0.04, 72);
        }

        const target = minVisibleRef.current ? 100 : 92;
        const jump = prev < 78 ? Math.random() * 3.4 + 2.1 : Math.random() * 2.1 + 1.1;
        return Math.min(prev + jump, target);
      });
    }, 110);

    return () => globalThis.clearInterval(timer);
  }, [hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    const pulseTimer = globalThis.setInterval(() => {
      setPulseIndex((prev) => (prev + 1) % 6);
    }, 420);
    return () => globalThis.clearInterval(pulseTimer);
  }, [hydrated]);

  useEffect(() => {
    if (!hydrated || finishStartedRef.current) return;
    if (!(minVisibleRef.current && ((ready && progress >= 99) || skipped))) return;

    finishStartedRef.current = true;
    setProgress(100);
    setFading(true);

    exitTimeoutRef.current = globalThis.setTimeout(() => {
      setVisible(false);
      document.body.style.overflow = "";
    }, 1250);
  }, [hydrated, ready, progress, skipped]);

  useEffect(() => {
    if (!hydrated || !visible) {
      document.body.style.overflow = "";
      return;
    }

    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [hydrated, visible]);

  useEffect(() => {
    return () => {
      if (exitTimeoutRef.current) globalThis.clearTimeout(exitTimeoutRef.current);
      document.body.style.overflow = "";
    };
  }, []);

  const locale: Locale = useMemo(() => {
    if (typeof window === "undefined") return "en";
    return window.localStorage.getItem("nos-dashboard-locale") === "zh" ? "zh" : "en";
  }, []);

  if (!hydrated || !visible) return null;

  const progressPct = Math.floor(progress);
  const isLight = theme === "light";
  const phase: Phase = progress < 28 ? "boot" : progress < 68 ? "link" : progress < 100 ? "handoff" : "done";
  const currentLineIndex = Math.min(Math.floor((progress / 100) * copy[locale].sequence.length), copy[locale].sequence.length - 1);
  const stageIndex = phase === "boot" ? 0 : phase === "link" ? 1 : phase === "handoff" ? 2 : 3;
  const stageLabel = copy[locale].stage[stageIndex];

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden font-mono transition-all duration-[1250ms] ease-[cubic-bezier(0.83,0,0.17,1)] ${
        !overlayArmed
          ? "opacity-0"
          : fading
            ? "pointer-events-none opacity-0 scale-[1.06]"
            : entered
              ? "opacity-100 scale-100"
              : "opacity-0 scale-[0.96]"
      }`}
      style={{
        background: isLight
          ? "radial-gradient(circle at 50% 42%, rgba(123,110,240,0.18), transparent 30%), linear-gradient(180deg, #fafafe 0%, #ececf5 100%)"
          : "radial-gradient(circle at 50% 36%, rgba(109,93,252,0.16), transparent 22%), #020204",
        color: "var(--heading)",
      }}
    >
      <div className="pointer-events-none absolute inset-0">
        <div className={`absolute inset-0 transition-all duration-[1200ms] ${fading ? "opacity-100 scale-110" : "opacity-70 scale-100"}`} style={{ background: "radial-gradient(circle at 50% 50%, rgba(109,93,252,0.10), transparent 35%)" }} />
        <div className="absolute left-1/2 top-1/2 h-[760px] w-[760px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--accent)] opacity-[0.04] blur-[180px]" />
        <div className="absolute left-[38%] top-[38%] h-[440px] w-[440px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--cyan)] opacity-[0.025] blur-[120px]" />
        <div className="absolute left-[60%] top-[62%] h-[360px] w-[360px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--accent-bright)] opacity-[0.03] blur-[100px] animate-float-slower" />
      </div>

      <div className="absolute inset-0 grid-texture opacity-[0.035] pointer-events-none" />
      <div className="scanline absolute inset-0 opacity-[0.2] pointer-events-none" />

      <div className={`pointer-events-none absolute inset-x-0 top-0 h-[30vh] transition-all duration-[1200ms] ${fading ? "translate-y-[-16%] opacity-0" : "translate-y-0 opacity-100"}`} style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.08), transparent)" }} />
      <div className={`pointer-events-none absolute inset-x-0 bottom-0 h-[26vh] transition-all duration-[1200ms] ${fading ? "translate-y-[22%] opacity-0" : "translate-y-0 opacity-100"}`} style={{ background: "linear-gradient(0deg, rgba(255,255,255,0.06), transparent)" }} />

      <div
        className="pointer-events-none absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--accent-bright)] to-transparent opacity-[0.22]"
        style={{
          top: `${18 + (progress / 100) * 58}%`,
          transition: "top 0.55s ease-out",
          boxShadow: "0 0 18px rgba(148,136,255,0.35)",
        }}
      />

      <div className="relative z-10 flex w-full max-w-6xl flex-col items-center px-4 sm:px-6">
        <div className={`mb-6 flex w-full flex-col gap-3 transition-all duration-[1200ms] delay-200 sm:mb-8 sm:flex-row sm:items-center sm:justify-between ${entered ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"}`}>
          <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
            <span className="text-[11px] sm:text-[13px] font-bold tracking-[0.42em] uppercase" style={{ color: "var(--muted)" }}>
              TYSJ
            </span>
            <div className="h-px w-6 sm:w-10" style={{ background: isLight ? "rgba(10,10,20,0.1)" : "rgba(255,255,255,0.06)" }} />
            <span className="truncate text-[9px] sm:text-[11px] tracking-[0.14em] sm:tracking-[0.18em] uppercase" style={{ color: "var(--muted)" }}>
              {copy[locale].version}
            </span>
          </div>
          <div className="flex flex-col gap-1 self-start text-left sm:items-end sm:self-auto sm:text-right">
            <span className="text-[9px] sm:text-[11px] tracking-[0.15em] uppercase" style={{ color: "var(--muted)" }}>{copy[locale].fabric}</span>
            <span className="text-[9px] sm:text-[11px] tracking-[0.15em] uppercase" style={{ color: "var(--muted)" }}>{copy[locale].core}</span>
          </div>
        </div>

        <div className="grid w-full items-center gap-6 sm:gap-8 lg:gap-10 lg:grid-cols-[1.08fr_0.92fr]">
          <div className={`order-2 lg:order-1 transition-all duration-[1200ms] delay-500 ${entered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <div className="max-w-2xl">
              <div className="mb-4 inline-flex max-w-full items-center gap-2.5 rounded-full border px-3 py-2 sm:gap-3 sm:px-4" style={{ borderColor: "rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)" }}>
                <span className="h-2 w-2 rounded-full bg-[var(--cyan)]" style={{ boxShadow: "0 0 14px rgba(34,211,238,0.5)" }} />
                <span className="truncate text-[10px] sm:text-[13px] tracking-[0.18em] sm:tracking-[0.28em] uppercase" style={{ color: "var(--accent-bright)" }}>
                  {copy[locale].mode}
                </span>
              </div>

              <h2 className="text-[clamp(2rem,10vw,5.5rem)] font-extralight leading-[0.96] tracking-[-0.05em] sm:tracking-[-0.06em]" style={{ color: "var(--heading)" }}>
                {copy[locale].title}
              </h2>

              <div className="mt-4 flex flex-col items-start gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
                <span className="rounded-full border px-3 py-1 font-mono text-[10px] sm:text-[12px] tracking-[0.18em] sm:tracking-[0.22em] uppercase" style={{ borderColor: "rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.025)", color: "var(--cyan)" }}>
                  {stageLabel}
                </span>
                <span className="text-[10px] sm:text-[12px] tracking-[0.12em] sm:tracking-[0.18em] uppercase" style={{ color: "var(--muted)" }}>
                  {copy[locale].protocol}
                </span>
              </div>

              <div className="mt-6 space-y-2.5 sm:mt-8 sm:space-y-3">
                {copy[locale].sequence.map((line, index) => {
                  const active = currentLineIndex >= index;
                  const pulsing = pulseIndex === index;
                  return (
                    <div
                      key={line}
                      className="flex items-start gap-3 rounded-2xl border px-3 py-3 sm:items-center sm:px-4 transition-all duration-500"
                      style={{
                        borderColor: active ? "rgba(148,136,255,0.18)" : "var(--border)",
                        background: active ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.018)",
                        transform: active ? "translateX(0)" : "translateX(-8px)",
                        opacity: active ? 1 : 0.52,
                        boxShadow: pulsing ? "0 0 24px rgba(109,93,252,0.14)" : "none",
                      }}
                    >
                      <span
                        className="h-2 w-2 rounded-full transition-all duration-300"
                        style={{
                          background: active ? "var(--cyan)" : isLight ? "rgba(10,10,20,0.12)" : "rgba(255,255,255,0.10)",
                          boxShadow: active ? "0 0 12px rgba(34,211,238,0.45)" : "none",
                          transform: pulsing ? "scale(1.35)" : "scale(1)",
                        }}
                      />
                      <span className="text-[12px] leading-5 sm:text-[14px] sm:tracking-[0.18em] uppercase" style={{ color: active ? "var(--heading)" : "var(--muted)" }}>
                        {line}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className={`order-1 lg:order-2 flex items-center justify-center transition-all duration-[1300ms] delay-700 ${entered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
            <div className="relative flex h-[240px] w-[240px] items-center justify-center xs:h-[280px] xs:w-[280px] sm:h-[420px] sm:w-[420px]">
              <div className={`absolute inset-0 rounded-full border transition-all duration-700 ${phase === "handoff" || phase === "done" ? "scale-[1.06] opacity-100" : "scale-100 opacity-70"}`} style={{ borderColor: "rgba(148,136,255,0.14)", boxShadow: "0 0 40px rgba(109,93,252,0.12) inset" }} />
              <div className={`absolute inset-[10%] rounded-full border transition-all duration-700 ${phase === "link" || phase === "handoff" || phase === "done" ? "scale-100 opacity-100" : "scale-[0.94] opacity-50"}`} style={{ borderColor: "rgba(34,211,238,0.14)" }} />

              <svg className="absolute inset-0 h-full w-full" viewBox="0 0 420 420" fill="none">
                {[0, 1, 2, 3, 4, 5].map((index) => {
                  const angle = index * 60 - 90;
                  const x = 210 + Math.cos((angle * Math.PI) / 180) * 134;
                  const y = 210 + Math.sin((angle * Math.PI) / 180) * 134;
                  const active = progress > 16 + index * 10;
                  const pulse = pulseIndex === index;
                  return (
                    <g key={index}>
                      <line
                        x1="210"
                        y1="210"
                        x2={x}
                        y2={y}
                        stroke={isLight ? "rgba(90,75,224,0.18)" : "rgba(148,136,255,0.18)"}
                        strokeWidth="1.2"
                        strokeDasharray="8 10"
                        style={{
                          opacity: active ? 1 : 0.14,
                          filter: active ? "drop-shadow(0 0 8px rgba(148,136,255,0.25))" : "none",
                          transition: "opacity 420ms ease",
                        }}
                      />
                      <circle
                        cx={x}
                        cy={y}
                        r={pulse ? 8.5 : 6}
                        fill={active ? "var(--cyan)" : isLight ? "rgba(10,10,20,0.09)" : "rgba(255,255,255,0.08)"}
                        style={{
                          filter: active ? "drop-shadow(0 0 12px rgba(34,211,238,0.5))" : "none",
                          transition: "r 300ms ease, fill 300ms ease",
                        }}
                      />
                    </g>
                  );
                })}
              </svg>

              <svg className="relative h-[180px] w-[180px] xs:h-[210px] xs:w-[210px] sm:h-[280px] sm:w-[280px] -rotate-90" viewBox="0 0 160 160">
                <circle cx="80" cy="80" r="74" fill="none" stroke={isLight ? "rgba(10,10,20,0.08)" : "rgba(255,255,255,0.02)"} strokeWidth="0.6" strokeDasharray="2 6" />
                <circle cx="80" cy="80" r="68" fill="none" stroke={isLight ? "rgba(10,10,20,0.12)" : "rgba(255,255,255,0.04)"} strokeWidth="1.2" />
                <circle
                  cx="80"
                  cy="80"
                  r="68"
                  fill="none"
                  stroke="var(--accent)"
                  strokeWidth="2"
                  strokeDasharray={`${(progress / 100) * 427.26} 427.26`}
                  strokeLinecap="round"
                  className="transition-[stroke-dasharray] duration-500 ease-out"
                  style={{ filter: isLight ? "drop-shadow(0 0 14px rgba(90,75,224,0.24))" : "drop-shadow(0 0 12px rgba(109,93,252,0.28))" }}
                />
                <circle cx="80" cy="80" r="56" fill="none" stroke={isLight ? "rgba(10,10,20,0.08)" : "rgba(255,255,255,0.03)"} strokeWidth="0.8" />
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[clamp(2rem,12vw,4.6rem)] font-extralight leading-none tracking-[-0.05em] tabular-nums" style={{ color: "var(--heading)" }}>
                  {progressPct.toString().padStart(2, "0")}
                </span>
                <span className="mt-2 text-[10px] sm:text-[12px] tracking-[0.18em] sm:tracking-[0.28em] uppercase" style={{ color: "var(--muted)" }}>
                  {copy[locale].percent}
                </span>
              </div>

              <div className={`absolute inset-0 rounded-full transition-all duration-[1000ms] ${fading ? "scale-[1.18] opacity-100" : "scale-100 opacity-0"}`} style={{ boxShadow: "0 0 160px rgba(255,255,255,0.10) inset, 0 0 160px rgba(109,93,252,0.10)" }} />
            </div>
          </div>
        </div>

        <div className={`mt-8 flex w-full flex-col items-start gap-4 transition-all duration-[1200ms] delay-[1000ms] sm:mt-10 sm:flex-row sm:items-center sm:justify-between sm:gap-6 ${entered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
          <span className="text-[9px] sm:text-[11px] tracking-[0.12em] sm:tracking-[0.16em] uppercase" style={{ color: "var(--muted)" }}>
            {copy[locale].footer}
          </span>

          <button
            onClick={() => setSkipped(true)}
            className="group flex w-full items-center justify-center gap-3 border px-4 py-2 transition-all duration-300 sm:w-auto sm:px-5 sm:py-2.5"
            style={{
              borderColor: "var(--border)",
              background: "var(--glass)",
              color: "var(--body)",
            }}
          >
            <span className="text-[11px] sm:text-[13px] tracking-[0.2em] uppercase transition-colors group-hover:text-[var(--accent-bright)]">
              {copy[locale].skip}
            </span>
            <span className="text-[11px] sm:text-[13px] transition-colors group-hover:text-[var(--accent-bright)]">→</span>
          </button>
        </div>
      </div>
    </div>
  );
}
