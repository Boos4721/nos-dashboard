"use client";

import { useEffect, useState, useCallback } from "react";

import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { ChainTelemetry } from "@/components/ChainTelemetry";
import { WorldMap } from "@/components/WorldMap";
import { EcosystemLinks } from "@/components/EcosystemLinks";
import { AccessCTA } from "@/components/AccessCTA";
import { WalletConnectCard } from "@/components/WalletConnectCard";
import { Footer } from "@/components/Footer";
import { LoadingOverlay } from "@/components/LoadingOverlay";
import { ServerPanel } from "@/components/ServerPanel";
import { datacenters, type Locale } from "@/content/datacenters";
import { useChainData } from "@/lib/useChainData";

export default function Home() {
  const [selectedId, setSelectedId] = useState(datacenters[0].id);
  const [locale, setLocale] = useState<Locale>(() => {
    if (typeof window === "undefined") {
      return "en";
    }
    const saved = window.localStorage.getItem("nos-dashboard-locale");
    return saved === "zh" ? "zh" : "en";
  });
  const [serverPanelOpen, setServerPanelOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const chain = useChainData(15000);

  useEffect(() => {
    window.localStorage.setItem("nos-dashboard-locale", locale);
  }, [locale]);

  useEffect(() => {
    const updateScrollProgress = () => {
      const doc = document.documentElement;
      const scrollable = Math.max(doc.scrollHeight - window.innerHeight, 1);
      const next = Math.min(window.scrollY / scrollable, 1);
      setScrollProgress(next);
    };

    updateScrollProgress();
    window.addEventListener("scroll", updateScrollProgress, { passive: true });
    window.addEventListener("resize", updateScrollProgress);

    return () => {
      window.removeEventListener("scroll", updateScrollProgress);
      window.removeEventListener("resize", updateScrollProgress);
    };
  }, []);

  const handleSelect = useCallback((id: string) => {
    setSelectedId(id);
  }, []);

  const selectedDc = datacenters.find((dc) => dc.id === selectedId) ?? datacenters[0];

  return (
    <>
      <LoadingOverlay ready={!chain.loading} maxVisibleMs={5000} />
      <div className="noise-overlay" />
      <main
        className="relative min-h-screen overflow-hidden selection:bg-[var(--accent)] selection:text-white"
        style={{ background: "var(--background)", color: "var(--foreground)" }}
      >
        <div
          className="scroll-gradient-bg"
          style={{
            opacity: 0.34 + scrollProgress * 0.14,
            transform: `translate3d(0, ${scrollProgress * 110}px, 0) scale(${1 + scrollProgress * 0.09})`,
            filter: `hue-rotate(${scrollProgress * 10}deg) saturate(${1 + scrollProgress * 0.1}) blur(${8 + scrollProgress * 4}px)`,
          }}
        />

        <div
          className="scroll-gradient-orb scroll-gradient-orb-a"
          style={{
            transform: `translate3d(${scrollProgress * 42}px, ${scrollProgress * 120}px, 0) scale(${1 + scrollProgress * 0.1})`,
            opacity: 0.14 + scrollProgress * 0.05,
          }}
        />
        <div
          className="scroll-gradient-orb scroll-gradient-orb-b"
          style={{
            transform: `translate3d(${-scrollProgress * 54}px, ${scrollProgress * 150}px, 0) scale(${1 + scrollProgress * 0.12})`,
            opacity: 0.13 + scrollProgress * 0.06,
          }}
        />
        <div
          className="scroll-gradient-orb scroll-gradient-orb-c"
          style={{
            transform: `translate3d(${scrollProgress * 18}px, ${scrollProgress * 190}px, 0) scale(${1 + scrollProgress * 0.14})`,
            opacity: 0.1 + scrollProgress * 0.05,
          }}
        />
        <div
          className="scroll-gradient-orb scroll-gradient-orb-d"
          style={{
            transform: `translate3d(${-scrollProgress * 22}px, ${scrollProgress * 240}px, 0) scale(${1 + scrollProgress * 0.12})`,
            opacity: 0.08 + scrollProgress * 0.04,
          }}
        />

        {/* Ambient radial gradients — layered depth */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_12%_0%,rgba(109,93,252,0.1),transparent_45%),radial-gradient(ellipse_at_88%_12%,rgba(34,211,238,0.06),transparent_38%),radial-gradient(ellipse_at_50%_100%,rgba(109,93,252,0.05),transparent_50%)]" />

        {/* Vertical/Horizontal grid frame lines */}
        <div className="pointer-events-none absolute left-0 right-0 top-[10%] h-px opacity-20" style={{ background: "var(--border)" }} />
        <div className="pointer-events-none absolute left-0 right-0 top-[40%] h-px opacity-10" style={{ background: "var(--border)" }} />
        <div className="pointer-events-none absolute bottom-0 left-[15%] top-0 w-px opacity-15" style={{ background: "var(--border)" }} />
        <div className="pointer-events-none absolute bottom-0 right-[15%] top-0 w-px opacity-15" style={{ background: "var(--border)" }} />

        <Header locale={locale} onLocaleChange={setLocale} />
        <HeroSection locale={locale} />
        <ChainTelemetry
          locale={locale}
          data={chain.data}
          loading={chain.loading}
          error={chain.error}
        />
        <WorldMap locale={locale} selectedId={selectedId} onSelect={handleSelect} onOpenServers={() => setServerPanelOpen(true)} />
        <EcosystemLinks locale={locale} />
        <AccessCTA locale={locale} />
        <section className="mx-auto max-w-7xl px-6 pb-16 lg:px-10 lg:pb-24">
          <WalletConnectCard locale={locale} />
        </section>
        <Footer locale={locale} />

        <ServerPanel
          datacenter={selectedDc}
          locale={locale}
          open={serverPanelOpen}
          onClose={() => setServerPanelOpen(false)}
        />
      </main>
    </>
  );
}
