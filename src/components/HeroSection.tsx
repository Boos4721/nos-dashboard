"use client";

import type { Locale } from "@/content/datacenters";
import { siteContent } from "@/content/site";
import { t } from "@/lib/i18n";
import { useTelemetryDemoState } from "@/lib/useTelemetryDemoState";
import { useInView } from "@/lib/useInView";

export function HeroSection({ locale }: { locale: Locale }) {
  const { ref, inView } = useInView();
  const telemetryDemo = useTelemetryDemoState();
  const systemActiveLabel = locale === "zh" ? "系统已激活" : "SYSTEM_ACTIVE";
  const uptimeLabel = locale === "zh" ? "可用率" : "UPTIME";
  const heroStats = [
    { label: locale === "zh" ? "算力" : "HASHRATE", value: telemetryDemo.hashrate },
    { label: locale === "zh" ? "节点数" : "NODES", value: String(telemetryDemo.totalNodes) },
    { label: locale === "zh" ? "区域" : "REGIONS", value: String(telemetryDemo.activeRegions) },
    { label: uptimeLabel, value: telemetryDemo.uptime },
  ];
  return (
    <section ref={ref as React.RefObject<HTMLElement>} style={{ transitionDelay: "0.15s" }} className={`relative mx-auto max-w-7xl px-4 pb-16 pt-12 sm:px-6 sm:pb-24 sm:pt-20 lg:px-10 lg:pb-32 lg:pt-32 scroll-reveal ${inView ? "in-view" : ""}`}>
      {/* Grid texture behind hero */}
      <div className="pointer-events-none absolute inset-0 grid-texture opacity-20" />

      {/* Background decorative SVG elements */}
      <div className="pointer-events-none absolute right-0 top-0 -z-10 h-full w-2/3 opacity-[0.05]">
        <svg viewBox="0 0 400 600" className="h-full w-full">
          <defs>
            <linearGradient id="heroGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.2" />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>
          </defs>
          <path d="M 0 100 Q 200 50 400 100 L 400 500 Q 200 550 0 500 Z" fill="none" stroke="url(#heroGrad)" strokeWidth="0.5" />
          <line x1="0" y1="200" x2="400" y2="200" stroke="var(--border)" strokeWidth="0.5" />
          <line x1="0" y1="400" x2="400" y2="400" stroke="var(--border)" strokeWidth="0.5" />
        </svg>
      </div>

      <div className="relative">
        {/* Top telemetry row */}
        <div className="stagger-child mb-12 flex items-center gap-6">
          <div className="flex items-center gap-2 rounded-full border px-3 py-1" style={{ borderColor: "var(--border)", background: "var(--glass)" }}>
            <span className="live-dot" />
            <span className="font-mono text-[9px] font-bold uppercase tracking-wider" style={{ color: "var(--heading)" }}>{systemActiveLabel}</span>
          </div>
          <div className="h-px flex-1" style={{ background: "var(--border)" }} />
          <div className="font-mono text-[9px] tracking-widest" style={{ color: "var(--muted)" }}>0x8a7f...d92c</div>
        </div>

        {/* Main Title Composition */}
        <div className="max-w-4xl">
          <div className="text-mask">
            <h1 className="text-[clamp(2rem,8vw,5.5rem)] font-light leading-[0.95] tracking-[-0.06em]" style={{ color: "var(--heading)" }}>
              {locale === "en" ? "GLOBAL" : "全球"}
            </h1>
          </div>
          <div className="text-mask mt-1 sm:mt-2">
            <h1 className="text-[clamp(2rem,8vw,5.5rem)] font-light leading-[0.95] tracking-[-0.06em]" style={{ color: "var(--heading)" }}>
              {locale === "en" ? "INFRASTRUCTURE" : "基础设施"}
            </h1>
          </div>
          <div className="text-mask mt-1 sm:mt-2">
            <h1 className="text-[clamp(2rem,8vw,5.5rem)] font-light leading-[0.95] tracking-[-0.06em]" style={{ color: "var(--heading)" }}>
              {locale === "en" ? (
                <>
                  FOR <span className="glow-text" style={{ color: "var(--accent-bright)" }}>NOS</span>
                </>
              ) : (
                <>
                  <span className="glow-text" style={{ color: "var(--accent-bright)" }}>NOS</span> 运维中心
                </>
              )}
            </h1>
          </div>
        </div>

        {/* Description + Actions */}
        <div className="mt-10 sm:mt-16 flex flex-col items-start gap-8 sm:gap-12 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-lg space-y-6">
            <p className="stagger-child text-[15px] leading-[1.7]" style={{ color: "var(--body)" }}>
              {t(siteContent.hero.description, locale)}
            </p>
            <div className="stagger-child flex flex-wrap gap-4">
              <a
                className="group relative flex h-12 items-center justify-center overflow-hidden border px-8 text-[13px] font-bold tracking-widest text-white transition-all hover:bg-[var(--accent)]"
                style={{ borderColor: "var(--accent)" }}
                href={siteContent.hero.primaryCta.href}
                target="_blank"
              >
                {t(siteContent.hero.primaryCta.label, locale).toUpperCase()}
              </a>
              <a
                className="group flex h-12 items-center justify-center border bg-transparent px-8 text-[13px] font-bold tracking-widest transition-all hover:border-[var(--heading)]"
                style={{ borderColor: "var(--border)", color: "var(--heading)" }}
                href={siteContent.hero.secondaryCta.href}
                target="_blank"
              >
                {t(siteContent.hero.secondaryCta.label, locale).toUpperCase()}
              </a>
            </div>
          </div>

          {/* Micro telemetry grid */}
          <div className="stagger-child grid grid-cols-2 gap-px p-px w-full lg:w-auto" style={{ background: "var(--border)" }}>
            {heroStats.map((m) => (
              <div key={m.label} className="p-4 sm:p-5 min-w-0 lg:min-w-[140px]" style={{ background: "var(--background-elevated)" }}>
                <p className="font-mono text-[7px] sm:text-[8px] tracking-[0.2em]" style={{ color: "var(--muted)" }}>{m.label}</p>
                <p className="mt-1.5 sm:mt-2 font-mono text-base sm:text-[18px]" style={{ color: "var(--heading)" }}>{m.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom separator */}
      <div className="mt-32 h-px w-full bg-gradient-to-r from-transparent via-[var(--border)] to-transparent" />
    </section>
  );
}
