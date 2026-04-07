import { useState, useMemo, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useSearchParams } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { AppShell } from "@/components/layout/AppShell";
import { PageTransition } from "@/components/layout/PageTransition";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FeeEstimatePanel } from "@/components/send/FeeEstimatePanel";
import { TransactionStatus } from "@/components/send/TransactionStatus";
import { sendTipSchema, type SendTipFormData } from "@/lib/validation";
import { calculateFee, formatStx } from "@/lib/fee-calculator";
import { MAX_MESSAGE_LENGTH, MICRO_STX_PER_STX } from "@/lib/constants";
import { useWalletStore } from "@/services/mock-wallet";
import { sendTipTransaction, pollTxStatus, type TxStatus } from "@/services/mock-contract";
import { toast } from "@/hooks/use-toast";
import { Send, AlertTriangle, Wallet } from "lucide-react";
import { RecipientInput } from "@/components/send/RecipientInput";
import { useRecentRecipients } from "@/hooks/use-recent-recipients";

export default function SendTip() {
  const [searchParams] = useSearchParams();
  const { isConnected, principal, connect, isConnecting } = useWalletStore();
  const { addRecipient } = useRecentRecipients();
  const [showConfirm, setShowConfirm] = useState(false);
  const [txStatus, setTxStatus] = useState<TxStatus>("idle");
  const [txId, setTxId] = useState<string | null>(null);
  const [txError, setTxError] = useState<string | undefined>();

  const form = useForm<SendTipFormData>({
    resolver: zodResolver(sendTipSchema),
    defaultValues: { recipient: "", amount: undefined as unknown as number, message: "" },
    mode: "onChange",
  });

  useEffect(() => {
    const prefill = searchParams.get("to");
    if (prefill) {
      form.setValue("recipient", prefill, { shouldValidate: true });
    }
  }, [searchParams, form]);

  const watchAmount = form.watch("amount");
  const watchMessage = form.watch("message") || "";
  const watchRecipient = form.watch("recipient");

  const feeBreakdown = useMemo(() => {
    if (!watchAmount || watchAmount <= 0) return null;
    return calculateFee(watchAmount);
  }, [watchAmount]);

  const isSelfTip = isConnected && principal && watchRecipient === principal;

  function onSubmit() {
    if (isSelfTip) {
      toast({ title: "Cannot send to yourself", variant: "destructive" });
      return;
    }
    setShowConfirm(true);
  }

  async function confirmSend() {
    setShowConfirm(false);
    const values = form.getValues();
    setTxStatus("signing");
    setTxError(undefined);

    const result = await sendTipTransaction(
      values.recipient,
      Math.round(values.amount * MICRO_STX_PER_STX),
      values.message || ""
    );

    setTxId(result.txId);

    if (result.status === "failed") {
      setTxStatus("failed");
      setTxError(result.error);
      return;
    }

    setTxStatus("pending");
    const finalStatus = await pollTxStatus(result.txId);
    setTxStatus(finalStatus);

    if (finalStatus === "confirmed") {
      addRecipient(values.recipient);
      toast({ title: "Tip sent!", description: `${formatStx(values.amount)} STX sent successfully.` });
    }
  }

  function resetTx() {
    setTxStatus("idle");
    setTxId(null);
    setTxError(undefined);
    if (txStatus === "confirmed") form.reset();
  }

  const isSubmitting = ["signing", "submitted", "pending"].includes(txStatus);

  return (
    <AppShell>
      <PageTransition>
      <div className="container py-6">
        <div className="mb-6">
          <h1 className="text-xl font-semibold tracking-tight">Send Tip</h1>
          <p className="text-sm text-muted-foreground">Send STX micro-tips to any Stacks address</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-5">
          {/* Form */}
          <div className="lg:col-span-3 animate-slide-up stagger-1">
            <Card className="shadow-layer-2 overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-primary to-primary/50" />
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Tip Composer</CardTitle>
              </CardHeader>
              <CardContent>
                {!isConnected ? (
                  <div className="flex flex-col items-center gap-4 py-8 text-center animate-fade-in">
                    <div className="rounded-full bg-secondary p-4">
                      <Wallet className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">Connect your wallet</p>
                      <p className="text-sm text-muted-foreground">You need a connected wallet to send tips</p>
                    </div>
                    <Button onClick={connect} disabled={isConnecting} className="gap-2">
                      <Wallet className="h-4 w-4" />
                      {isConnecting ? "Connecting…" : "Connect Wallet"}
                    </Button>
                  </div>
                ) : (
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="recipient"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Recipient Address</FormLabel>
                            <FormControl>
                              <RecipientInput
                                value={field.value}
                                onChange={(val) => field.onChange(val)}
                                onBlur={field.onBlur}
                                name={field.name}
                              />
                            </FormControl>
                            {isSelfTip && (
                              <p className="flex items-center gap-1 text-xs text-destructive">
                                <AlertTriangle className="h-3 w-3" />
                                Cannot send a tip to yourself
                              </p>
                            )}
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="amount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Amount (STX)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.000001"
                                min="0"
                                placeholder="0.00"
                                className="font-mono-tabular"
                                {...field}
                                onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                                value={field.value ?? ""}
                              />
                            </FormControl>
                            {feeBreakdown && (
                              <p className="font-mono-tabular text-xs text-muted-foreground">
                                = {feeBreakdown.grossMicroStx.toLocaleString()} μSTX
                              </p>
                            )}
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="message"
                        render={({ field }) => (
                          <FormItem>
                            <div className="flex items-center justify-between">
                              <FormLabel className="text-xs">Message (optional)</FormLabel>
                              <span className="font-mono-tabular text-xs text-muted-foreground">
                                {watchMessage.length}/{MAX_MESSAGE_LENGTH}
                              </span>
                            </div>
                            <FormControl>
                              <Textarea
                                placeholder="Great work! Here's a tip…"
                                maxLength={MAX_MESSAGE_LENGTH}
                                className="resize-none text-sm"
                                rows={3}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button
                        type="submit"
                        className="w-full gap-2"
                        disabled={isSubmitting || !!isSelfTip || !form.formState.isValid}
                      >
                        <Send className="h-4 w-4" />
                        {isSubmitting ? "Processing…" : "Review & Send"}
                      </Button>
                    </form>
                  </Form>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right panel */}
          <div className="space-y-4 lg:col-span-2 animate-slide-up stagger-2">
            <FeeEstimatePanel fee={feeBreakdown} />
            <TransactionStatus status={txStatus} txId={txId} error={txError} onReset={resetTx} />
          </div>
        </div>
      </div>
      </PageTransition>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Tip</DialogTitle>
            <DialogDescription>Review the details before signing</DialogDescription>
          </DialogHeader>
          {feeBreakdown && (
            <div className="space-y-2 rounded-md bg-secondary p-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Recipient</span>
                <span className="max-w-[200px] truncate font-mono-tabular text-xs">{form.getValues("recipient")}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Amount</span>
                <span className="font-mono-tabular font-semibold">{formatStx(feeBreakdown.grossAmount)} STX</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Fee ({feeBreakdown.feeBps / 100}%)</span>
                <span className="font-mono-tabular">{formatStx(feeBreakdown.feeAmount)} STX</span>
              </div>
              <div className="flex justify-between border-t pt-2 text-sm font-semibold">
                <span>Recipient Gets</span>
                <span className="font-mono-tabular">{formatStx(feeBreakdown.netAmount)} STX</span>
              </div>
              {form.getValues("message") && (
                <div className="border-t pt-2">
                  <p className="text-xs text-muted-foreground">Message</p>
                  <p className="mt-0.5 text-sm">{form.getValues("message")}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirm(false)}>
              Cancel
            </Button>
            <Button onClick={confirmSend} className="gap-2">
              <Send className="h-4 w-4" />
              Sign & Send
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
