"use client";

import type { Locale } from "@/content/datacenters";
import type { DashboardRole } from "@/content/dashboardRoles";
import { dashboardRoles } from "@/content/dashboardRoles";

export function RoleSwitcher({
  locale,
  role,
  onRoleChange,
}: {
  locale: Locale;
  role: DashboardRole;
  onRoleChange: (role: DashboardRole) => void;
}) {
  const title = locale === "zh" ? "视图角色" : "ROLE_VIEW";

  return (
    <div
      className="flex flex-col gap-2 rounded-2xl border px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between"
      style={{ borderColor: "var(--border)", background: "var(--glass)" }}
    >
      <div>
        <p className="font-mono text-[9px] uppercase tracking-[0.24em]" style={{ color: "var(--muted)" }}>
          {title}
        </p>
        <p className="mt-1 text-sm" style={{ color: "var(--body)" }}>
          {dashboardRoles.find((item) => item.id === role)?.hint[locale]}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {dashboardRoles.map((option) => {
          const active = option.id === role;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onRoleChange(option.id)}
              className="rounded-xl border px-3 py-2 text-left transition-all duration-200"
              style={
                active
                  ? {
                      borderColor: "var(--accent)",
                      background: "color-mix(in srgb, var(--accent) 14%, transparent)",
                      boxShadow: "0 0 18px rgba(109,93,252,0.22)",
                    }
                  : {
                      borderColor: "var(--border)",
                      background: "transparent",
                    }
              }
            >
              <p className="font-mono text-[10px] uppercase tracking-[0.18em]" style={{ color: active ? "var(--heading)" : "var(--muted)" }}>
                {option.label[locale]}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
