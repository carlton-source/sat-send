import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatStx, formatMicroStx, type FeeBreakdown } from "@/lib/fee-calculator";
import { Separator } from "@/components/ui/separator";
import { Calculator } from "lucide-react";

interface Props {
  fee: FeeBreakdown | null;
}

function Row({ label, stx, micro }: { label: string; stx: string; micro: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <div className="text-right">
        <span className="font-mono-tabular font-medium">{stx} STX</span>
        <span className="ml-2 font-mono-tabular text-xs text-muted-foreground">({micro} μSTX)</span>
      </div>
    </div>
  );
}