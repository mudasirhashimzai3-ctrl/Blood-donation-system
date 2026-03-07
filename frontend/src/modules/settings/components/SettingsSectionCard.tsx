import type { ReactNode } from "react";

import { Card, CardContent, CardHeader } from "@/components/ui";

interface SettingsSectionCardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export default function SettingsSectionCard({ title, subtitle, children }: SettingsSectionCardProps) {
  return (
    <Card>
      <CardHeader title={title} subtitle={subtitle} />
      <CardContent>{children}</CardContent>
    </Card>
  );
}
