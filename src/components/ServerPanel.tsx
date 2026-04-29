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

function statusLabel(status: ServerStatus, locale: Locale) {
  if (locale !== "zh") return status;
  switch (status) {
    case "online":
      return "在线";
    case "offline":
      return "离线";
    case "warning":
      return "告警";
    case "maintenance":
      return "维护";
    default:
      return status;
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

function DetailRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="border-b pb-2" style={{ borderColor: "var(--border)" }}>
      <p className="font-mono text-[8px] tracking-[0.2em]" style={{ color: "var(--muted)" }}>
        {label}
      </p>
      <p className="mt-1 font-mono text-[11px]" style={{ color: "var(--heading)" }}>
        {value}
      </p>
    </div>
  );
}

function ServerCard({
  server,
  locale,
  selected,
  onSelect,
}: {
  server: Server;
  locale: Locale;
  selected: boolean;
  onSelect: () => void;
}) {
  const cpuColor =
    server.cpu > 85 ? "var(--offline-dot)" : server.cpu > 65 ? "var(--warning-dot)" : "var(--accent)";
  const memColor =
    server.memory > 90 ? "var(--offline-dot)" : server.memory > 75 ? "var(--warning-dot)" : "var(--cyan)";
  const tempColor =
    server.temperature > 75 ? "var(--offline-dot)" : server.temperature > 60 ? "var(--warning-dot)" : "var(--emerald)";

  return (
    <button
      type="button"
      onClick={onSelect}
      className="group relative flex w-full flex-col gap-3 rounded-lg border p-4 text-left transition-all duration-300 hover:scale-[1.01]"
      style={{
        background: selected ? "rgba(109,93,252,0.08)" : "var(--background-elevated)",
        borderColor: selected ? "var(--border-accent)" : "var(--panel-border)",
        boxShadow: selected ? "0 0 0 1px rgba(109,93,252,0.12), 0 20px 45px rgba(109,93,252,0.12)" : "var(--shadow-ambient)",
      }}
    >
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
          {statusLabel(server.status, locale)}
        </span>
      </div>

      <span className="font-mono text-[9px] font-medium uppercase tracking-widest" style={{ color: "var(--accent-bright)" }}>
        {roleLabel(server.role, locale)}
      </span>

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

      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[8px] uppercase tracking-wider" style={{ color: "var(--muted)" }}>{locale === "zh" ? "磁盘" : "DISK"}</span>
          <span className="font-mono text-[10px] font-medium" style={{ color: "var(--heading)" }}>{server.disk}%</span>
        </div>
        <GaugeBar value={server.disk} color="var(--accent)" />
      </div>

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

      <div className="flex items-center justify-between border-t pt-2" style={{ borderColor: "var(--border)" }}>
        <span className="font-mono text-[8px] tracking-[0.18em]" style={{ color: "var(--muted)" }}>
          {locale === "zh" ? "点击查看设备详情" : "TAP FOR DEVICE DETAILS"}
        </span>
        <span className="font-mono text-[9px]" style={{ color: selected ? "var(--accent-bright)" : "var(--muted-dim)" }}>
          {selected ? (locale === "zh" ? "已展开" : "OPEN") : "→"}
        </span>
      </div>
    </button>
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
    <div className="flex flex-wrap items-center gap-4 rounded-lg border px-4 py-3" style={{ background: "var(--glass)", borderColor: "var(--border)" }}>
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
  const [selectedServerId, setSelectedServerId] = useState<string | null>(null);

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
  const selectedServer = filtered.find((s) => s.id === selectedServerId) ?? filtered[0] ?? servers[0] ?? null;

  useEffect(() => {
    if (!selectedServer && filtered[0]) {
      setSelectedServerId(filtered[0].id);
      return;
    }
    if (selectedServer && !filtered.some((server) => server.id === selectedServer.id)) {
      setSelectedServerId(filtered[0]?.id ?? null);
    }
  }, [filtered, selectedServer]);

  useEffect(() => {
    if (!open) return;
    setSelectedServerId((prev) => prev ?? filtered[0]?.id ?? servers[0]?.id ?? null);
  }, [open, filtered, servers]);

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
          width: "min(96vw, 760px)",
          transform: animateIn ? "translateX(0)" : "translateX(100%)",
          opacity: animateIn ? 1 : 0.98,
          background: "var(--background)",
          borderLeft: "1px solid var(--panel-border)",
          boxShadow: animateIn ? "-20px 0 60px rgba(0,0,0,0.3)" : "none",
        }}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b px-5 py-4 lg:px-6" style={{ borderColor: "var(--border)" }}>
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded border font-mono text-[10px] font-bold" style={{ borderColor: "var(--border-accent)", color: "var(--accent-bright)", background: "var(--glass)" }}>
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

          <div className="px-5 py-3 lg:px-6">
            <SummaryBar servers={servers} locale={locale} />
          </div>

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

          <div className="grid min-h-0 flex-1 gap-px lg:grid-cols-[0.92fr_1.08fr]" style={{ background: "var(--border)" }}>
            <div className="overflow-y-auto px-5 pb-6 lg:px-6 nos-scrollbar" style={{ background: "var(--background)" }}>
              <div className="grid gap-3 py-2">
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
                    <ServerCard
                      server={server}
                      locale={locale}
                      selected={selectedServer?.id === server.id}
                      onSelect={() => setSelectedServerId(server.id)}
                    />
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

            <div className="flex min-h-0 flex-col overflow-y-auto px-5 pb-6 pt-2 lg:px-6 nos-scrollbar" style={{ background: "var(--background-elevated)" }}>
              {selectedServer ? (
                <div className="space-y-5">
                  <div className="rounded-2xl border p-4" style={{ borderColor: "rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)" }}>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-mono text-[9px] tracking-[0.24em]" style={{ color: "var(--muted)" }}>
                          {locale === "zh" ? "设备详情" : "DEVICE DETAIL"}
                        </p>
                        <h4 className="mt-2 font-mono text-[16px]" style={{ color: "var(--heading)" }}>
                          {selectedServer.name}
                        </h4>
                        <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em]" style={{ color: "var(--accent-bright)" }}>
                          {roleLabel(selectedServer.role, locale)}
                        </p>
                      </div>
                      <div className="rounded-full border px-3 py-1 font-mono text-[8px] uppercase tracking-[0.2em]" style={{ borderColor: "rgba(255,255,255,0.08)", color: selectedServer.status === "online" ? "var(--emerald)" : selectedServer.status === "warning" ? "var(--amber)" : selectedServer.status === "offline" ? "var(--offline-dot)" : "var(--muted)" }}>
                        {statusLabel(selectedServer.status, locale)}
                      </div>
                    </div>
                    <p className="mt-4 text-[13px] leading-6" style={{ color: "var(--body)" }}>
                      {locale === "zh"
                        ? `当前工作负载：${selectedServer.workload}，备注：${selectedServer.notes}。`
                        : `Current workload: ${selectedServer.workload}. Notes: ${selectedServer.notes}.`}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-2xl border p-4" style={{ borderColor: "rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.025)" }}>
                      <p className="font-mono text-[8px] tracking-[0.2em]" style={{ color: "var(--muted)" }}>{locale === "zh" ? "带宽" : "BANDWIDTH"}</p>
                      <p className="mt-2 font-mono text-[18px]" style={{ color: "var(--heading)" }}>{selectedServer.bandwidthGbps} Gbps</p>
                    </div>
                    <div className="rounded-2xl border p-4" style={{ borderColor: "rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.025)" }}>
                      <p className="font-mono text-[8px] tracking-[0.2em]" style={{ color: "var(--muted)" }}>{locale === "zh" ? "运行时长" : "UPTIME"}</p>
                      <p className="mt-2 font-mono text-[18px]" style={{ color: "var(--accent-bright)" }}>{selectedServer.uptime}</p>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <DetailRow label={locale === "zh" ? "机架" : "RACK"} value={selectedServer.rack} />
                    <DetailRow label={locale === "zh" ? "内网地址" : "PRIVATE_IP"} value={selectedServer.ip} />
                    <DetailRow label={locale === "zh" ? "内核" : "KERNEL"} value={selectedServer.kernel} />
                    <DetailRow label={locale === "zh" ? "维护窗口" : "SERVICE_WINDOW"} value={selectedServer.serviceWindow} />
                    <DetailRow label={locale === "zh" ? "最后上报" : "LAST_SEEN"} value={lastSeenLabel(selectedServer.lastSeen, locale)} />
                    <DetailRow label={locale === "zh" ? "功耗" : "POWER"} value={`${selectedServer.powerWatts}W`} />
                  </div>

                  <div className="rounded-2xl border p-4" style={{ borderColor: "rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.025)" }}>
                    <p className="font-mono text-[8px] tracking-[0.2em]" style={{ color: "var(--muted)" }}>
                      {locale === "zh" ? "即时指标" : "LIVE METRICS"}
                    </p>
                    <div className="mt-4 space-y-3">
                      {[
                        { label: locale === "zh" ? "处理器" : "CPU", value: selectedServer.cpu, color: selectedServer.cpu > 85 ? "var(--offline-dot)" : selectedServer.cpu > 65 ? "var(--warning-dot)" : "var(--accent)" },
                        { label: locale === "zh" ? "内存" : "MEM", value: selectedServer.memory, color: selectedServer.memory > 90 ? "var(--offline-dot)" : selectedServer.memory > 75 ? "var(--warning-dot)" : "var(--cyan)" },
                        { label: locale === "zh" ? "磁盘" : "DISK", value: selectedServer.disk, color: "var(--accent-bright)" },
                        { label: locale === "zh" ? "温度" : "TEMP", value: selectedServer.temperature, color: selectedServer.temperature > 75 ? "var(--offline-dot)" : selectedServer.temperature > 60 ? "var(--warning-dot)" : "var(--emerald)" },
                      ].map((metric) => (
                        <div key={metric.label} className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-[8px] uppercase tracking-[0.18em]" style={{ color: "var(--muted)" }}>{metric.label}</span>
                            <span className="font-mono text-[10px]" style={{ color: "var(--heading)" }}>
                              {metric.label === (locale === "zh" ? "温度" : "TEMP") ? `${metric.value}°C` : `${metric.value}%`}
                            </span>
                          </div>
                          <GaugeBar value={metric.value} color={metric.color} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex h-full items-center justify-center">
                  <p className="font-mono text-[11px]" style={{ color: "var(--muted-dim)" }}>
                    {locale === "zh" ? "选择一台设备查看详细信息" : "Select a device to inspect detailed telemetry"}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between border-t px-5 py-3 lg:px-6" style={{ borderColor: "var(--border)" }}>
            <div className="flex items-center gap-2">
              <span className="live-dot" />
              <span className="font-mono text-[8px] uppercase tracking-wider" style={{ color: "var(--muted)" }}>
                {locale === "zh" ? "实时遥测" : "Live Telemetry"}
              </span>
            </div>
            <span className="font-mono text-[8px]" style={{ color: "var(--muted-dim)" }}>
              NOS_HWC_v0.2
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
