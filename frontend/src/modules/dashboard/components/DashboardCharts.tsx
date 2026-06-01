import { Card, CardContent } from "@components/ui";
import type { DashboardSummary } from "../types/dashboard.types";

interface DashboardChartsProps {
  summary?: DashboardSummary;
}

function BarRow({ label, count, max }: { label: string; count: number; max: number }) {
  const width = max > 0 ? Math.max(4, Math.round((count / max) * 100)) : 0;

  return (
    <div className="grid grid-cols-[56px_1fr_42px] items-center gap-3 text-sm">
      <span className="font-medium text-text-primary">{label}</span>
      <div className="h-2 overflow-hidden rounded-full bg-surface">
        <div className="h-full rounded-full bg-primary" style={{ width: `${width}%` }} />
      </div>
      <span className="text-right text-text-secondary">{count}</span>
    </div>
  );
}

export default function DashboardCharts({ summary }: DashboardChartsProps) {
  const bloodGroups = summary?.blood_group_distribution ?? [];
  const statuses = summary?.request_status_breakdown ?? [];
  const maxBloodGroup = Math.max(0, ...bloodGroups.map((item) => item.count));
  const maxStatus = Math.max(0, ...statuses.map((item) => item.count));

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <Card>
        <CardContent className="space-y-4">
          <div>
            <h2 className="text-base font-semibold text-text-primary">Donors by Blood Group</h2>
            <p className="text-sm text-text-secondary">Current donor distribution across blood groups.</p>
          </div>
          <div className="space-y-3">
            {bloodGroups.map((item) => (
              <BarRow key={item.blood_group} label={item.blood_group} count={item.count} max={maxBloodGroup} />
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4">
          <div>
            <h2 className="text-base font-semibold text-text-primary">Blood Request Status</h2>
            <p className="text-sm text-text-secondary">Operational request counts by status.</p>
          </div>
          <div className="space-y-3">
            {statuses.map((item) => (
              <BarRow key={item.status} label={item.status} count={item.count} max={maxStatus} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
