"use client";

import type { Locale } from "@/content/datacenters";
import type { ChainData } from "@/lib/useChainData";
import { useInView } from "@/lib/useInView";

function formatTimestamp(unixSeconds: number): string {
  if (!unixSeconds) return "—";
  const d = new Date(unixSeconds * 1000);
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

function shortAddr(addr: string | null | undefined): string {
  if (!addr || typeof addr !== "string") return "—";
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

function shortTxHash(hash: string | undefined): string {
  if (!hash || typeof hash !== "string") return "—";
  return `${hash.slice(0, 8)}…${hash.slice(-4)}`;
}

function formatValue(hexOrDec: string | undefined): string {
  if (!hexOrDec || hexOrDec === "0") return "0";
  try {
    const wei = BigInt(hexOrDec);
    if (wei === BigInt(0)) return "0";
    const eth = Number(wei) / 1e18;
    if (eth < 0.0001) return "<0.0001";
    return eth.toFixed(4);
  } catch {
    return "0";
  }
}

export function ChainTelemetry({
  locale,
  data,
  loading,
  error,
  simulated = false,
}: {
  locale: Locale;
  data: ChainData | null;
  loading: boolean;
  error: string | null;
  simulated?: boolean;
}) {
  const { ref, inView } = useInView();
  const offline = !loading && (!data || !!error);
  const statusLabel = loading ? (locale === "zh" ? "同步中" : "SYNCING") : data ? (locale === "zh" ? "链路已建立" : "LINK_ESTABLISHED") : locale === "zh" ? "链路断开" : "LINK_LOST";
  const waitingLabel = locale === "zh" ? "等待链上数据..." : "WAITING_FOR_DATA...";
  const noRecentTxLabel = locale === "zh" ? "暂无最近交易" : "NO_RECENT_TX";
  const recentSuffix = locale === "zh" ? "条最近记录" : "RECENT";
  const blockManifestLabel = locale === "zh" ? "区块清单" : "0x_BLOCK_MANIFEST";
  const txStreamLabel = locale === "zh" ? "交易流" : "0x_TX_STREAM";
  const sectionLabel = locale === "zh" ? "[ NOS 链上遥测 ]" : "[ NOS_RPC_TELEMETRY ]";
  const pagesFallbackLabel = locale === "zh" ? "当前为静态页面部署，链上接口未启用" : "Static deployment mode: chain API unavailable";
  const simulatedBadgeLabel = locale === "zh" ? "静态演示" : "SIMULATED_FEED";
  const simulatedHintLabel = locale === "zh" ? "当前为 GitHub Pages 静态演示数据，用于展示链路与界面状态。" : "GitHub Pages is showing a simulated telemetry snapshot for presentation only.";

  const stats = data
    ? [
        { label: "BLOCK_HEIGHT", value: data.blockNumber.toLocaleString() },
        { label: "GAS_PRICE", value: `${data.gasPriceGwei} GWEI` },
        { label: "NETWORK_ID", value: String(data.chainId) },
        { label: "TX_COUNT", value: String(data.txCount) },
      ]
    : [];

  return (
    <section
      id="network"
      ref={ref as React.RefObject<HTMLElement>}
      className={`mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-10 lg:py-24 scroll-reveal ${inView ? "in-view" : ""}`}
    >
      <div className="flex flex-col gap-8 sm:gap-12">
        {/* Label row */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.3em]" style={{ color: "var(--accent-bright)" }}>
            {sectionLabel}
          </p>
          {simulated && (
            <div
              className="inline-flex items-center gap-2 self-start rounded-full border px-3 py-1 font-mono text-[8px] uppercase tracking-[0.25em]"
              style={{
                borderColor: "color-mix(in srgb, var(--accent-bright) 32%, transparent)",
                background: "color-mix(in srgb, var(--accent-bright) 10%, transparent)",
                color: "var(--accent-bright)",
              }}
            >
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--accent-bright)", boxShadow: "0 0 12px var(--accent-glow)" }} />
              {simulatedBadgeLabel}
            </div>
          )}
          <div className="hidden sm:block h-px flex-1" style={{ background: "var(--border)" }} />
          <div className="flex items-center gap-2">
            <span className={data ? "live-dot" : "h-1.5 w-1.5 rounded-full bg-red-500"} />
            <span className="font-mono text-[9px]" style={{ color: "var(--muted)" }}>
              {statusLabel}
            </span>
          </div>
        </div>

        {simulated && (
          <div
            className="stagger-child rounded-2xl border px-4 py-3 text-sm sm:px-5"
            style={{
              borderColor: "color-mix(in srgb, var(--accent-bright) 22%, var(--border))",
              background: "linear-gradient(135deg, color-mix(in srgb, var(--background-elevated) 88%, transparent), color-mix(in srgb, var(--accent) 8%, transparent))",
              color: "var(--muted)",
            }}
          >
            {simulatedHintLabel}
          </div>
        )}

        {/* Dense Stat Grid */}
        <div className="stagger-child grid grid-cols-2 gap-px lg:grid-cols-4" style={{ background: "var(--border)" }}>
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="p-5 sm:p-8" style={{ background: "var(--background-elevated)" }}>
                <div className="h-2 w-16 animate-pulse" style={{ background: "var(--skeleton)" }} />
                <div className="mt-3 sm:mt-4 h-5 sm:h-6 w-24 sm:w-32 animate-pulse" style={{ background: "var(--skeleton)" }} />
              </div>
            ))
          ) : (
            stats.map((m) => (
              <div
                key={m.label}
                className="group p-5 sm:p-8 transition-colors"
                style={{ background: "var(--background-elevated)" }}
                onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.background = "var(--background-surface-hover)"}
                onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.background = "var(--background-elevated)"}
              >
                <p className="font-mono text-[8px] sm:text-[9px] tracking-widest" style={{ color: "var(--muted)" }}>{m.label}</p>
                <p className="mt-2 sm:mt-4 font-mono text-lg sm:text-2xl group-hover:text-[var(--accent-bright)] transition-colors" style={{ color: "var(--heading)" }}>
                  {offline ? "---" : m.value}
                </p>
              </div>
            ))
          )}
        </div>

        {/* Secondary Info Rows */}
        <div className="stagger-child grid gap-px lg:grid-cols-2" style={{ background: "var(--border)" }}>
          {/* Left: Raw Block Data */}
          <div className="p-5 sm:p-8" style={{ background: "var(--background-elevated)" }}>
            <p className="mb-4 sm:mb-6 font-mono text-[10px] font-bold" style={{ color: "var(--muted)" }}>{blockManifestLabel}</p>
            <div className="space-y-3 sm:space-y-4">
              {data ? (
                [
                  { k: "HASH", v: data.rawBlockHash },
                  { k: "MINER", v: data.rawMiner },
                  { k: "GAS_USED", v: `${data.gasUsed.toLocaleString()} / ${data.gasLimit.toLocaleString()}` },
                  { k: "STAMP", v: formatTimestamp(data.timestamp) },
                ].map((row) => (
                  <div key={row.k} className="flex flex-col sm:flex-row sm:justify-between border-b pb-2 gap-0.5 sm:gap-0" style={{ borderColor: "var(--border)" }}>
                    <span className="font-mono text-[8px] sm:text-[9px]" style={{ color: "var(--muted)" }}>{row.k}</span>
                    <span className="font-mono text-[10px] sm:text-[10px] break-all sm:break-normal" style={{ color: "var(--heading)" }}>{row.v}</span>
                  </div>
                ))
              ) : (
                <div className="h-32 flex items-center justify-center font-mono text-[10px] text-center px-4" style={{ color: "var(--muted-dim)" }}>{error === "GitHub Pages 模式下未启用链上接口" ? pagesFallbackLabel : waitingLabel}</div>
              )}
            </div>
          </div>

          {/* Right: TX Stream */}
          <div className="p-5 sm:p-8" style={{ background: "var(--background-elevated)" }}>
            <div className="mb-4 sm:mb-6 flex items-center justify-between">
              <p className="font-mono text-[10px] font-bold" style={{ color: "var(--muted)" }}>{txStreamLabel}</p>
              {data && data.transactions.length > 0 && (
                <span className="font-mono text-[8px] opacity-60" style={{ color: "var(--accent-bright)" }}>
                  {locale === "zh" ? `${data.transactions.length} ${recentSuffix}` : `${data.transactions.length} ${recentSuffix}`}
                </span>
              )}
            </div>
            <div className="max-h-[420px] overflow-y-auto overflow-x-hidden nos-scrollbar space-y-0">
              {data && data.transactions.length > 0 ? (
                data.transactions.map((tx, i) => (
                  <div
                    key={tx.hash ?? i}
                    className="group/tx flex items-start gap-2 sm:gap-3 py-2 border-b last:border-0 transition-colors -mx-2 px-2 rounded-sm"
                    style={{ borderColor: "var(--border)" }}
                    onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.background = "var(--glass-hover)"}
                    onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.background = "transparent"}
                  >
                    <span className="font-mono text-[8px] mt-0.5 shrink-0 w-5 text-right" style={{ color: "var(--muted-dim)" }}>
                      {String(i).padStart(2, '0')}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-mono text-[10px] group-hover/tx:text-[var(--cyan)] transition-colors" style={{ color: "var(--accent-bright)" }}>
                          {shortTxHash(tx.hash)}
                        </span>
                        {tx.value && tx.value !== "0" && (
                          <span className="font-mono text-[8px] opacity-70" style={{ color: "var(--emerald)" }}>
                            {formatValue(tx.value)} NOS
                          </span>
                        )}
                      </div>
                      <div className="mt-0.5 flex items-center gap-1.5 text-[9px] font-mono" style={{ color: "var(--muted)" }}>
                        <span className="truncate max-w-[80px] sm:max-w-[100px]">{shortAddr(tx.from)}</span>
                        <span className="opacity-30">→</span>
                        <span className="truncate max-w-[80px] sm:max-w-[100px]">{shortAddr(tx.to)}</span>
                      </div>
                    </div>
                    {tx.status !== undefined && tx.status !== 0 && (
                      <span className="mt-0.5 h-1.5 w-1.5 rounded-full opacity-50 shrink-0" style={{ background: "var(--emerald)" }} />
                    )}
                  </div>
                ))
              ) : (
                <div className="h-32 flex items-center justify-center font-mono text-[10px] text-center px-4" style={{ color: "var(--muted-dim)" }}>{error === "GitHub Pages 模式下未启用链上接口" ? pagesFallbackLabel : noRecentTxLabel}</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
