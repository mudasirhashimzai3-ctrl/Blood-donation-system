import type { AdminSettingsTab } from "../types/settings.types";

interface AdminSettingsTabsProps {
  activeTab: AdminSettingsTab;
  onChange: (tab: AdminSettingsTab) => void;
}

const items: Array<{ key: AdminSettingsTab; label: string }> = [
  { key: "system_settings", label: "System Settings" },
  { key: "manage_roles", label: "Manage Roles" },
  { key: "change_password", label: "Change Password" },
];

export default function AdminSettingsTabs({ activeTab, onChange }: AdminSettingsTabsProps) {
  return (
    <div className="overflow-x-auto">
      <div className="flex min-w-max gap-2 rounded-lg border border-border bg-card p-2">
        {items.map((item) => {
          const isActive = activeTab === item.key;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => onChange(item.key)}
              className={`rounded-md px-3 py-2 text-sm font-medium transition ${
                isActive
                  ? "bg-primary text-white"
                  : "bg-surface text-text-secondary hover:text-text-primary"
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
