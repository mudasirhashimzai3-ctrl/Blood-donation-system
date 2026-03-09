import { useLocation } from "react-router-dom";

import { useSettingsNavigation } from "../hooks/useSettingsNavigation";

export default function SettingsSectionNav() {
  const { items, navigateTo } = useSettingsNavigation();
  const location = useLocation();

  return (
    <div className="overflow-x-auto">
      <div className="flex min-w-max gap-2 rounded-lg border border-border bg-card p-2">
        {items.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => navigateTo(item.path)}
              className={`rounded-md px-3 py-2 text-sm font-medium transition ${
                isActive
                  ? "bg-primary text-white"
                  : "bg-surface text-text-secondary hover:text-text-primary"
              }`}
            >
              {item.label}
              {!item.live ? " (Planned)" : ""}
            </button>
          );
        })}
      </div>
    </div>
  );
}
