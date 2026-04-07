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

  return (
    <AppShell>
      <PageTransition>
        <div className="container py-6">
          <div className="mb-6">
            <h1 className="text-xl font-semibold tracking-tight">Explore</h1>
            <p className="text-sm text-muted-foreground">Protocol stats, active users, trending tips, and lookups</p>
          </div>

          <Tabs defaultValue="stats">
            <TabsList className="mb-4">
              <TabsTrigger value="stats">Protocol Stats</TabsTrigger>
              <TabsTrigger value="directory">Active Users</TabsTrigger>
              <TabsTrigger value="trending">Trending Tips</TabsTrigger>
              <TabsTrigger value="user">User Lookup</TabsTrigger>
              <TabsTrigger value="tip">Tip Lookup</TabsTrigger>
            </TabsList>

            {/* Protocol Stats Tab */}
            <TabsContent value="stats">
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                <StatCard label="Total Tips" value={stats.data ? stats.data.totalTips.toLocaleString() : "—"} icon={Zap} isLoading={stats.isLoading} className="animate-slide-up stagger-1" />
                <StatCard label="Total Volume" value={stats.data ? `${formatStx(stats.data.totalVolumeMicroStx / MICRO_STX_PER_STX)} STX` : "—"} subtitle={stats.data ? `${formatMicroStx(stats.data.totalVolumeMicroStx)} μSTX` : undefined} icon={TrendingUp} isLoading={stats.isLoading} className="animate-slide-up stagger-2" />
                <StatCard label="Fees Collected" value={stats.data ? `${formatStx(stats.data.totalFeesMicroStx / MICRO_STX_PER_STX)} STX` : "—"} subtitle={stats.data ? `${formatMicroStx(stats.data.totalFeesMicroStx)} μSTX` : undefined} icon={DollarSign} isLoading={stats.isLoading} className="animate-slide-up stagger-3" />
                <StatCard label="Active Tippers" value={stats.data ? stats.data.activeTippers.toLocaleString() : "—"} icon={Users} isLoading={stats.isLoading} className="animate-slide-up stagger-4" />
              </div>
            </TabsContent>

            {/* Active Users Directory */}
            <TabsContent value="directory">
              <Card className="shadow-layer-2 animate-fade-in">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <UserCheck className="h-4 w-4 text-primary" />
                    <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                  </div>
                  <p className="text-xs text-muted-foreground">Top contributors by tip volume</p>
                </CardHeader>
                <CardContent>
                  {activeUsers.isLoading ? (
                    <div className="space-y-2">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Skeleton key={i} className="h-14 w-full" />
                      ))}
                    </div>
                  ) : activeUsers.data ? (
                    <div className="space-y-2">
                      {activeUsers.data.map((user) => (
                        <Link
                          key={user.principal}
                          to={`/profile/${user.principal}`}
                          className="flex items-center gap-3 rounded-lg bg-secondary/50 p-3 transition-colors hover:bg-secondary"
                        >
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-background font-mono-tabular text-xs font-bold text-muted-foreground">
                            {user.rank <= 3 ? (
                              <span className={
                                user.rank === 1 ? "text-yellow-500" :
                                user.rank === 2 ? "text-slate-400" :
                                "text-amber-600"
                              }>
                                #{user.rank}
                              </span>
                            ) : (
                              <span>#{user.rank}</span>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-mono-tabular text-xs">{truncatePrincipal(user.principal)}</p>
                            <p className="text-xs text-muted-foreground">
                              {user.tipCount} tips · {formatStx(user.totalMicroStx / MICRO_STX_PER_STX)} STX
                            </p>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            View Profile
                          </Badge>
                        </Link>
                      ))}
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Trending Tips */}
            <TabsContent value="trending">
              <Card className="shadow-layer-2 animate-fade-in">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Flame className="h-4 w-4 text-primary" />
                    <CardTitle className="text-sm font-medium">Trending Tips</CardTitle>
                  </div>
                  <p className="text-xs text-muted-foreground">Recently sent tips across the platform</p>
                </CardHeader>
                <CardContent>
                  {recentTips.isLoading ? (
                    <div className="space-y-2">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Skeleton key={i} className="h-16 w-full" />
                      ))}
                    </div>
                  ) : recentTips.data ? (
                    <div className="space-y-2">
                      {recentTips.data.map((tip) => (
                        <div
                          key={tip.id}
                          className="flex items-start gap-3 rounded-lg bg-secondary/50 p-3"
                        >
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-background">
                            <ArrowUpRight className="h-4 w-4 text-primary" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 text-xs">
                              <Link to={`/profile/${tip.sender}`} className="font-mono-tabular hover:underline underline-offset-2">
                                {truncatePrincipal(tip.sender)}
                              </Link>
                              <span className="text-muted-foreground">→</span>
                              <Link to={`/profile/${tip.recipient}`} className="font-mono-tabular hover:underline underline-offset-2">
                                {truncatePrincipal(tip.recipient)}
                              </Link>
                            </div>
                            {tip.message && (
                              <p className="mt-0.5 truncate text-xs text-muted-foreground">{tip.message}</p>
                            )}
                            <p className="mt-0.5 text-[10px] text-muted-foreground/60">
                              {formatDistanceToNow(tip.timestamp, { addSuffix: true })}
                            </p>
                          </div>
                          <span className="shrink-0 font-mono-tabular text-sm font-semibold">
                            {formatStx(tip.amountMicroStx / MICRO_STX_PER_STX)} STX
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            </TabsContent>

            {/* User Lookup Tab */}
            <TabsContent value="user">
              <Card className="shadow-layer-2 animate-fade-in">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">User Lookup</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter Stacks principal address…"
                      className="flex-1 font-mono-tabular text-xs"
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                    />
                    <Button
                      size="sm"
                      onClick={() => {
                        if (isValidStacksAddress(userInput)) setSearchPrincipal(userInput);
                      }}
                      disabled={!isValidStacksAddress(userInput)}
                      className="gap-1.5"
                    >
                      <Search className="h-3.5 w-3.5" />
                      Search
                    </Button>
                  </div>

                  {userStats.isLoading && (
                    <div className="grid grid-cols-2 gap-3">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton key={i} className="h-20 rounded-lg" />
                      ))}
                    </div>
                  )}

                  {userStats.data && (
                    <div className="grid grid-cols-2 gap-3 animate-fade-in">
                      <div className="rounded-lg bg-secondary p-4">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <ArrowUpRight className="h-3 w-3" />
                          Tips Sent
                        </div>
                        <p className="mt-1 font-mono-tabular text-xl font-semibold">{userStats.data.tipsSent}</p>
                        <p className="font-mono-tabular text-xs text-muted-foreground">
                          {formatStx(userStats.data.totalSentMicroStx / MICRO_STX_PER_STX)} STX
                        </p>
                      </div>
                      <div className="rounded-lg bg-secondary p-4">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <ArrowDownLeft className="h-3 w-3" />
                          Tips Received
                        </div>
                        <p className="mt-1 font-mono-tabular text-xl font-semibold">{userStats.data.tipsReceived}</p>
                        <p className="font-mono-tabular text-xs text-muted-foreground">
                          {formatStx(userStats.data.totalReceivedMicroStx / MICRO_STX_PER_STX)} STX
                        </p>
                      </div>
                    </div>
                  )}

                  {searchPrincipal && !userStats.isLoading && !userStats.data && (
                    <div className="flex flex-col items-center gap-3 py-8 text-center animate-fade-in">
                      <div className="rounded-full border-2 border-dashed border-muted-foreground/20 p-4">
                        <SearchX className="h-6 w-6 text-muted-foreground/40" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">No data found</p>
                        <p className="mt-0.5 text-xs text-muted-foreground/60">This address hasn't sent or received any tips yet</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tip Lookup Tab */}
            <TabsContent value="tip">
              <Card className="shadow-layer-2 animate-fade-in">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Tip Lookup</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="Enter Tip ID…"
                      className="flex-1 font-mono-tabular"
                      value={tipInput}
                      onChange={(e) => setTipInput(e.target.value)}
                    />
                    <Button
                      size="sm"
                      onClick={() => {
                        const id = parseInt(tipInput);
                        if (id > 0) setSearchTipId(id);
                      }}
                      disabled={!tipInput || parseInt(tipInput) <= 0}
                      className="gap-1.5"
                    >
                      <Search className="h-3.5 w-3.5" />
                      Search
                    </Button>
                  </div>

                  {tipRecord.isLoading && (
                    <div className="space-y-2">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Skeleton key={i} className="h-5 w-full" />
                      ))}
                    </div>
                  )}

                  {tipRecord.data && (
                    <div className="space-y-3 rounded-lg bg-secondary p-4 animate-fade-in">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="font-mono-tabular">
                          <Hash className="mr-1 h-3 w-3" />
                          {tipRecord.data.id}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          Block {tipRecord.data.blockHeight.toLocaleString()}
                        </span>
                      </div>
                      <div className="grid gap-2 text-sm">
                        <div>
                          <span className="text-xs text-muted-foreground">Sender</span>
                          <p className="font-mono-tabular text-xs">{tipRecord.data.sender}</p>
                        </div>
                        <div>
                          <span className="text-xs text-muted-foreground">Recipient</span>
                          <p className="font-mono-tabular text-xs">{tipRecord.data.recipient}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <span className="text-xs text-muted-foreground">Amount</span>
                            <p className="font-mono-tabular font-semibold">
                              {formatStx(tipRecord.data.amountMicroStx / MICRO_STX_PER_STX)} STX
                            </p>
                          </div>
                          <div>
                            <span className="text-xs text-muted-foreground">Fee</span>
                            <p className="font-mono-tabular">
                              {formatStx(tipRecord.data.feeMicroStx / MICRO_STX_PER_STX)} STX
                            </p>
                          </div>
                        </div>
                        {tipRecord.data.message && (
                          <div>
                            <span className="text-xs text-muted-foreground">Message</span>
                            <p className="text-sm">{tipRecord.data.message}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {searchTipId !== null && !tipRecord.isLoading && !tipRecord.data && (
                    <div className="flex flex-col items-center gap-3 py-8 text-center animate-fade-in">
                      <div className="rounded-full border-2 border-dashed border-muted-foreground/20 p-4">
                        <FileQuestion className="h-6 w-6 text-muted-foreground/40" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Tip not found</p>
                        <p className="mt-0.5 text-xs text-muted-foreground/60">No tip exists with this ID — try a different number</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </PageTransition>
    </AppShell>
  );
}
