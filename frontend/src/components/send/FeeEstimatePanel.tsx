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

export function FeeEstimatePanel({ fee }: Props) {
  if (!fee) {
    return (
      <Card className="shadow-layer-1">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Fee Estimate</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <div className="rounded-full border-2 border-dashed border-muted-foreground/20 p-3">
              <Calculator className="h-5 w-5 text-muted-foreground/40" />
            </div>
            <p className="text-sm text-muted-foreground">Enter an amount to see the fee breakdown</p>
          </div>
        </CardContent>
      </Card>
    );
  }