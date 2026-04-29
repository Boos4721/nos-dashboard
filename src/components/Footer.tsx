"use client";

import type { Locale } from "@/content/datacenters";
import { siteContent } from "@/content/site";
import { t } from "@/lib/i18n";

const links = [
  { label: "notes.bet", href: "https://notes.bet" },
  { label: "nos-miner", href: "https://nos-miner.noschain.org" },
  { label: "nosscan", href: "https://nosscan.noschain.org" },
  { label: "box.web3s.finance", href: "https://box.web3s.finance/" },
  { label: "nos-monitor", href: "https://box.web3s.finance/dapps/nos-monitor" },
];

export function Footer({ locale }: { locale: Locale }) {
  const infrastructureLabel = locale === "zh" ? "NOS 基础设施" : "NOS_INFRASTRUCTURE";
  const networkLabel = locale === "zh" ? "网络" : "NETWORK";
  const ecosystemLabel = locale === "zh" ? "生态" : "ECOSYSTEM";
  const legalLabel = locale === "zh" ? "法务" : "LEGAL";
  const privacyLabel = locale === "zh" ? "隐私政策" : "PRIVACY_POLICY";
  const termsLabel = locale === "zh" ? "服务条款" : "TERMS_OF_SERVICE";
  const systemsOperationalLabel = locale === "zh" ? "© 2026 NOS_NETWORK // 全系统运行中" : "© 2026 NOS_NETWORK // ALL_SYSTEMS_OPERATIONAL";
  return (
    <footer className="border-t px-6 py-12 lg:px-10 lg:py-16" style={{ borderColor: "var(--border)", background: "var(--background-elevated)" }}>
      <div className="mx-auto flex max-w-7xl flex-col gap-12 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="flex h-6 w-6 items-center justify-center border text-[9px] font-bold" style={{ borderColor: "var(--border-accent)", color: "var(--accent-bright)" }}>N</div>
            <p className="font-mono text-[10px] font-bold tracking-widest" style={{ color: "var(--heading)" }}>{infrastructureLabel}</p>
          </div>
          <p className="max-w-md text-[13px] leading-[1.7]" style={{ color: "var(--body)" }}>
            {t(siteContent.footer.description, locale)}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-x-16 gap-y-8 sm:grid-cols-3">
          <div className="space-y-4">
            <p className="font-mono text-[9px] font-bold" style={{ color: "var(--muted)" }}>{networkLabel}</p>
            <div className="flex flex-col gap-2">
              {links.slice(1, 3).map((link) => (
                <a key={link.href} className="font-mono text-[10px] transition-colors hover:text-[var(--heading)]" style={{ color: "var(--body)" }} href={link.href} target="_blank">{link.label.toUpperCase()}</a>
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <p className="font-mono text-[9px] font-bold" style={{ color: "var(--muted)" }}>{ecosystemLabel}</p>
            <div className="flex flex-col gap-2">
              {links.slice(3).map((link) => (
                <a key={link.href} className="font-mono text-[10px] transition-colors hover:text-[var(--heading)]" style={{ color: "var(--body)" }} href={link.href} target="_blank">{link.label.toUpperCase()}</a>
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <p className="font-mono text-[9px] font-bold" style={{ color: "var(--muted)" }}>{legalLabel}</p>
            <div className="flex flex-col gap-2">
              <span className="font-mono text-[10px]" style={{ color: "var(--body)" }}>{privacyLabel}</span>
              <span className="font-mono text-[10px]" style={{ color: "var(--body)" }}>{termsLabel}</span>
            </div>
          </div>
        </div>
      </div>
      <div className="mx-auto mt-16 max-w-7xl border-t pt-8" style={{ borderColor: "var(--border)" }}>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-mono text-[9px]" style={{ color: "var(--muted-dim)" }}>{systemsOperationalLabel}</p>
          <p className="font-mono text-[9px]" style={{ color: "var(--muted-dim)" }}>{t(siteContent.footer.credit, locale)}</p>
        </div>
      </div>
    </footer>
  );
}
