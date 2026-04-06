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