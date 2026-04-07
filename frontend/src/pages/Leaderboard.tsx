import { useQuery } from "@tanstack/react-query";
import { Trophy, Medal } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageTransition } from "@/components/layout/PageTransition";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { getLeaderboard, type LeaderboardEntry } from "@/services/mock-contract";
import { truncatePrincipal } from "@/services/mock-wallet";
import { Link } from "react-router-dom";

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return <Trophy className="h-5 w-5 text-yellow-500" />;
  if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />;
  if (rank === 3) return <Medal className="h-5 w-5 text-amber-600" />;
  return <span className="flex h-5 w-5 items-center justify-center text-xs font-semibold text-muted-foreground">{rank}</span>;
}

function formatStx(microStx: number) {
  return (microStx / 1_000_000).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

function LeaderboardTable({ data, isLoading }: { data?: LeaderboardEntry[]; isLoading: boolean }) {
  if (isLoading) {
    return (
      <div className="space-y-3 p-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (!data?.length) {
    return (
      <div className="flex flex-col items-center gap-2 py-12 text-muted-foreground">
        <Trophy className="h-10 w-10 opacity-40" />
        <p className="text-sm">No leaderboard data yet</p>
      </div>
    );
  }

  return (
    <>
      {/* Desktop table */}
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Rank</TableHead>
              <TableHead>Address</TableHead>
              <TableHead className="text-right">Total STX</TableHead>
              <TableHead className="text-right">Tips</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((entry) => (
              <TableRow key={entry.rank} className={entry.rank <= 3 ? "bg-accent/30" : ""}>
                <TableCell>
                  <div className="flex items-center justify-center">
                    <RankBadge rank={entry.rank} />
                  </div>
                </TableCell>
                <TableCell><Link to={`/profile/${entry.principal}`} className="font-mono text-xs hover:underline">{truncatePrincipal(entry.principal)}</Link></TableCell>
                <TableCell className="text-right font-mono-tabular font-semibold">{formatStx(entry.totalMicroStx)}</TableCell>
                <TableCell className="text-right text-muted-foreground">{entry.tipCount}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile cards */}
      <div className="space-y-2 p-4 md:hidden">
        {data.map((entry) => (
          <div
            key={entry.rank}
            className={`flex items-center gap-3 rounded-lg border p-3 ${entry.rank <= 3 ? "bg-accent/30 border-accent" : "bg-card"}`}
          >
            <RankBadge rank={entry.rank} />
            <div className="flex-1 min-w-0">
              <Link to={`/profile/${entry.principal}`} className="truncate font-mono text-xs hover:underline block">{truncatePrincipal(entry.principal)}</Link>
              <p className="text-xs text-muted-foreground">{entry.tipCount} tips</p>
            </div>
            <p className="font-mono-tabular text-sm font-semibold">{formatStx(entry.totalMicroStx)} STX</p>
          </div>
        ))}
      </div>
    </>
  );
}

export default function Leaderboard() {
  const senders = useQuery({ queryKey: ["leaderboard", "senders"], queryFn: () => getLeaderboard("senders") });
  const recipients = useQuery({ queryKey: ["leaderboard", "recipients"], queryFn: () => getLeaderboard("recipients") });

  return (
    <AppShell>
      <PageTransition>
        <div className="container max-w-3xl py-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <Trophy className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Leaderboard</h1>
              <p className="text-sm text-muted-foreground">Top contributors in the SatSend community</p>
            </div>
          </div>

          <Card>
            <Tabs defaultValue="senders">
              <CardHeader className="pb-0">
                <TabsList className="w-full">
                  <TabsTrigger value="senders" className="flex-1">Top Tippers</TabsTrigger>
                  <TabsTrigger value="recipients" className="flex-1">Most Tipped</TabsTrigger>
                </TabsList>
              </CardHeader>
              <CardContent className="p-0 pt-2">
                <TabsContent value="senders" className="mt-0">
                  <LeaderboardTable data={senders.data} isLoading={senders.isLoading} />
                </TabsContent>
                <TabsContent value="recipients" className="mt-0">
                  <LeaderboardTable data={recipients.data} isLoading={recipients.isLoading} />
                </TabsContent>
              </CardContent>
            </Tabs>
          </Card>
        </div>
      </PageTransition>
    </AppShell>
  );
}
