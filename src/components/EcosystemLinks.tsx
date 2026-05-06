"use client";

import type { Locale } from "@/content/datacenters";
import { products } from "@/content/products";
import { t } from "@/lib/i18n";
import { useInView } from "@/lib/useInView";

export function EcosystemLinks({ locale }: { locale: Locale }) {
  const { ref, inView } = useInView();
  const sectionLabel = locale === "zh" ? "[ 生态入口 ]" : "[ ECOSYSTEM_DIRECT_ROUTING ]";
  const gatewayLabel = locale === "zh" ? "网关：公网 NAT" : "GATEWAY: PUBLIC_NAT";
  return (
    <section id="products" ref={ref as React.RefObject<HTMLElement>} className={`mx-auto max-w-7xl px-6 py-16 lg:px-10 lg:py-24 scroll-reveal ${inView ? "in-view" : ""}`}>
      {/* Label row */}
      <div className="flex items-center gap-4 mb-12">
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.3em]" style={{ color: "var(--accent-bright)" }}>
          {sectionLabel}
        </p>
        <div className="h-px flex-1" style={{ background: "var(--border)" }} />
        <span className="font-mono text-[9px]" style={{ color: "var(--muted)" }}>
          {gatewayLabel}
        </span>
      </div>

      {/* Product Grid */}
      <div className="stagger-child grid gap-px sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5" style={{ background: "var(--border)" }}>
        {products.map((product, index) => (
          <a
            key={product.href}
            className="group relative flex flex-col p-8 transition-all"
            style={{ background: "var(--background-elevated)" }}
            onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.background = "var(--background-surface-hover)"}
            onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.background = "var(--background-elevated)"}
            href={product.href}
            target="_blank"
          >
            <div className="flex items-center justify-between mb-8">
              <span className="font-mono text-[10px]" style={{ color: "var(--muted)" }}>[{String(index + 1).padStart(2, '0')}]</span>
              <span className="text-[12px] opacity-20 group-hover:opacity-100 group-hover:text-[var(--accent-bright)] transition-all">◈</span>
            </div>

            <h3 className="font-mono text-[13px] font-bold mb-2" style={{ color: "var(--heading)" }}>{locale === "zh" ? t(product.name, locale) : t(product.name, locale).toUpperCase()}</h3>
            <p className="font-mono text-[9px] mb-4" style={{ color: "var(--accent-bright)" }}>{locale === "zh" ? t(product.label, locale) : t(product.label, locale).toUpperCase()}</p>

            <p className="text-[13px] leading-[1.6] mb-6 flex-1" style={{ color: "var(--body)" }}>
              {t(product.summary, locale)}
            </p>

            <div className="pt-4 border-t" style={{ borderColor: "var(--border)" }}>
              <span className="font-mono text-[9px] group-hover:text-[var(--heading)] transition-colors" style={{ color: "var(--muted)" }}>{locale === "zh" ? "立即前往 →" : "ACCESS_ENDPOINT →"}</span>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
