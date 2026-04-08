import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { truncatePrincipal } from "@/services/mock-wallet";
import { formatStx } from "@/lib/fee-calculator";
import { MICRO_STX_PER_STX } from "@/lib/constants";
import type { RecentTip } from "@/services/mock-contract";
import { ArrowRight, MessageSquare, Inbox } from "lucide-react";

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

interface Props {
  tips: RecentTip[];
  isLoading: boolean;
}

export function RecentActivity({ tips, isLoading }: Props) {
  return (
    <Card className="shadow-layer-2">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="space-y-0 p-0">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 border-t px-4 py-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-3 w-40" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-4 w-16" />
              </div>
            ))
          : tips.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-10 text-center">
                <div className="rounded-full border-2 border-dashed border-muted-foreground/20 p-4">
                  <Inbox className="h-6 w-6 text-muted-foreground/40" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">No activity yet</p>
                  <p className="mt-0.5 text-xs text-muted-foreground/60">Tips will appear here as they happen</p>
                </div>
              </div>
            )
          : tips.map((tip, i) => (
              <div
                key={tip.id}
                className="flex items-center gap-3 border-t px-4 py-3 transition-all duration-200 hover:bg-secondary/30 animate-fade-in"
                style={{ animationDelay: `${i * 50}ms` }}
              ></div>