import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Trophy, Medal, Send, ArrowUpRight, ArrowDownLeft, Copy, Check, User } from "lucide-react";
import { useState } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AppShell } from "@/components/layout/AppShell";
import { PageTransition } from "@/components/layout/PageTransition";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getUserStats, getTransactionHistory, getLeaderboard, type HistoryRecord } from "@/services/mock-contract";
import { truncatePrincipal } from "@/services/mock-wallet";
import { toast } from "@/hooks/use-toast";

function formatStx(microStx: number) {
  return (microStx / 1_000_000).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

function formatTime(ts: number) {
  const diff = Date.now() - ts;
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return `${Math.floor(diff / 86400000)}d ago`;
}

function RankBadge({ rank }: { rank: number | null }) {
  if (!rank) return null;
  if (rank === 1) return <Trophy className="h-4 w-4 text-yellow-500" />;
  if (rank === 2) return <Medal className="h-4 w-4 text-gray-400" />;
  if (rank === 3) return <Medal className="h-4 w-4 text-amber-600" />;
  return <Badge variant="secondary" className="text-xs">#{rank}</Badge>;
}

export default function UserProfile() {
  const { principal } = useParams<{ principal: string }>();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const stats = useQuery({
    queryKey: ["userStats", principal],
    queryFn: () => getUserStats(principal!),
    enabled: !!principal,
  });

  const history = useQuery({
    queryKey: ["userHistory", principal],
    queryFn: () => getTransactionHistory(principal!),
    enabled: !!principal,
  });

  const senderRank = useQuery({
    queryKey: ["leaderboard", "senders"],
    queryFn: () => getLeaderboard("senders"),
    select: (data) => data.find((e) => e.principal === principal)?.rank ?? null,
  });

  const recipientRank = useQuery({
    queryKey: ["leaderboard", "recipients"],
    queryFn: () => getLeaderboard("recipients"),
    select: (data) => data.find((e) => e.principal === principal)?.rank ?? null,
  });

  function copyAddress() {
    if (!principal) return;
    navigator.clipboard.writeText(principal);
    setCopied(true);
    toast({ title: "Address copied" });
    setTimeout(() => setCopied(false), 2000);
  }

  if (!principal) {
    return (
      <AppShell>
        <PageTransition>
          <div className="container max-w-3xl py-16 text-center">
            <User className="mx-auto h-12 w-12 text-muted-foreground/40" />
            <p className="mt-4 text-muted-foreground">Invalid address</p>
          </div>
        </PageTransition>
      </AppShell>
    );
  }

  const notFound = stats.data === null && !stats.isLoading;

  return (
    <AppShell>
      <PageTransition>
        <div className="container max-w-3xl py-8">
          {/* Header */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <User className="h-6 w-6 text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-mono text-base font-semibold sm:text-lg" title={principal}>
                    {truncatePrincipal(principal)}
                  </h1>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button onClick={copyAddress} className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-secondary">
                          {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="max-w-xs">
                        <p className="font-mono text-xs break-all">{principal}</p>
                        <p className="text-xs text-muted-foreground mt-1">{copied ? "Copied!" : "Click to copy"}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  {senderRank.data && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <RankBadge rank={senderRank.data} />
                      <span>Tipper</span>
                    </div>
                  )}
                  {recipientRank.data && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <RankBadge rank={recipientRank.data} />
                      <span>Recipient</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <Button onClick={() => navigate(`/send?to=${principal}`)} className="gap-2">
              <Send className="h-4 w-4" />
              Tip This User
            </Button>
          </div>

          {notFound ? (
            <Card>
              <CardContent className="flex flex-col items-center gap-2 py-12 text-center">
                <User className="h-10 w-10 text-muted-foreground/40" />
                <p className="text-muted-foreground">No activity found for this address</p>
                <Button variant="outline" onClick={() => navigate(`/send?to=${principal}`)} className="mt-2 gap-2">
                  <Send className="h-4 w-4" />
                  Send them their first tip
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Stats */}
              <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {stats.isLoading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <Card key={i}><CardContent className="p-4"><Skeleton className="h-10 w-full" /></CardContent></Card>
                  ))
                ) : stats.data ? (
                  <>
                    <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Tips Sent</p><p className="text-xl font-bold">{stats.data.tipsSent}</p></CardContent></Card>
                    <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Tips Received</p><p className="text-xl font-bold">{stats.data.tipsReceived}</p></CardContent></Card>
                    <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Total Sent</p><p className="text-xl font-bold font-mono-tabular">{formatStx(stats.data.totalSentMicroStx)}<span className="ml-1 text-xs font-normal text-muted-foreground">STX</span></p></CardContent></Card>
                    <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Total Received</p><p className="text-xl font-bold font-mono-tabular">{formatStx(stats.data.totalReceivedMicroStx)}<span className="ml-1 text-xs font-normal text-muted-foreground">STX</span></p></CardContent></Card>
                  </>
                ) : null}
              </div>

              {/* History */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Transaction History</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {history.isLoading ? (
                    <div className="space-y-3 p-4">
                      {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
                    </div>
                  ) : !history.data?.length ? (
                    <p className="p-6 text-center text-sm text-muted-foreground">No transactions yet</p>
                  ) : (
                    <>
                      {/* Desktop */}
                      <div className="hidden md:block">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-20">Type</TableHead>
                              <TableHead>Counterparty</TableHead>
                              <TableHead className="text-right">Amount</TableHead>
                              <TableHead className="text-right">Time</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {history.data.map((tx: HistoryRecord) => (
                              <TableRow key={tx.id}>
                                <TableCell>
                                  <Badge variant={tx.direction === "sent" ? "secondary" : "default"} className="gap-1 text-xs">
                                    {tx.direction === "sent" ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownLeft className="h-3 w-3" />}
                                    {tx.direction === "sent" ? "Sent" : "Received"}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <Link to={`/profile/${tx.counterparty}`} className="font-mono text-xs hover:underline">
                                    {truncatePrincipal(tx.counterparty)}
                                  </Link>
                                </TableCell>
                                <TableCell className="text-right font-mono-tabular font-semibold">{formatStx(tx.amountMicroStx)} STX</TableCell>
                                <TableCell className="text-right text-xs text-muted-foreground">{formatTime(tx.timestamp)}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                      {/* Mobile */}
                      <div className="space-y-2 p-4 md:hidden">
                        {history.data.map((tx: HistoryRecord) => (
                          <div key={tx.id} className="flex items-center gap-3 rounded-lg border p-3 bg-card">
                            <div className={`flex h-8 w-8 items-center justify-center rounded-full ${tx.direction === "sent" ? "bg-secondary" : "bg-primary/10"}`}>
                              {tx.direction === "sent" ? <ArrowUpRight className="h-4 w-4 text-muted-foreground" /> : <ArrowDownLeft className="h-4 w-4 text-primary" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <Link to={`/profile/${tx.counterparty}`} className="truncate font-mono text-xs hover:underline block">
                                {truncatePrincipal(tx.counterparty)}
                              </Link>
                              <p className="text-xs text-muted-foreground">{formatTime(tx.timestamp)}</p>
                            </div>
                            <p className="font-mono-tabular text-sm font-semibold">{formatStx(tx.amountMicroStx)} STX</p>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </PageTransition>
    </AppShell>
  );
}
