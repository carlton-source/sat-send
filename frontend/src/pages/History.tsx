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

export default function History() {
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

    return items;
  }, [history.data, directionFilter, sortOrder, searchQuery]);

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
                      <SelectContent>
                        <SelectItem value="newest">Newest</SelectItem>
                        <SelectItem value="oldest">Oldest</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {history.isLoading ? (
                  <div className="space-y-2">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                ) : filtered.length === 0 ? (
                  <div className="flex flex-col items-center gap-3 py-12 text-center">
                    <div className="rounded-full border-2 border-dashed border-muted-foreground/20 p-4">
                      <Inbox className="h-6 w-6 text-muted-foreground/40" />
                    </div>
                    <p className="text-sm font-medium text-muted-foreground">No transactions found</p>
                    <p className="text-xs text-muted-foreground/60">
                      {searchQuery || directionFilter !== "all"
                        ? "Try adjusting your filters"
                        : "Your transaction history will appear here"}
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Desktop table */}
                    <div className="hidden md:block">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-10"></TableHead>
                            <TableHead>Address</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Message</TableHead>
                            <TableHead className="text-right">Time</TableHead>
                            <TableHead className="w-10"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {paginated.map((tx) => (
                            <TableRow key={tx.id} className="group">
                              <TableCell>
                                {tx.direction === "sent" ? (
                                  <ArrowUpRight className="h-4 w-4 text-destructive" />
                                ) : (
                                  <ArrowDownLeft className="h-4 w-4 text-success" />
                                )}
                              </TableCell>
                              <TableCell>
                                <AddressHoverCard principal={tx.counterparty} />
                              </TableCell>
                              <TableCell>
                                <span className="font-mono-tabular text-sm font-semibold">
                                  {tx.direction === "sent" ? "−" : "+"}
                                  {formatStx(tx.amountMicroStx / MICRO_STX_PER_STX)} STX
                                </span>
                              </TableCell>
                              <TableCell className="max-w-[200px] truncate text-xs text-muted-foreground">
                                {tx.message || "—"}
                              </TableCell>
                              <TableCell className="text-right font-mono-tabular text-xs text-muted-foreground">
                                {formatDistanceToNow(tx.timestamp, { addSuffix: true })}
                              </TableCell>
                              <TableCell>
                                <a
                                  href={`${STACKS_EXPLORER_URL}/txid/${tx.txId}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="opacity-0 transition-opacity group-hover:opacity-100"
                                >
                                  <ExternalLink className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
                                </a>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    {/* Mobile cards */}
                    <div className="space-y-2 md:hidden">
                      {paginated.map((tx) => (
                        <div
                          key={tx.id}
                          className="flex items-center gap-3 rounded-lg bg-secondary/50 p-3"
                        >
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-background">
                            {tx.direction === "sent" ? (
                              <ArrowUpRight className="h-4 w-4 text-destructive" />
                            ) : (
                              <ArrowDownLeft className="h-4 w-4 text-success" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between">
                              <AddressHoverCard principal={tx.counterparty} />
                              <span className="font-mono-tabular text-sm font-semibold">
                                {tx.direction === "sent" ? "−" : "+"}
                                {formatStx(tx.amountMicroStx / MICRO_STX_PER_STX)}
                              </span>
                            </div>
                            <div className="flex items-center justify-between mt-0.5">
                              <span className="truncate text-xs text-muted-foreground pr-2">
                                {tx.message || "No message"}
                              </span>
                              <span className="shrink-0 text-[10px] text-muted-foreground/60">
                                {formatDistanceToNow(tx.timestamp, { addSuffix: true })}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-between border-t pt-4 mt-4">
                        <p className="text-xs text-muted-foreground">
                          Showing {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, filtered.length)} of {filtered.length}
                        </p>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            disabled={safePage <= 1}
                            onClick={() => setPage((p) => p - 1)}
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </Button>
                          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                            <Button
                              key={p}
                              variant={p === safePage ? "default" : "outline"}
                              size="icon"
                              className="h-8 w-8 text-xs"
                              onClick={() => setPage(p)}
                            >
                              {p}
                            </Button>
                          ))}
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            disabled={safePage >= totalPages}
                            onClick={() => setPage((p) => p + 1)}
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </PageTransition>
    </AppShell>
  );
}
