import { Card, CardContent } from "@/components/ui";

interface KpiItem {
  label: string;
  value: string | number;
  hint?: string;
  onClick?: () => void;
}

interface ReportsKpiGridProps {
  items: KpiItem[];
}

export default function ReportsKpiGrid({ items }: ReportsKpiGridProps) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <Card
          key={item.label}
          hover={Boolean(item.onClick)}
          role={item.onClick ? "button" : undefined}
          tabIndex={item.onClick ? 0 : undefined}
          onClick={item.onClick}
          onKeyDown={(event) => {
            if (!item.onClick || (event.key !== "Enter" && event.key !== " ")) return;
            event.preventDefault();
            item.onClick();
          }}
        >
          <CardContent className="mt-0">
            <p className="text-xs uppercase tracking-wide text-text-secondary">{item.label}</p>
            <p className="mt-2 text-2xl font-semibold text-text-primary">{item.value}</p>
            {item.hint ? <p className="mt-1 text-xs text-text-secondary">{item.hint}</p> : null}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
