import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/layout/AppShell";
import { PageTransition } from "@/components/layout/PageTransition";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/dashboard/StatCard";
import { getPlatformStats, getUserStats, getTip, getRecentTips, getLeaderboard } from "@/services/mock-contract";
import { formatStx, formatMicroStx } from "@/lib/fee-calculator";
import { truncatePrincipal } from "@/services/mock-wallet";
import { MICRO_STX_PER_STX } from "@/lib/constants";
import { isValidStacksAddress } from "@/lib/validation";
import { formatDistanceToNow } from "date-fns";
import {
  Zap, TrendingUp, DollarSign, Users, Search, ArrowUpRight, ArrowDownLeft,
  Hash, SearchX, FileQuestion, Flame, UserCheck,
} from "lucide-react";

export default function Explore() {
  const [userInput, setUserInput] = useState("");
  const [tipInput, setTipInput] = useState("");
  const [searchPrincipal, setSearchPrincipal] = useState("");
  const [searchTipId, setSearchTipId] = useState<number | null>(null);

  const stats = useQuery({ queryKey: ["platform-stats"], queryFn: getPlatformStats });
  const recentTips = useQuery({ queryKey: ["recent-tips"], queryFn: getRecentTips });
  const activeUsers = useQuery({ queryKey: ["leaderboard-senders"], queryFn: () => getLeaderboard("senders") });

  const userStats = useQuery({
    queryKey: ["user-stats", searchPrincipal],
    queryFn: () => getUserStats(searchPrincipal),
    enabled: !!searchPrincipal,
  });

  const tipRecord = useQuery({
    queryKey: ["tip", searchTipId],
    queryFn: () => getTip(searchTipId!),
    enabled: searchTipId !== null,
  });