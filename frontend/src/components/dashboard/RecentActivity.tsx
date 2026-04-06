import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { truncatePrincipal } from "@/services/mock-wallet";
import { formatStx } from "@/lib/fee-calculator";
import { MICRO_STX_PER_STX } from "@/lib/constants";
import type { RecentTip } from "@/services/mock-contract";
import { ArrowRight, MessageSquare, Inbox } from "lucide-react";