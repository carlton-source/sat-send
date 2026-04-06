import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Skeleton } from "@/components/ui/skeleton";
import { getUserStats } from "@/services/mock-contract";
import { truncatePrincipal } from "@/services/mock-wallet";
import { formatStx } from "@/lib/fee-calculator";
import { MICRO_STX_PER_STX } from "@/lib/constants";
import { ArrowUpRight, ArrowDownLeft, ExternalLink } from "lucide-react";

interface AddressHoverCardProps {
  principal: string;
  children?: React.ReactNode;
}

export function AddressHoverCard({ principal, children }: AddressHoverCardProps) {
  const stats = useQuery({
    queryKey: ["user-stats-hover", principal],
    queryFn: () => getUserStats(principal),
    staleTime: 60_000,
  });

  return (
    <HoverCard openDelay={300} closeDelay={100}>
      <HoverCardTrigger asChild>
        <Link
          to={`/profile/${principal}`}
          className="font-mono-tabular text-xs underline-offset-2 hover:underline hover:text-foreground transition-colors"
        >
          {children ?? truncatePrincipal(principal)}
        </Link>
      </HoverCardTrigger>
      <HoverCardContent side="top" className="w-64 p-3">
        <div className="space-y-2">
          <p className="font-mono-tabular text-xs text-muted-foreground break-all leading-relaxed">
            {principal}
          </p>
          {stats.isLoading ? (
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ) : stats.data ? (
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-1.5">
                <ArrowUpRight className="h-3 w-3 text-destructive" />
                <div>
                  <p className="text-muted-foreground">Sent</p>
                  <p className="font-semibold font-mono-tabular">
                    {formatStx(stats.data.totalSentMicroStx / MICRO_STX_PER_STX)} STX
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <ArrowDownLeft className="h-3 w-3 text-success" />
                <div>
                  <p className="text-muted-foreground">Received</p>
                  <p className="font-semibold font-mono-tabular">
                    {formatStx(stats.data.totalReceivedMicroStx / MICRO_STX_PER_STX)} STX
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">No stats available</p>
          )}
          <Link
            to={`/profile/${principal}`}
            className="flex items-center gap-1 text-xs text-primary hover:underline"
          >
            View profile <ExternalLink className="h-3 w-3" />
          </Link>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
