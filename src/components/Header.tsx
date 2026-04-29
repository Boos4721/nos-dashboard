"use client";

import type { Locale } from "@/content/datacenters";
import { siteContent } from "@/content/site";
import { t } from "@/lib/i18n";
import { useTheme } from "@/lib/ThemeContext";

export function Header({
  locale,
  onLocaleChange,
}: {
  locale: Locale;
  onLocaleChange: (l: Locale) => void;
}) {
  const { theme, toggleTheme } = useTheme();
  const lightLabel = locale === "zh" ? "浅色模式" : "Light mode";
  const darkLabel = locale === "zh" ? "深色模式" : "Dark mode";
  const switchToLightLabel = locale === "zh" ? "切换到浅色模式" : "Switch to light mode";
  const switchToDarkLabel = locale === "zh" ? "切换到深色模式" : "Switch to dark mode";

  return (
    <header
      className="sticky top-0 z-40 border-b backdrop-blur-xl"
      style={{
        borderColor: "var(--border)",
        background: theme === "dark" ? "rgba(0,0,0,0.8)" : "rgba(248,248,250,0.85)",
      }}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-2.5 lg:px-10">
        {/* Logo + branding */}
        <div className="flex items-center gap-4">
          <div
            className="group relative flex h-9 items-center justify-center overflow-hidden rounded-[12px] border px-3 transition-all duration-300"
            style={{
              borderColor: "rgba(255,255,255,0.12)",
              background: "linear-gradient(145deg, rgba(109,93,252,0.2), rgba(34,211,238,0.08) 55%, rgba(255,255,255,0.03))",
              boxShadow: "0 0 0 1px rgba(255,255,255,0.02) inset, 0 14px 34px rgba(109,93,252,0.22)",
            }}
          >
            <span
              className="pointer-events-none absolute inset-0 opacity-90"
              style={{
                background: "radial-gradient(circle at 28% 22%, rgba(255,255,255,0.32), transparent 34%), radial-gradient(circle at 74% 78%, rgba(34,211,238,0.18), transparent 42%)",
              }}
            />
            <span
              className="pointer-events-none absolute inset-x-[18%] top-0 h-px"
              style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)" }}
            />
            <span
              className="pointer-events-none absolute inset-0 opacity-70"
              style={{
                background: "linear-gradient(135deg, transparent 0%, rgba(255,255,255,0.12) 48%, transparent 62%)",
                transform: "translateX(-55%)",
                animation: "nosLogoSweep 4.6s ease-in-out infinite",
              }}
            />
            <span
              className="pointer-events-none absolute inset-[5px] rounded-[9px] border"
              style={{ borderColor: "rgba(255,255,255,0.08)" }}
            />
            <div className="relative z-10 flex items-center gap-2.5">
              <span className="relative flex h-5 w-5 items-center justify-center">
                <span className="absolute inset-0 rounded-full border" style={{ borderColor: "rgba(34,211,238,0.24)" }} />
                <span className="absolute inset-[4px] rounded-full" style={{ background: "var(--accent)", boxShadow: "0 0 14px rgba(109,93,252,0.45)" }} />
                <span className="absolute inset-x-[3px] top-1/2 h-px -translate-y-1/2" style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.72), transparent)" }} />
              </span>
              <span
                className="font-mono text-[13px] font-semibold uppercase tracking-[0.28em]"
                style={{ color: "var(--heading)", textShadow: "0 0 18px rgba(109,93,252,0.32)" }}
              >
                TYSJ
              </span>
            </div>
          </div>
        </div>

        {/* Nav + language + theme toggle */}
        <div className="hidden items-center gap-3 md:flex">
          <nav
            className="flex items-center gap-0.5 rounded-lg border px-1.5 py-1"
            style={{ borderColor: "var(--border)", background: "var(--glass)" }}
          >
            {siteContent.nav.map((item) => (
              <a
                key={item.href}
                className="rounded-md px-3 py-1.5 font-mono text-[9px] font-medium uppercase tracking-[0.12em] transition-all duration-200"
                style={{ color: "var(--body)" }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "var(--glass-hover)";
                  (e.currentTarget as HTMLElement).style.color = "var(--heading)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "transparent";
                  (e.currentTarget as HTMLElement).style.color = "var(--body)";
                }}
                href={item.href}
                rel={item.href.startsWith("http") ? "noreferrer" : undefined}
                target={item.href.startsWith("http") ? "_blank" : undefined}
              >
                {t(item.label, locale)}
              </a>
            ))}
          </nav>

          <div
            className="flex rounded-lg border p-0.5"
            style={{ borderColor: "var(--border)", background: "var(--glass)" }}
          >
            {(["en", "zh"] as Locale[]).map((option) => (
              <button
                key={option}
                className="rounded-md px-2.5 py-1.5 font-mono text-[9px] font-semibold uppercase tracking-[0.16em] transition-all duration-200"
                style={
                  locale === option
                    ? { background: "var(--accent)", color: "#fff", boxShadow: "0 0 12px var(--accent-glow)" }
                    : { color: "var(--muted)" }
                }
                onClick={() => onLocaleChange(option)}
                type="button"
              >
                {option}
              </button>
            ))}
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="flex h-8 w-8 items-center justify-center rounded-lg border transition-all duration-300"
            style={{ borderColor: "var(--border)", background: "var(--glass)", color: "var(--body)" }}
            aria-label={theme === "dark" ? switchToLightLabel : switchToDarkLabel}
            title={theme === "dark" ? lightLabel : darkLabel}
          >
            {theme === "dark" ? (
              /* Sun icon */
              <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="10" cy="10" r="3.5" />
                <path d="M10 2.5v2M10 15.5v2M2.5 10h2M15.5 10h2M4.6 4.6l1.4 1.4M14 14l1.4 1.4M4.6 15.4l1.4-1.4M14 6l1.4-1.4" strokeLinecap="round" />
              </svg>
            ) : (
              /* Moon icon */
              <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M17.5 10.8A8 8 0 019.2 2.5 8 8 0 1017.5 10.8z" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile controls */}
        <div className="flex items-center gap-2 md:hidden">
          {/* Mobile theme toggle */}
          <button
            onClick={toggleTheme}
            className="flex h-7 w-7 items-center justify-center rounded-md border transition-all"
            style={{ borderColor: "var(--border)", color: "var(--body)" }}
            aria-label={theme === "dark" ? switchToLightLabel : switchToDarkLabel}
          >
            {theme === "dark" ? (
              <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="10" cy="10" r="3.5" />
                <path d="M10 2.5v2M10 15.5v2M2.5 10h2M15.5 10h2M4.6 4.6l1.4 1.4M14 14l1.4 1.4M4.6 15.4l1.4-1.4M14 6l1.4-1.4" strokeLinecap="round" />
              </svg>
            ) : (
              <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M17.5 10.8A8 8 0 019.2 2.5 8 8 0 1017.5 10.8z" />
              </svg>
            )}
          </button>

          {/* Mobile locale toggle */}
          <div
            className="flex rounded-md border p-0.5"
            style={{ borderColor: "var(--border)", background: "var(--glass)" }}
          >
            {(["en", "zh"] as Locale[]).map((option) => (
              <button
                key={option}
                className="rounded px-2 py-1 font-mono text-[8px] font-semibold uppercase transition-all"
                style={
                  locale === option
                    ? { background: "var(--accent)", color: "#fff" }
                    : { color: "var(--muted)" }
                }
                onClick={() => onLocaleChange(option)}
                type="button"
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
