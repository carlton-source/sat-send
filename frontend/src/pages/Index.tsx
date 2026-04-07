import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Zap, Users, TrendingUp, DollarSign, RefreshCw, Send, X } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageTransition } from "@/components/layout/PageTransition";
import { StatCard } from "@/components/dashboard/StatCard";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getPlatformStats, getRecentTips } from "@/services/mock-contract";
import { formatStx, formatMicroStx } from "@/lib/fee-calculator";
import { MICRO_STX_PER_STX } from "@/lib/constants";

function useHeroDismissed() {
  const key = "satsend-hero-dismissed";
  const [dismissed, setDismissed] = useState(() => localStorage.getItem(key) === "1");
  const dismiss = () => {
    localStorage.setItem(key, "1");
    setDismissed(true);
  };
  return { dismissed, dismiss };
}

export default function Index() {
  const stats = useQuery({ queryKey: ["platform-stats"], queryFn: getPlatformStats });
  const tips = useQuery({ queryKey: ["recent-tips"], queryFn: getRecentTips });
  const { dismissed, dismiss } = useHeroDismissed();

  return (
    <AppShell>
      <PageTransition>
        <div className="container py-6">
          {/* Hero Banner */}
          {!dismissed && (
            <div className="relative mb-6 overflow-hidden rounded-lg border border-primary/20 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6">
              <button
                onClick={dismiss}
                className="absolute right-3 top-3 rounded-md p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                aria-label="Dismiss"
              >
                <X className="h-4 w-4" />
              </button>
              <div className="flex items-start gap-4">
                <div className="hidden shrink-0 rounded-xl bg-primary/10 p-3 sm:block">
                  <Zap className="h-7 w-7 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold tracking-tight">Welcome to SatSend</h2>
                  <p className="mt-1 max-w-lg text-sm text-muted-foreground">
                    Send STX micro-tips to any Stacks address. Reward contributors, tip creators, or say thanks — all on-chain with transparent fees.
                  </p>
                  <Button asChild size="sm" className="mt-3 gap-2">
                    <Link to="/send">
                      <Send className="h-3.5 w-3.5" />
                      Send Your First Tip
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold tracking-tight">Dashboard</h1>
              <p className="text-sm text-muted-foreground">Protocol overview and recent activity</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                stats.refetch();
                tips.refetch();
              }}
              className="gap-1.5 text-xs"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Refresh
            </Button>
          </div>

          {/* Stats Grid */}
          <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {[
              { label: "Total Tips", value: stats.data ? stats.data.totalTips.toLocaleString() : "—", icon: Zap, delay: "stagger-1" },
              { label: "Total Volume", value: stats.data ? `${formatStx(stats.data.totalVolumeMicroStx / MICRO_STX_PER_STX)} STX` : "—", subtitle: stats.data ? `${formatMicroStx(stats.data.totalVolumeMicroStx)} μSTX` : undefined, icon: TrendingUp, delay: "stagger-2" },
              { label: "Fees Collected", value: stats.data ? `${formatStx(stats.data.totalFeesMicroStx / MICRO_STX_PER_STX)} STX` : "—", icon: DollarSign, delay: "stagger-3" },
              { label: "Active Tippers", value: stats.data ? stats.data.activeTippers.toLocaleString() : "—", icon: Users, delay: "stagger-4" },
            ].map((card) => (
              <StatCard
                key={card.label}
                label={card.label}
                value={card.value}
                subtitle={card.subtitle}
                icon={card.icon}
                isLoading={stats.isLoading}
                className={`animate-slide-up ${card.delay}`}
              />
            ))}
          </div>

          {/* Content Grid */}
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 animate-slide-up stagger-5">
              <RecentActivity tips={tips.data ?? []} isLoading={tips.isLoading} />
            </div>

            <div className="space-y-4 animate-slide-up stagger-6">
              <Card className="overflow-hidden border-primary/20 shadow-layer-2 transition-all duration-300 hover:shadow-layer-3 hover:border-primary/40">
                <div className="h-1 bg-gradient-to-r from-primary to-primary/50" />
                <CardContent className="p-5">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Send className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-base font-semibold">Send a Tip</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Send STX micro-tips to any Stacks address with an optional message.
                  </p>
                  <Button asChild className="mt-4 w-full gap-2" size="sm">
                    <Link to="/send">
                      <Zap className="h-3.5 w-3.5" />
                      Start Tipping
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              <div className="text-center">
                <p className="font-mono-tabular text-xs text-muted-foreground">
                  Last synced: {stats.dataUpdatedAt ? new Date(stats.dataUpdatedAt).toLocaleTimeString() : "—"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </PageTransition>
    </AppShell>
  );
}
