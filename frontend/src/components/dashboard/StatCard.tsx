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