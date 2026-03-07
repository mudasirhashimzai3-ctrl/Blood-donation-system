import { ShieldAlert } from "lucide-react";

import { Card, CardContent } from "@/components/ui";

interface DashboardAccessNoticeProps {
  message?: string;
}

export default function DashboardAccessNotice({
  message = "Access restricted for this dashboard section.",
}: DashboardAccessNoticeProps) {
  return (
    <Card variant="outlined" className="border-warning/50 bg-warning-soft/40">
      <CardContent className="mt-0 flex items-center gap-2 text-sm text-text-secondary">
        <ShieldAlert className="h-4 w-4 text-warning" />
        <span>{message}</span>
      </CardContent>
    </Card>
  );
}
