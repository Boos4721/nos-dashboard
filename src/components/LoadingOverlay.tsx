"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "@/lib/ThemeContext";

interface LoadingOverlayProps {
  ready: boolean;
  /** Fail-safe: force-dismiss after this many ms even if ready is still false. */
  maxVisibleMs?: number;
}

const bootSequence = [
  "allocating neural memory banks",
  "mounting distributed filesystem",
  "loading kernel v5.10.0-nos-ai",
  "mapping global hashrate topology",
  "establishing encrypted tunnel",
  "synchronizing block headers",
  "calibrating inference vectors",
  "initializing telemetry pipeline",
  "warming edge cache layer",
  "sequence complete",
];

export function LoadingOverlay({ ready, maxVisibleMs = 5000 }: LoadingOverlayProps) {
  const { theme } = useTheme();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const [fading, setFading] = useState(false);
  const [skipped, setSkipped] = useState(false);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [entered, setEntered] = useState(false);
  const [phase, setPhase] = useState<"init" | "pulse" | "converge" | "done">("init");
  const [hydrated, setHydrated] = useState(false);

  const readyRef = useRef(ready);
  const exitTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const finishStartedRef = useRef(false);

  useEffect(() => {
    readyRef.current = ready;
  }, [ready]);

  useEffect(() => {
    setHydrated(true);
    setVisible(true);
    const enterFrame = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(enterFrame);
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

        const jump = readyRef.current ? Math.random() * 6 + 2 : Math.random() * 0.2 + 0.05;
        return Math.min(prev + jump, 99.5);
      });
    }, 60);

    return () => globalThis.clearInterval(timer);
  }, [hydrated]);

  useEffect(() => {
    const mappedIndex = Math.floor((progress / 100) * bootSequence.length);
    setCurrentLineIndex(Math.min(mappedIndex, bootSequence.length - 1));
  }, [progress]);

  useEffect(() => {
    if (progress < 15) setPhase("init");
    else if (progress < 60) setPhase("pulse");
    else if (progress < 99) setPhase("converge");
    else setPhase("done");
  }, [progress]);

  useEffect(() => {
    if (!hydrated || finishStartedRef.current) return;
    if (!((ready && progress >= 99) || skipped)) return;

    finishStartedRef.current = true;
    setProgress(100);
    setFading(true);

    exitTimeoutRef.current = globalThis.setTimeout(() => {
      setVisible(false);
      document.body.style.overflow = "";
    }, 900);
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

  if (!hydrated || !visible) return null;

  const progressPct = Math.floor(progress);
  const isLight = theme === "light";

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center font-mono transition-all duration-[900ms] ease-[cubic-bezier(0.83,0,0.17,1)] ${
        fading
          ? "pointer-events-none opacity-0 scale-[1.04]"
          : entered
            ? "opacity-100 scale-100"
            : "opacity-0 scale-[0.96]"
      }`}
      style={{
        background: isLight
          ? "radial-gradient(circle at 50% 40%, rgba(123,110,240,0.16), transparent 35%), linear-gradient(180deg, #f7f7fb 0%, #ececf5 100%)"
          : "#020204",
        color: "var(--heading)",
      }}
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/2 h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--accent)] opacity-[0.03] blur-[160px]" />
        <div className="absolute left-[40%] top-[40%] h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--cyan)] opacity-[0.015] blur-[100px]" />
        <div className="absolute left-[60%] top-[60%] h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--accent-bright)] opacity-[0.02] blur-[80px] animate-float-slower" />
      </div>

      <div className="absolute inset-0 grid-texture opacity-[0.03] pointer-events-none" />

      <div
        className="pointer-events-none absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--accent)] to-transparent opacity-[0.14]"
        style={{
          top: `${30 + (progress / 100) * 40}%`,
          transition: "top 0.5s ease-out",
        }}
      />

      <div className="relative z-10 flex flex-col items-center gap-8 sm:gap-10">
        <div className={`transition-all duration-[1200ms] delay-500 ${entered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
          <span className="text-[10px] sm:text-[11px] font-bold tracking-[0.4em] uppercase" style={{ color: "var(--muted)" }}>NOS_OS</span>
        </div>

        <div className={`relative flex items-center justify-center transition-all duration-[1200ms] delay-700 ${entered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <svg className="h-[120px] w-[120px] sm:h-[160px] sm:w-[160px] -rotate-90" viewBox="0 0 160 160">
            <circle cx="80" cy="80" r="74" fill="none" stroke={isLight ? "rgba(10,10,20,0.08)" : "rgba(255,255,255,0.015)"} strokeWidth="0.5" strokeDasharray="2 6" />
            <circle cx="80" cy="80" r="68" fill="none" stroke={isLight ? "rgba(10,10,20,0.12)" : "rgba(255,255,255,0.03)"} strokeWidth="1" />
            <circle
              cx="80"
              cy="80"
              r="68"
              fill="none"
              stroke="var(--accent)"
              strokeWidth="1.5"
              strokeDasharray={`${(progress / 100) * 427.26} 427.26`}
              strokeLinecap="round"
              className="transition-[stroke-dasharray] duration-500 ease-out"
              style={{ filter: isLight ? "drop-shadow(0 0 10px rgba(90,75,224,0.22))" : "drop-shadow(0 0 8px rgba(109,93,252,0.25))" }}
            />
            <circle cx="80" cy="80" r="58" fill="none" stroke={isLight ? "rgba(10,10,20,0.08)" : "rgba(255,255,255,0.02)"} strokeWidth="0.5" />
            {[0, 90, 180, 270].map((deg) => (
              <line
                key={deg}
                x1="80"
                y1="8"
                x2="80"
                y2="14"
                stroke={isLight ? "rgba(10,10,20,0.2)" : "rgba(255,255,255,0.08)"}
                strokeWidth="0.5"
                transform={`rotate(${deg} 80 80)`}
              />
            ))}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[clamp(1.8rem,5vw,3.2rem)] font-extralight leading-none tracking-[-0.04em] tabular-nums" style={{ color: "var(--heading)" }}>
              {progressPct.toString().padStart(2, "0")}
            </span>
            <span className="mt-1.5 text-[8px] tracking-[0.3em] uppercase" style={{ color: "var(--muted)" }}>percent</span>
          </div>
        </div>

        <div className={`h-6 flex items-center justify-center overflow-hidden transition-all duration-700 delay-900 ${entered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
          <p className="text-[10px] sm:text-[11px] tracking-[0.15em] uppercase text-center px-4" style={{ color: "var(--body)" }}>
            {bootSequence[currentLineIndex]}
            <span className="ml-1 inline-block w-[5px] h-[9px] bg-[var(--accent-bright)] opacity-70 animate-pulse" />
          </p>
        </div>

        <div className={`w-40 sm:w-56 h-px overflow-hidden transition-all duration-700 delay-[1100ms] ${entered ? "opacity-100" : "opacity-0"}`} style={{ background: isLight ? "rgba(10,10,20,0.08)" : "rgba(255,255,255,0.03)" }}>
          <div
            className="h-full bg-gradient-to-r from-[var(--accent)] via-[var(--accent-bright)] to-[var(--cyan)] transition-[width] duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className={`flex items-center gap-2 transition-all duration-700 delay-[1200ms] ${entered ? "opacity-100" : "opacity-0"}`}>
          {(["init", "pulse", "converge", "done"] as const).map((p) => (
            <div
              key={p}
              className={`h-1 w-1 rounded-full transition-all duration-500 ${
                phase === p || (p === "done" && phase === "done")
                  ? "bg-[var(--accent-bright)] scale-125"
                  : ""
              }`}
              style={{ background: phase === p || (p === "done" && phase === "done") ? undefined : isLight ? "rgba(10,10,20,0.12)" : "rgba(255,255,255,0.10)" }}
            />
          ))}
        </div>
      </div>

      <div className={`absolute top-5 left-5 sm:top-8 sm:left-8 lg:top-10 lg:left-10 transition-all duration-[1200ms] delay-400 ${entered ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-3"}`}>
        <div className="flex items-center gap-3">
          <span className="text-[8px] sm:text-[9px] tracking-[0.2em] uppercase" style={{ color: "var(--muted)" }}>v0.1 / neural-boot</span>
          <div className="h-px w-8" style={{ background: isLight ? "rgba(10,10,20,0.10)" : "rgba(255,255,255,0.06)" }} />
        </div>
      </div>

      <div className={`absolute top-5 right-5 sm:top-8 sm:right-8 lg:top-10 lg:right-10 transition-all duration-[1200ms] delay-600 ${entered ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-3"}`}>
        <div className="flex flex-col items-end gap-1">
          <span className="text-[7px] sm:text-[8px] tracking-[0.15em] uppercase font-mono" style={{ color: "var(--muted)" }}>MEM: 847MB</span>
          <span className="text-[7px] sm:text-[8px] tracking-[0.15em] uppercase font-mono" style={{ color: "var(--muted)" }}>PID: 0x4F53</span>
        </div>
      </div>

      <div className={`absolute bottom-5 right-5 sm:bottom-8 sm:right-8 lg:bottom-10 lg:right-10 transition-all duration-[1200ms] delay-[1300ms] ${entered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}`}>
        <button
          onClick={() => setSkipped(true)}
          className="group flex items-center gap-3 px-4 py-2 sm:px-5 sm:py-2.5 border transition-all duration-300"
          style={{
            borderColor: "var(--border)",
            background: "var(--glass)",
            color: "var(--body)",
          }}
        >
          <span className="text-[9px] sm:text-[10px] tracking-[0.2em] uppercase transition-colors group-hover:text-[var(--accent-bright)]">
            skip
          </span>
          <span className="text-[9px] sm:text-[10px] transition-colors group-hover:text-[var(--accent-bright)]">→</span>
        </button>
      </div>

      <div className={`absolute bottom-5 left-5 sm:bottom-8 sm:left-8 lg:bottom-10 lg:left-10 transition-all duration-[1200ms] delay-[1000ms] ${entered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}`}>
        <span className="text-[7px] sm:text-[8px] tracking-[0.15em] uppercase font-mono" style={{ color: "var(--muted)" }}>NOS NETWORK // BOOT SEQUENCE</span>
      </div>
    </div>
  );
}
