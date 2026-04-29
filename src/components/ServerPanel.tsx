"use client";

import { useEffect, useRef, useState } from "react";
import type { Locale, Datacenter } from "@/content/datacenters";
import type { Server, ServerRole, ServerStatus } from "@/content/servers";
import { serversByDatacenter } from "@/content/servers";
import { t } from "@/lib/i18n";

function roleLabel(role: ServerRole, locale: Locale) {
  if (locale !== "zh") return role;

  switch (role) {
    case "Compute Node":
      return "算力节点";
    case "Validator":
      return "验证节点";
    case "API Gateway":
      return "API 网关";
    case "Relay Node":
      return "中继节点";
    case "AI Inference":
      return "AI 推理";
    case "Storage":
      return "存储";
    case "Edge Proxy":
      return "边缘代理";
    default:
      return role;
  }
}

function lastSeenLabel(lastSeen: string, locale: Locale) {
  if (locale !== "zh") return lastSeen;
  if (lastSeen === "—") return "—";

  const agoMatch = lastSeen.match(/^(\d+)s ago$/);
  if (agoMatch) {
    return `${agoMatch[1]} 秒前`;
  }

  return lastSeen;
}

function StatusDot({ status }: { status: ServerStatus }) {
  const colors: Record<ServerStatus, string> = {
    online: "var(--online-dot)",
    warning: "var(--warning-dot)",
    offline: "var(--offline-dot)",
    maintenance: "var(--muted)",
  };
  return (
    <span
      className="inline-block h-2 w-2 rounded-full shrink-0"
      style={{
        background: colors[status],
        boxShadow: status === "online" ? `0 0 6px var(--emerald-glow)` : undefined,
      }}
    />
  );
}

function GaugeBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="h-1 w-full overflow-hidden rounded-full" style={{ background: "var(--skeleton)" }}>
      <div
        className="h-full rounded-full transition-all duration-700"
        style={{
          width: `${Math.min(value, 100)}%`,
          background: color,
        }}
      />
    </div>
  );
}

function ServerCard({ server, locale }: { server: Server; locale: Locale }) {
  const cpuColor =
    server.cpu > 85 ? "var(--offline-dot)" : server.cpu > 65 ? "var(--warning-dot)" : "var(--accent)";
  const memColor =
    server.memory > 90 ? "var(--offline-dot)" : server.memory > 75 ? "var(--warning-dot)" : "var(--cyan)";
  const tempColor =
    server.temperature > 75 ? "var(--offline-dot)" : server.temperature > 60 ? "var(--warning-dot)" : "var(--emerald)";

  return (
    <div
      className="group relative flex flex-col gap-3 rounded-lg border p-4 transition-all duration-300 hover:scale-[1.01]"
      style={{
        background: "var(--background-elevated)",
        borderColor: "var(--panel-border)",
        boxShadow: "var(--shadow-ambient)",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <StatusDot status={server.status} />
          <span className="font-mono text-[11px] font-bold" style={{ color: "var(--heading)" }}>
            {server.name}
          </span>
        </div>
        <span
          className="rounded px-1.5 py-0.5 font-mono text-[8px] font-semibold uppercase tracking-wider"
          style={{
            background: "var(--glass)",
            color: server.status === "online" ? "var(--emerald)" : server.status === "offline" ? "var(--offline-dot)" : "var(--muted)",
          }}
        >
          {locale === "zh"
            ? server.status === "online"
              ? "在线"
              : server.status === "offline"
                ? "离线"
                : server.status === "warning"
                  ? "告警"
                  : "维护"
            : server.status}
        </span>
      </div>

      {/* Role */}
      <span className="font-mono text-[9px] font-medium uppercase tracking-widest" style={{ color: "var(--accent-bright)" }}>
        {roleLabel(server.role, locale)}
      </span>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[8px] uppercase tracking-wider" style={{ color: "var(--muted)" }}>{locale === "zh" ? "处理器" : "CPU"}</span>
            <span className="font-mono text-[10px] font-medium" style={{ color: "var(--heading)" }}>{server.cpu}%</span>
          </div>
          <GaugeBar value={server.cpu} color={cpuColor} />
        </div>
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[8px] uppercase tracking-wider" style={{ color: "var(--muted)" }}>{locale === "zh" ? "内存" : "MEM"}</span>
            <span className="font-mono text-[10px] font-medium" style={{ color: "var(--heading)" }}>{server.memory}%</span>
          </div>
          <GaugeBar value={server.memory} color={memColor} />
        </div>
      </div>

      {/* Disk */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[8px] uppercase tracking-wider" style={{ color: "var(--muted)" }}>{locale === "zh" ? "磁盘" : "DISK"}</span>
          <span className="font-mono text-[10px] font-medium" style={{ color: "var(--heading)" }}>{server.disk}%</span>
        </div>
        <GaugeBar value={server.disk} color="var(--accent)" />
      </div>

      {/* Bottom Stats Row */}
      <div className="flex items-center justify-between border-t pt-2" style={{ borderColor: "var(--border)" }}>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <svg className="h-3 w-3" viewBox="0 0 16 16" fill="none">
              <path d="M8 2v4l3 2" stroke={tempColor} strokeWidth="1.5" strokeLinecap="round" />
              <circle cx="8" cy="10" r="5" stroke={tempColor} strokeWidth="1" opacity="0.4" />
            </svg>
            <span className="font-mono text-[9px]" style={{ color: tempColor }}>{server.temperature}°C</span>
          </div>
          <div className="flex items-center gap-1">
            <svg className="h-3 w-3" viewBox="0 0 16 16" fill="none">
              <path d="M9 2L5 9h3l-1 5 5-7H9l1-5z" stroke="var(--amber)" strokeWidth="1" fill="var(--amber)" opacity="0.6" />
            </svg>
            <span className="font-mono text-[9px]" style={{ color: "var(--amber)" }}>{server.powerWatts}W</span>
          </div>
        </div>
        <span className="font-mono text-[8px]" style={{ color: "var(--muted-dim)" }}>
          {lastSeenLabel(server.lastSeen, locale)}
        </span>
      </div>
    </div>
  );
}

function SummaryBar({ servers, locale }: { servers: Server[]; locale: Locale }) {
  const online = servers.filter((s) => s.status === "online").length;
  const warning = servers.filter((s) => s.status === "warning").length;
  const offline = servers.filter((s) => s.status === "offline").length;
  const maintenance = servers.filter((s) => s.status === "maintenance").length;
  const avgCpu = servers.filter((s) => s.status !== "offline").reduce((a, s) => a + s.cpu, 0) / (servers.length - offline || 1);
  const avgTemp = servers.filter((s) => s.status !== "offline").reduce((a, s) => a + s.temperature, 0) / (servers.length - offline || 1);

  return (
    <div
      className="flex flex-wrap items-center gap-4 rounded-lg border px-4 py-3"
      style={{ background: "var(--glass)", borderColor: "var(--border)" }}
    >
      {[
        { label: locale === "zh" ? "总数" : "TOTAL", value: String(servers.length), color: "var(--heading)" },
        { label: locale === "zh" ? "在线" : "ONLINE", value: String(online), color: "var(--emerald)" },
        { label: locale === "zh" ? "告警" : "WARN", value: String(warning), color: "var(--amber)" },
        { label: locale === "zh" ? "离线" : "OFFLINE", value: String(offline), color: "var(--offline-dot)" },
        { label: locale === "zh" ? "维护" : "MAINT", value: String(maintenance), color: "var(--muted)" },
        { label: locale === "zh" ? "平均处理器" : "AVG_CPU", value: `${avgCpu.toFixed(1)}%`, color: "var(--accent-bright)" },
        { label: locale === "zh" ? "平均温度" : "AVG_TEMP", value: `${avgTemp.toFixed(0)}°C`, color: "var(--cyan)" },
      ].map((s) => (
        <div key={s.label} className="flex items-center gap-1.5">
          <span className="font-mono text-[7px] uppercase tracking-wider" style={{ color: "var(--muted)" }}>{s.label}</span>
          <span className="font-mono text-[10px] font-bold" style={{ color: s.color }}>{s.value}</span>
        </div>
      ))}
    </div>
  );
}

export function ServerPanel({
  datacenter,
  locale,
  open,
  onClose,
}: {
  datacenter: Datacenter;
  locale: Locale;
  open: boolean;
  onClose: () => void;
}) {
  const servers = serversByDatacenter[datacenter.id] ?? [];
  const panelRef = useRef<HTMLDivElement>(null);
  const [filter, setFilter] = useState<ServerStatus | "all">("all");
  const [mounted, setMounted] = useState(open);
  const [animateIn, setAnimateIn] = useState(false);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    if (open) {
      setMounted(true);
      requestAnimationFrame(() => setAnimateIn(true));
    } else {
      setAnimateIn(false);
      timeoutId = setTimeout(() => setMounted(false), 520);
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [open]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (mounted) window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [mounted, onClose]);

  useEffect(() => {
    if (mounted) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mounted]);

  const filtered = filter === "all" ? servers : servers.filter((s) => s.status === filter);

  if (!mounted) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40 transition-opacity duration-500 lg:hidden"
        style={{
          background: "rgba(0,0,0,0.6)",
          backdropFilter: "blur(4px)",
          opacity: animateIn ? 1 : 0,
        }}
        onClick={onClose}
      />

      <div
        ref={panelRef}
        className="fixed z-50 overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
        style={{
          top: 0,
          right: 0,
          bottom: 0,
          width: "min(92vw, 560px)",
          transform: animateIn ? "translateX(0)" : "translateX(100%)",
          opacity: animateIn ? 1 : 0.98,
          background: "var(--background)",
          borderLeft: "1px solid var(--panel-border)",
          boxShadow: animateIn ? "-20px 0 60px rgba(0,0,0,0.3)" : "none",
        }}
      >
        <div className="flex h-full flex-col">
          {/* Panel Header */}
          <div
            className="flex items-center justify-between border-b px-5 py-4 lg:px-6"
            style={{ borderColor: "var(--border)" }}
          >
            <div className="flex items-center gap-3">
              <div
                className="flex h-8 w-8 items-center justify-center rounded border font-mono text-[10px] font-bold"
                style={{
                  borderColor: "var(--border-accent)",
                  color: "var(--accent-bright)",
                  background: "var(--glass)",
                }}
              >
                {datacenter.id.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <h3 className="font-mono text-[12px] font-bold" style={{ color: "var(--heading)" }}>
                  {t(datacenter.name, locale)}
                </h3>
                <p className="font-mono text-[9px]" style={{ color: "var(--muted)" }}>
                  {t(datacenter.region, locale)} &middot; {servers.length} {locale === "zh" ? "台机器" : "machines"}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-md border transition-colors"
              style={{ borderColor: "var(--border)", color: "var(--muted)" }}
                aria-label={locale === "zh" ? "关闭" : "Close"}
            >
              <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M4 4l8 8M12 4l-8 8" />
              </svg>
            </button>
          </div>

          {/* Summary */}
          <div className="px-5 py-3 lg:px-6">
            <SummaryBar servers={servers} locale={locale} />
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1 px-5 pb-2 lg:px-6">
            {(["all", "online", "warning", "offline"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className="rounded-md px-2.5 py-1 font-mono text-[9px] font-semibold uppercase tracking-wider transition-all"
                style={{
                  background: filter === f ? "var(--accent)" : "var(--glass)",
                  color: filter === f ? "#fff" : "var(--muted)",
                  boxShadow: filter === f ? "0 0 12px var(--accent-glow)" : undefined,
                }}
              >
                {locale === "zh"
                  ? f === "all"
                    ? "全部"
                    : f === "online"
                      ? "在线"
                      : f === "warning"
                        ? "告警"
                        : "离线"
                  : f}
              </button>
            ))}
          </div>

          {/* Server List — scrollable */}
          <div className="flex-1 overflow-y-auto px-5 pb-6 lg:px-6 nos-scrollbar">
            <div className="grid gap-3 sm:grid-cols-2">
              {filtered.map((server, i) => (
                <div
                  key={server.id}
                  className="transition-all duration-500"
                  style={{
                    transitionDelay: `${i * 40}ms`,
                    opacity: animateIn ? 1 : 0,
                    transform: animateIn ? "translateY(0)" : "translateY(16px)",
                  }}
                >
                  <ServerCard server={server} locale={locale} />
                </div>
              ))}
            </div>
            {filtered.length === 0 && (
              <div className="flex h-32 items-center justify-center">
                <p className="font-mono text-[11px]" style={{ color: "var(--muted-dim)" }}>
                  {locale === "zh" ? "没有匹配的服务器" : "No servers match this filter"}
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div
            className="flex items-center justify-between border-t px-5 py-3 lg:px-6"
            style={{ borderColor: "var(--border)" }}
          >
            <div className="flex items-center gap-2">
              <span className="live-dot" />
              <span className="font-mono text-[8px] uppercase tracking-wider" style={{ color: "var(--muted)" }}>
                {locale === "zh" ? "实时遥测" : "Live Telemetry"}
              </span>
            </div>
            <span className="font-mono text-[8px]" style={{ color: "var(--muted-dim)" }}>
              NOS_HWC_v0.1
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
