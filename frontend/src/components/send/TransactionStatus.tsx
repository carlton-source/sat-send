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