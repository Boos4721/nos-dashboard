"use client";

import type { Locale } from "@/content/datacenters";
import type { CommandCenterEvent, CommandCenterSignal } from "@/content/commandCenter";
import { t } from "@/lib/i18n";
import { useInView } from "@/lib/useInView";

function toneColor(tone: CommandCenterSignal["tone"]) {
  switch (tone) {
    case "accent":
      return "var(--accent-bright)";
    case "cyan":
      return "var(--cyan)";
    case "emerald":
      return "var(--emerald)";
    case "amber":
      return "var(--amber)";
    default:
      return "var(--heading)";
  }
}

function levelColor(level: CommandCenterEvent["level"]) {
  switch (level) {
    case "critical":
      return "var(--offline-dot)";
    case "warning":
      return "var(--amber)";
    case "info":
      return "var(--cyan)";
    default:
      return "var(--muted)";
  }
}

export function CommandCenterPanel({
  locale,
  signals,
  events,
}: {
  locale: Locale;
  signals: CommandCenterSignal[];
  events: CommandCenterEvent[];
}) {
  const { ref, inView } = useInView();
  const title = locale === "zh" ? "[ 指挥中枢态势 ]" : "[ COMMAND_CENTER_SURFACE ]";
  const eventLabel = locale === "zh" ? "事件流" : "EVENT_STREAM";
  const pulseLabel = locale === "zh" ? "实时脉冲" : "TACTICAL_PULSE";
  const layerLabel = locale === "zh" ? "全局协同" : "GLOBAL_ORCHESTRATION";

  return (
    <section
      ref={ref as React.RefObject<HTMLElement>}
      className={`mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-10 scroll-reveal ${inView ? "in-view" : ""}`}
    >
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="stagger-child flex items-center gap-3">
          <span className="live-dot" />
          <p className="font-mono text-[10px] font-bold tracking-[0.3em]" style={{ color: "var(--accent-bright)" }}>
            {title}
          </p>
        </div>
        <div className="stagger-child flex flex-wrap items-center gap-2">
          <span className="rounded-full border px-2.5 py-1 font-mono text-[8px] tracking-[0.24em]" style={{ borderColor: "rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", color: "var(--cyan)" }}>
            {pulseLabel}
          </span>
          <span className="rounded-full border px-2.5 py-1 font-mono text-[8px] tracking-[0.24em]" style={{ borderColor: "rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", color: "var(--accent-bright)" }}>
            {layerLabel}
          </span>
        </div>
      </div>

      <div className="grid gap-px lg:grid-cols-[1.02fr_0.98fr] command-center-shell" style={{ background: "var(--border)" }}>
        <div className="stagger-child relative overflow-hidden p-5 sm:p-6 lg:p-7" style={{ background: "var(--background-elevated)" }}>
          <div className="command-center-grid" />
          <div className="pointer-events-none absolute inset-0 opacity-75" style={{ background: "radial-gradient(circle at 18% 22%, rgba(109,93,252,0.12), transparent 26%), linear-gradient(180deg, rgba(255,255,255,0.02), transparent 38%)" }} />
          <div className="relative z-10">
            <div className="flex items-center justify-between gap-4">
              <p className="font-mono text-[10px] font-bold tracking-[0.28em]" style={{ color: "var(--muted)" }}>
                {locale === "zh" ? "信号汇总" : "SIGNAL_AGGREGATION"}
              </p>
              <span className="rounded-full border px-2.5 py-1 font-mono text-[8px] tracking-[0.22em] command-badge" style={{ borderColor: "rgba(255,255,255,0.08)", color: "var(--emerald)" }}>
                {locale === "zh" ? "实时运行" : "LIVE OPS"}
              </span>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {signals.map((signal) => (
                <div
                  key={signal.label.en}
                  className="command-card rounded-[22px] border p-4 sm:p-5"
                  style={{ borderColor: "rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)" }}
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-mono text-[8px] tracking-[0.22em]" style={{ color: "var(--muted)" }}>
                      {signal.label[locale]}
                    </p>
                    <span className="h-2 w-2 rounded-full command-dot" style={{ background: toneColor(signal.tone), boxShadow: `0 0 16px ${toneColor(signal.tone)}` }} />
                  </div>
                  <p className="mt-3 font-mono text-[22px] sm:text-[24px]" style={{ color: toneColor(signal.tone) }} suppressHydrationWarning>
                   {signal.value}
                 </p>
                </div>
              ))}
            </div>

            <div className="mt-4 grid gap-3 xl:grid-cols-[1.15fr_0.85fr]">
              <div className="rounded-[22px] border px-4 py-4 command-card" style={{ borderColor: "rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.025)" }}>
                <p className="font-mono text-[8px] tracking-[0.2em]" style={{ color: "var(--muted)" }}>
                  {locale === "zh" ? "协同矩阵" : "COORDINATION_MATRIX"}
                </p>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {["L1", "L2", "L3", "L4", "L5", "L6"].map((cell, index) => (
                    <div
                      key={cell}
                      className="rounded-xl border px-2 py-2 text-center font-mono text-[10px] command-matrix-cell"
                      style={{
                        borderColor: "rgba(255,255,255,0.06)",
                        color: index % 2 === 0 ? "var(--accent-bright)" : "var(--cyan)",
                        background: "rgba(255,255,255,0.02)",
                        animationDelay: `${index * 180}ms`,
                      }}
                    >
                      {cell}
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[22px] border px-4 py-4 command-card" style={{ borderColor: "rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.025)" }}>
                <p className="font-mono text-[8px] tracking-[0.2em]" style={{ color: "var(--muted)" }}>
                  {locale === "zh" ? "响应状态" : "RESPONSE_STATE"}
                </p>
                <div className="mt-3 space-y-2">
                  {[
                    locale === "zh" ? "节点拓扑持续同步" : "NODE TOPOLOGY IN SYNC",
                    locale === "zh" ? "路由脉冲持续回传" : "ROUTE PULSE RETURNING",
                    locale === "zh" ? "链上信号已完成汇流" : "CHAIN SIGNALS MERGED",
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-2 font-mono text-[10px]" style={{ color: "var(--body)" }}>
                      <span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--emerald)", boxShadow: "0 0 12px rgba(52,211,153,0.45)" }} />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="stagger-child relative overflow-hidden p-5 sm:p-6 lg:p-7" style={{ background: "var(--background-elevated)" }}>
          <div className="command-center-grid" />
          <div className="pointer-events-none absolute inset-0 opacity-65" style={{ background: "radial-gradient(circle at 82% 18%, rgba(34,211,238,0.12), transparent 24%), linear-gradient(180deg, rgba(255,255,255,0.015), transparent 32%)" }} />
          <div className="relative z-10">
            <div className="flex items-center justify-between gap-4">
              <p className="font-mono text-[10px] font-bold tracking-[0.28em]" style={{ color: "var(--muted)" }}>
                {eventLabel}
              </p>
              <span className="rounded-full border px-2.5 py-1 font-mono text-[8px] tracking-[0.22em] command-badge" style={{ borderColor: "rgba(255,255,255,0.08)", color: "var(--accent-bright)" }}>
                {locale === "zh" ? "实时运行" : "LIVE OPS"}
              </span>
            </div>

            <div className="mt-4 space-y-3">
              {events.map((event, index) => (
                <div
                  key={event.id}
                  className="command-card rounded-[22px] border p-4"
                  style={{ borderColor: "rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", animationDelay: `${index * 120}ms` }}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full command-dot" style={{ background: levelColor(event.level), boxShadow: `0 0 12px ${levelColor(event.level)}` }} />
                      <span className="font-mono text-[9px] tracking-[0.18em]" style={{ color: "var(--heading)" }}>
                        {event.code}
                      </span>
                    </div>
                    <span className="font-mono text-[8px]" style={{ color: "var(--muted)" }} suppressHydrationWarning>
                      {event.timestamp}
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-6" style={{ color: "var(--body)" }}>
                    {t(event.message, locale)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
