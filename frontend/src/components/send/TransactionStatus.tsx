import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, CheckCircle2, XCircle, Loader2, Clock } from "lucide-react";
import { STACKS_EXPLORER_URL } from "@/lib/constants";
import type { TxStatus } from "@/services/mock-contract";
import { cn } from "@/lib/utils";

interface Props {
  status: TxStatus;
  txId: string | null;
  error?: string;
  onReset: () => void;
}

const STATUS_CONFIG: Record<TxStatus, { label: string; icon: React.ElementType; color: string }> = {
  idle: { label: "Ready", icon: Clock, color: "text-muted-foreground" },
  signing: { label: "Awaiting Signature", icon: Loader2, color: "text-warning" },
  submitted: { label: "Submitted", icon: Loader2, color: "text-primary" },
  pending: { label: "Pending Confirmation", icon: Loader2, color: "text-primary" },
  confirmed: { label: "Confirmed", icon: CheckCircle2, color: "text-success" },
  failed: { label: "Failed", icon: XCircle, color: "text-destructive" },
};

export function TransactionStatus({ status, txId, error, onReset }: Props) {
  if (status === "idle") return null;

  const config = STATUS_CONFIG[status];
  const Icon = config.icon;
  const isSpinning = ["signing", "submitted", "pending"].includes(status);

  return (
    <Card className="shadow-layer-2 animate-slide-up">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Transaction Status</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div role="status" aria-live="polite" className="flex items-center gap-2">
          <Icon
            className={cn(
              "h-5 w-5",
              config.color,
              isSpinning && "animate-spin",
              status === "confirmed" && "animate-pulse-glow",
              status === "failed" && "animate-pulse-glow"
            )}
          />
          <span className={cn("text-sm font-semibold", config.color)}>{config.label}</span>
        </div>

        {txId && (
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Transaction ID</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 truncate rounded bg-secondary px-2 py-1 font-mono-tabular text-xs">
                {txId}
              </code>
              <a
                href={`${STACKS_EXPLORER_URL}/txid/${txId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary transition-colors hover:text-primary/80"
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        )}

        {error && (
          <div className="rounded-md bg-destructive/10 p-3 animate-fade-in">
            <p className="text-xs font-medium text-destructive">{error}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Please check your wallet connection and try again.
            </p>
          </div>
        )}

        {(status === "confirmed" || status === "failed") && (
          <Button variant="outline" size="sm" onClick={onReset} className="w-full">
            {status === "confirmed" ? "Send Another Tip" : "Try Again"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
