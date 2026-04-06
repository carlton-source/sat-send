import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { type LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  isLoading?: boolean;
  className?: string;
}

export function StatCard({ label, value, subtitle, icon: Icon, isLoading, className }: StatCardProps) {
  return (
    <Card
      className={cn(
        "shadow-layer-2 transition-all duration-300 ease-out hover:shadow-layer-3 hover:scale-[1.02] hover:-translate-y-0.5 hover:border-primary/20",
        className
      )}
    >
      <CardContent className="flex items-start justify-between p-4">
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          {isLoading ? (
            <Skeleton className="h-7 w-24" />
          ) : (
            <p className="font-mono-tabular text-2xl font-semibold tracking-tight">{value}</p>
          )}
          {subtitle && !isLoading && (
            <p className="font-mono-tabular text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>
        <div className="rounded-md bg-primary/10 p-2">
          <Icon className="h-4 w-4 text-primary" />
        </div>
      </CardContent>
    </Card>
  );
}
