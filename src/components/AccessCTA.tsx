"use client";

import type { Locale } from "@/content/datacenters";
import { useInView } from "@/lib/useInView";

export function AccessCTA({ locale }: { locale: Locale }) {
  const { ref, inView } = useInView();
  const secureAccessLabel = locale === "zh" ? "[ 安全访问入口 ]" : "[ SECURE_ACCESS_PORTAL ]";
  const endpointLabel = locale === "zh" ? "访问地址" : "ENDPOINT";
  const statusLabel = locale === "zh" ? "状态" : "STATUS";
  const encryptionLabel = locale === "zh" ? "加密" : "ENCRYPTION";
  const statusValue = locale === "zh" ? "运行中" : "OPERATIONAL";
  const openDashboardLabel = locale === "zh" ? "打开安全仪表盘" : "OPEN_SECURE_DASHBOARD";
  const web3sPortalLabel = locale === "zh" ? "打开 WEB3S BOX" : "WEB3S_BOX_PORTAL";
  return (
    <section id="access" ref={ref as React.RefObject<HTMLElement>} className={`mx-auto max-w-7xl px-6 py-16 lg:px-10 lg:py-24 scroll-reveal ${inView ? "in-view" : ""}`}>
      <div className="p-px" style={{ background: "var(--border)" }}>
        <div className="p-8 lg:p-16" style={{ background: "var(--background-elevated)" }}>
          <div className="flex flex-col gap-12 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl space-y-8">
              <div className="flex items-center gap-4">
                <span className="live-dot" />
                <p className="font-mono text-[10px] font-bold tracking-[0.3em]" style={{ color: "var(--accent-bright)" }}>{secureAccessLabel}</p>
              </div>

              <h2 className="text-3xl font-light tracking-tight lg:text-5xl" style={{ color: "var(--heading)" }}>
                {locale === "en"
                  ? "Connect to the infrastructure."
                  : "连接至基础设施。"}
              </h2>

              <p className="text-[15px] leading-[1.8]" style={{ color: "var(--body)" }}>
                {locale === "en"
                  ? "Direct dashboard access via ROS NAT with public HTTPS. Establish secure tunnel to monitoring endpoints and telemetry hooks."
                  : "通过 ROS NAT 以 HTTPS 直接访问 Dashboard。建立通往监控终点与遥测钩子的安全隧道。"}
              </p>

              <div className="flex flex-wrap gap-8 pt-4">
                {[
                  { l: endpointLabel, v: "vpn.boos.lat:8051" },
                  { l: statusLabel, v: statusValue },
                  { l: encryptionLabel, v: "TLS_1.3" },
                ].map(item => (
                  <div key={item.l}>
                    <p className="font-mono text-[8px]" style={{ color: "var(--muted)" }}>{item.l}</p>
                    <p className="mt-1 font-mono text-[11px]" style={{ color: "var(--heading)" }}>{item.v}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-4 min-w-[240px]">
              <a
                className="group flex h-14 items-center justify-center bg-white px-8 text-[13px] font-bold tracking-widest text-black transition-all hover:bg-[var(--accent-bright)] hover:text-white"
                href="https://vpn.boos.lat:8051"
                target="_blank"
              >
                {openDashboardLabel}
              </a>
              <a
                className="group flex h-14 items-center justify-center border bg-transparent px-8 text-[13px] font-bold tracking-widest transition-all hover:border-[var(--heading)]"
                style={{ borderColor: "var(--border)", color: "var(--heading)" }}
                href="https://box.web3s.finance/"
                target="_blank"
              >
                {web3sPortalLabel}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
