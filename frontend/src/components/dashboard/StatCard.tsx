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