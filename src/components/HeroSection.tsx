"use client";

import type { Locale } from "@/content/datacenters";
import { siteContent } from "@/content/site";
import { t } from "@/lib/i18n";
import { useInView } from "@/lib/useInView";

export function HeroSection({
  locale,
  hashrate,
  activeHub,
  blockHeight,
  uptime,
}: {
  locale: Locale;
  hashrate: string;
  activeHub: string;
  blockHeight: number;
  uptime: string;
}) {
  const { ref, inView } = useInView();
  const systemActiveLabel = locale === "zh" ? "系统已激活" : "SYSTEM_ACTIVE";
  const uptimeLabel = locale === "zh" ? "可用率" : "UPTIME";
  const activeNodeLabel = locale === "zh" ? "当前节点" : "ACTIVE_HUB";
  const blockHeightLabel = locale === "zh" ? "区块高度" : "BLOCK_HEIGHT";
  const sectorLabel = locale === "zh" ? "基础设施主域" : "INFRASTRUCTURE PRIMELINE";
  const motionLabel = locale === "zh" ? "动态矩阵已同步" : "MOTION MATRIX SYNCED";
  const heroStats = [
    { label: locale === "zh" ? "算力" : "HASHRATE", value: hashrate },
    { label: activeNodeLabel, value: activeHub },
    { label: blockHeightLabel, value: blockHeight.toLocaleString() },
    { label: uptimeLabel, value: uptime },
  ];

  return (
    <section
      ref={ref as React.RefObject<HTMLElement>}
      style={{ transitionDelay: "0.15s" }}
      className={`relative mx-auto max-w-7xl px-4 pb-16 pt-12 sm:px-6 sm:pb-24 sm:pt-20 lg:px-10 lg:pb-32 lg:pt-32 scroll-reveal ${inView ? "in-view" : ""}`}
    >
      <div className="pointer-events-none absolute inset-0 grid-texture opacity-20" />
      <div className="pointer-events-none absolute inset-x-[10%] top-10 h-px bg-gradient-to-r from-transparent via-[var(--border-hover)] to-transparent opacity-70" />

      <div className="hero-aurora hero-aurora-a" />
      <div className="hero-aurora hero-aurora-b" />

      <div className="pointer-events-none absolute right-0 top-0 -z-10 h-full w-2/3 opacity-[0.07]">
        <svg viewBox="0 0 400 600" className="h-full w-full">
          <defs>
            <linearGradient id="heroGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.26" />
              <stop offset="55%" stopColor="var(--cyan)" stopOpacity="0.12" />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>
          </defs>
          <path d="M 0 100 Q 200 50 400 100 L 400 500 Q 200 550 0 500 Z" fill="none" stroke="url(#heroGrad)" strokeWidth="0.5" />
          <line x1="0" y1="200" x2="400" y2="200" stroke="var(--border)" strokeWidth="0.5" />
          <line x1="0" y1="400" x2="400" y2="400" stroke="var(--border)" strokeWidth="0.5" />
        </svg>
      </div>

      <div className="relative">
        <div className="stagger-child mb-8 flex flex-wrap items-center gap-4 sm:mb-12 sm:gap-6">
          <div className="flex items-center gap-2 rounded-full border px-3 py-1" style={{ borderColor: "var(--border)", background: "var(--glass)" }}>
            <span className="live-dot" />
            <span className="font-mono text-[12px] font-bold uppercase tracking-wider" style={{ color: "var(--heading)" }}>
              {systemActiveLabel}
            </span>
          </div>
          <div className="hidden h-px flex-1 sm:block" style={{ background: "var(--border)" }} />
          <div className="rounded-full border px-3 py-1 font-mono text-[12px] tracking-[0.24em]" style={{ borderColor: "rgba(255,255,255,0.08)", color: "var(--accent-bright)", background: "rgba(255,255,255,0.03)" }}>
            {motionLabel}
          </div>
          <div className="font-mono text-[12px] tracking-widest" style={{ color: "var(--muted)" }}>
            0x8a7f...d92c
          </div>
        </div>

        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.75fr)] lg:items-end">
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

            <div className="stagger-child mt-8 flex flex-wrap items-center gap-3 sm:mt-10">
              <span className="rounded-full border px-3 py-1 font-mono text-[12px] tracking-[0.24em]" style={{ borderColor: "rgba(255,255,255,0.08)", color: "var(--accent-bright)", background: "rgba(255,255,255,0.03)" }}>
                {sectorLabel}
              </span>
              <span className="rounded-full border px-3 py-1 font-mono text-[12px] tracking-[0.24em]" style={{ borderColor: "rgba(255,255,255,0.08)", color: "var(--cyan)", background: "rgba(255,255,255,0.025)" }}>
                {locale === "zh" ? "链上遥测 + 指挥中心 + 全球节点" : "CHAIN TELEMETRY + COMMAND CENTER + GLOBAL NODES"}
              </span>
            </div>

            <div className="mt-10 flex flex-col items-start gap-8 sm:mt-14 sm:gap-12">
              <div className="max-w-lg space-y-6">
                <p className="stagger-child text-[18px] leading-[1.7]" style={{ color: "var(--body)" }}>
                  {t(siteContent.hero.description, locale)}
                </p>
                <div className="stagger-child flex flex-wrap gap-4">
                  <a
                    className="group relative flex h-12 items-center justify-center overflow-hidden border px-8 text-[16px] font-bold tracking-widest text-white transition-all hover:bg-[var(--accent)]"
                    style={{ borderColor: "var(--accent)" }}
                    href={siteContent.hero.primaryCta.href}
                    target="_blank"
                  >
                    <span className="absolute inset-0 hero-button-sheen opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                    <span className="relative z-10">{t(siteContent.hero.primaryCta.label, locale).toUpperCase()}</span>
                  </a>
                  <a
                    className="group flex h-12 items-center justify-center border bg-transparent px-8 text-[16px] font-bold tracking-widest transition-all hover:border-[var(--heading)]"
                    style={{ borderColor: "var(--border)", color: "var(--heading)" }}
                    href={siteContent.hero.secondaryCta.href}
                    target="_blank"
                  >
                    {t(siteContent.hero.secondaryCta.label, locale).toUpperCase()}
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="stagger-child relative overflow-hidden rounded-[28px] border p-5 sm:p-6 hero-signal-panel" style={{ borderColor: "rgba(255,255,255,0.08)", background: "linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.015))" }}>
            <div className="pointer-events-none absolute inset-0 opacity-90" style={{ background: "radial-gradient(circle at 18% 18%, rgba(109,93,252,0.2), transparent 28%), radial-gradient(circle at 82% 14%, rgba(34,211,238,0.14), transparent 24%), linear-gradient(180deg, rgba(255,255,255,0.04), transparent 36%)" }} />
            <div className="relative z-10">
              <div className="flex items-center justify-between gap-4">
                <p className="font-mono text-[13px] tracking-[0.28em]" style={{ color: "var(--accent-bright)" }}>
                  {locale === "zh" ? "[ 首页信号面板 ]" : "[ HERO_SIGNAL_PANEL ]"}
                </p>
                <span className="rounded-full border px-2.5 py-1 font-mono text-[11px] tracking-[0.24em]" style={{ borderColor: "rgba(255,255,255,0.08)", color: "var(--cyan)" }}>
                  LIVE FEED
                </span>
              </div>

              <div className="mt-5 space-y-4">
                <div className="hero-signal-card rounded-2xl border p-4" style={{ borderColor: "rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)" }}>
                  <p className="font-mono text-[11px] tracking-[0.2em]" style={{ color: "var(--muted)" }}>
                    {locale === "zh" ? "主干节点" : "BACKBONE HUB"}
                  </p>
                  <p className="mt-2 text-lg font-light" style={{ color: "var(--heading)" }}>
                    {activeHub}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {heroStats.map((m) => (
                    <div key={m.label} className="hero-signal-card rounded-2xl border p-4 sm:p-5" style={{ borderColor: "rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)" }}>
                      <p className="font-mono text-[10px] sm:text-[11px] tracking-[0.2em]" style={{ color: "var(--muted)" }}>
                        {m.label}
                      </p>
                      <p className="mt-2 font-mono text-[16px] sm:text-[22px]" style={{ color: "var(--heading)" }}>
                        {m.value}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="rounded-2xl border px-4 py-3 font-mono text-[12px] tracking-[0.18em] overflow-hidden" style={{ borderColor: "rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.025)", color: "var(--muted)" }}>
                  <div className="hero-ticker-track">
                    <div className="hero-ticker-item">&gt; NOS CONTROL PLANE READY</div>
                    <div className="hero-ticker-item">&gt; GLOBAL ROUTE FABRIC STABLE</div>
                    <div className="hero-ticker-item">&gt; CHAIN TELEMETRY SYNCED</div>
                    <div className="hero-ticker-item">&gt; NOS CONTROL PLANE READY</div>
                    <div className="hero-ticker-item">&gt; GLOBAL ROUTE FABRIC STABLE</div>
                    <div className="hero-ticker-item">&gt; CHAIN TELEMETRY SYNCED</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-24 sm:mt-28 hero-bottom-strip">
        <div className="grid gap-px sm:grid-cols-3" style={{ background: "var(--border)" }}>
          {[
            {
              label: locale === "zh" ? "链路姿态" : "ROUTE_POSTURE",
              value: locale === "zh" ? "全球链路已加速" : "GLOBAL FABRIC ACCELERATED",
            },
            {
              label: locale === "zh" ? "交互层" : "INTERACTION_LAYER",
              value: locale === "zh" ? "双主题 / 动态反馈 / 高密度遥测" : "DUAL THEME / MOTION FEEDBACK / DENSE TELEMETRY",
            },
            {
              label: locale === "zh" ? "接入策略" : "ACCESS_STRATEGY",
              value: locale === "zh" ? "链上监控与生态入口已联动" : "ON-CHAIN MONITORING AND ECOSYSTEM ROUTING LINKED",
            },
          ].map((item) => (
            <div key={item.label} className="px-4 py-4 sm:px-5" style={{ background: "var(--background-elevated)" }}>
              <p className="font-mono text-[10px] tracking-[0.22em]" style={{ color: "var(--muted)" }}>
                {item.label}
              </p>
              <p className="mt-2 text-[16px] leading-6" style={{ color: "var(--body)" }}>
                {item.value}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-12 h-px w-full bg-gradient-to-r from-transparent via-[var(--border)] to-transparent" />
    </section>
  );
}
