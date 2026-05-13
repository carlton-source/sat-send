import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { AddressHoverCard } from "@/components/history/AddressHoverCard";
import { AppShell } from "@/components/layout/AppShell";
import { PageTransition } from "@/components/layout/PageTransition";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useWalletStore } from "@/services/mock-wallet";
import { getTransactionHistory } from "@/services/mock-contract";
import { formatStx } from "@/lib/fee-calculator";
import { MICRO_STX_PER_STX, STACKS_EXPLORER_URL } from "@/lib/constants";
import { formatDistanceToNow } from "date-fns";
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Search,
  ExternalLink,
  Inbox,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

type DirectionFilter = "all" | "sent" | "received";
type SortOrder = "newest" | "oldest";

const PAGE_SIZE = 8;

  const { isConnected, principal, connect, isConnecting } = useWalletStore();
  const [directionFilter, setDirectionFilter] = useState<DirectionFilter>("all");
  const [sortOrder, setSortOrder] = useState<SortOrder>("newest");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);

  const history = useQuery({
    queryKey: ["tx-history", principal],
    queryFn: () => getTransactionHistory(principal!),
    enabled: isConnected && !!principal,
  });

  const filtered = useMemo(() => {
    if (!history.data) return [];
    let items = [...history.data];

    if (directionFilter !== "all") {
      items = items.filter((t) => t.direction === directionFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      items = items.filter(
        (t) =>
          t.counterparty.toLowerCase().includes(q) ||
          t.message.toLowerCase().includes(q)
      );
    }

    items.sort((a, b) =>
      sortOrder === "newest" ? b.timestamp - a.timestamp : a.timestamp - b.timestamp
    );

  // Reset page when filters change
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  if (safePage !== page) setPage(safePage);

  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  return (
    <AppShell>
      <PageTransition>
        <div className="container py-6">
          <div className="mb-6">
            <h1 className="text-xl font-semibold tracking-tight">Transaction History</h1>
            <p className="text-sm text-muted-foreground">View your past sent and received tips</p>
          </div>

          {!isConnected ? (
            <Card className="shadow-layer-2">
              <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
                <div className="rounded-full bg-secondary p-4">
                  <Wallet className="h-6 w-6 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium">Connect your wallet</p>
                  <p className="text-sm text-muted-foreground">
                    Connect your wallet to view transaction history
                  </p>
                </div>
                <Button onClick={connect} disabled={isConnecting} className="gap-2">
                  <Wallet className="h-4 w-4" />
                  {isConnecting ? "Connecting…" : "Connect Wallet"}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card className="shadow-layer-2">
              <CardHeader className="pb-3">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <CardTitle className="text-sm font-medium">Transactions</CardTitle>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1 sm:w-48">
                      <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="Search address…"
                        className="h-8 pl-8 text-xs"
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          setPage(1);
                        }}
                      />
                    </div>
                    <Select
                      value={directionFilter}
                      onValueChange={(v) => {
                        setDirectionFilter(v as DirectionFilter);
                        setPage(1);
                      }}
                    >
                      <SelectTrigger className="h-8 w-28 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="sent">Sent</SelectItem>
                        <SelectItem value="received">Received</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select
                      value={sortOrder}
                      onValueChange={(v) => {
                        setSortOrder(v as SortOrder);
                        setPage(1);
                      }}
                    >
                      <SelectTrigger className="h-8 w-28 text-xs">
                        <SelectValue />
                      </SelectTrigger>
