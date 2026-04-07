import {
  fetchCallReadOnlyFunction,
  ClarityType,
  cvToValue,
  Cl,
  Pc,
  type ClarityValue,
} from "@stacks/transactions";
import { request } from "@stacks/connect";
import {
  CONTRACT_DEPLOYER,
  CONTRACT_NAME,
  CONTRACT_ADDRESS,
  HIRO_API_MAINNET,
  HIRO_API_TESTNET,
  PLATFORM_FEE_BPS,
} from "@/lib/constants";
import { useWalletStore } from "@/services/mock-wallet";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getApiUrl(): string {
  const network = useWalletStore.getState().network;
  return network === "mainnet" ? HIRO_API_MAINNET : HIRO_API_TESTNET;
}

function getNetwork(): "mainnet" | "testnet" {
  return useWalletStore.getState().network;
}

/** Build fetch headers — uses VITE_HIRO_API_KEY if set */
function apiHeaders(): HeadersInit {
  const key = import.meta.env.VITE_HIRO_API_KEY as string | undefined;
  return key ? { "x-api-key": key } : {};
}

/** Parse a Clarity uint repr string like "u5000000" → 5000000 */
function parseUintRepr(repr: string): number {
  return parseInt(repr.replace(/^u/, ""), 10) || 0;
}

/** Parse a Clarity string-utf8 repr like 'u"Hello world"' → "Hello world" (decodes UTF-8 byte escapes) */
function parseStringUtf8Repr(repr: string): string {
  const match = repr.match(/^u?"(.*)"$/s);
  if (!match) return "";
  // Clarity encodes non-ASCII as \u{hexbytes} where hexbytes are raw UTF-8 bytes (not code points)
  return match[1].replace(/\\u\{([0-9a-fA-F]+)\}/g, (_, hex: string) => {
    const pairs = hex.match(/.{2}/g) ?? [];
    const bytes = new Uint8Array(pairs.map((b) => parseInt(b, 16)));
    return new TextDecoder().decode(bytes);
  });
}

/** Strip leading apostrophe from a Clarity principal repr (e.g. 'SP... → SP...) */
function parsePrincipalRepr(repr: string): string {
  return repr.replace(/^'/, "");
}

// Version-agnostic ClarityValue accessors — handles both cvToValue output and raw ClarityValue objects
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function safeTupleField(cv: any, field: string): any {
  // Raw ClarityValue TupleCV: { type, data: { [key]: ClarityValue } }
  if (cv?.data?.[field] !== undefined) return cv.data[field];
  // cvToValue output (plain object with converted values)
  if (cv?.[field] !== undefined) return cv[field];
  return undefined;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function safeUint(cv: any): number {
  if (cv == null) return 0;
  // Already a primitive
  if (typeof cv === "bigint") return Number(cv);
  if (typeof cv === "number") return cv;
  if (typeof cv === "string") return parseInt(cv, 10) || 0;
  // Raw UIntCV: { type, value: bigint }
  const v = cv?.value;
  if (typeof v === "bigint") return Number(v);
  if (typeof v === "number") return v;
  if (typeof v === "string") return parseInt(v, 10) || 0;
  return 0;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function safeString(cv: any): string {
  if (!cv) return "";
  if (typeof cv === "string") return cv;
  // Raw StringUtf8CV / StringAsciiCV: { type, data: string }
  if (typeof cv.data === "string") return cv.data;
  return "";
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function safePrincipal(cv: any): string {
  if (!cv) return "";
  if (typeof cv === "string") return cv;
  // cvToValue reliably handles principal → string conversion for all versions
  try { return String(cvToValue(cv as ClarityValue)); } catch { /* fall through */ }
  return "";
}

async function callReadOnly(functionName: string, functionArgs: ClarityValue[]): Promise<ClarityValue> {
  return fetchCallReadOnlyFunction({
    contractAddress: CONTRACT_DEPLOYER,
    contractName: CONTRACT_NAME,
    functionName,
    functionArgs,
    senderAddress: CONTRACT_DEPLOYER,
    network: getNetwork(),
  });
}

// ---------------------------------------------------------------------------
// Interfaces (preserved from original for page compatibility)
// ---------------------------------------------------------------------------

export interface PlatformStats {
  totalTips: number;
  totalVolumeMicroStx: number;
  totalFeesMicroStx: number;
  activeTippers: number;
}

export interface UserStats {
  tipsSent: number;
  tipsReceived: number;
  totalSentMicroStx: number;
  totalReceivedMicroStx: number;
}

export interface TipRecord {
  id: number;
  sender: string;
  recipient: string;
  amountMicroStx: number;
  feeMicroStx: number;
  message: string;
  blockHeight: number;
  timestamp: number;
}

export interface RecentTip {
  id: number;
  sender: string;
  recipient: string;
  amountMicroStx: number;
  message: string;
  timestamp: number;
}

export interface HistoryRecord {
  id: number;
  direction: "sent" | "received";
  counterparty: string;
  amountMicroStx: number;
  feeMicroStx: number;
  message: string;
  txId: string;
  timestamp: number;
}

export interface LeaderboardEntry {
  rank: number;
  principal: string;
  totalMicroStx: number;
  tipCount: number;
}

export type TxStatus = "idle" | "signing" | "submitted" | "pending" | "confirmed" | "failed";

export interface TxResult {
  txId: string;
  status: TxStatus;
  error?: string;
}

// ---------------------------------------------------------------------------
// Platform Stats — reads from contract get-platform-stats
// ---------------------------------------------------------------------------

export async function getPlatformStats(): Promise<PlatformStats> {
  try {
    // get-platform-stats returns: { total-tips: uint, total-volume: uint, platform-fees: uint }
    const cv = await callReadOnly("get-platform-stats", []);

    // Count unique tippers from contract transactions
    let activeTippers = 0;
    try {
      const res = await fetch(
        `${getApiUrl()}/extended/v1/address/${CONTRACT_ADDRESS}/transactions?limit=100`,
        { headers: apiHeaders() }
      );
      if (res.ok) {
        const data = await res.json();
        const senders = new Set<string>();
        for (const item of data.results ?? []) {
          const tx = item.tx ?? item;
          if (tx.tx_type === "contract_call" && tx.tx_status === "success") {
            senders.add(tx.sender_address);
          }
        }
        activeTippers = senders.size;
      }
    } catch {
      // non-critical, leave 0
    }

    return {
      totalTips: safeUint(safeTupleField(cv, "total-tips")),
      totalVolumeMicroStx: safeUint(safeTupleField(cv, "total-volume")),
      totalFeesMicroStx: safeUint(safeTupleField(cv, "platform-fees")),
      activeTippers,
    };
  } catch {
    return { totalTips: 0, totalVolumeMicroStx: 0, totalFeesMicroStx: 0, activeTippers: 0 };
  }
}

// ---------------------------------------------------------------------------
// User Stats — reads from contract get-user-stats
// ---------------------------------------------------------------------------

export async function getUserStats(principal: string): Promise<UserStats | null> {
  try {
    // get-user-stats always returns a tuple (uses default-to u0 for every field)
    const cv = await callReadOnly("get-user-stats", [Cl.principal(principal)]);
    return {
      tipsSent: safeUint(safeTupleField(cv, "tips-sent")),
      tipsReceived: safeUint(safeTupleField(cv, "tips-received")),
      totalSentMicroStx: safeUint(safeTupleField(cv, "total-sent")),
      totalReceivedMicroStx: safeUint(safeTupleField(cv, "total-received")),
    };
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Single Tip — reads from contract get-tip
// ---------------------------------------------------------------------------

export async function getTip(tipId: number): Promise<TipRecord | null> {
  try {
    // get-tip returns (optional {...}) via map-get?
    const cv = await callReadOnly("get-tip", [Cl.uint(tipId)]);
    // OptionalNone = tip not found
    if (!cv || cv.type === ClarityType.OptionalNone) return null;
    // OptionalSome wraps the inner TupleCV
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const inner: any = cv.type === ClarityType.OptionalSome ? (cv as any).value : cv;

    const amountMicroStx = safeUint(safeTupleField(inner, "amount"));
    const feeMicroStx = Math.floor((amountMicroStx * PLATFORM_FEE_BPS) / 10_000);

    return {
      id: tipId,
      sender: safePrincipal(safeTupleField(inner, "sender")),
      recipient: safePrincipal(safeTupleField(inner, "recipient")),
      amountMicroStx,
      feeMicroStx,
      message: safeString(safeTupleField(inner, "message")),
      blockHeight: safeUint(safeTupleField(inner, "tip-height")),
      timestamp: 0,
    };
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Recent Tips — queries Hiro API for latest contract transactions
// ---------------------------------------------------------------------------

export async function getRecentTips(): Promise<RecentTip[]> {
  try {
    const res = await fetch(
      `${getApiUrl()}/extended/v1/address/${CONTRACT_ADDRESS}/transactions?limit=20`,
      { headers: apiHeaders() }
    );
    if (!res.ok) return [];

    const data = await res.json();
    const tips: RecentTip[] = [];

    for (const item of data.results ?? []) {
      const tx = item.tx ?? item;
      if (tx.tx_type !== "contract_call") continue;
      if (tx.contract_call?.function_name !== "send-stx-tip") continue;
      if (tx.tx_status !== "success") continue;

      const args: { repr: string }[] = tx.contract_call.function_args ?? [];
      const recipient = parsePrincipalRepr(args[0]?.repr ?? "");
      const amountMicroStx = parseUintRepr(args[1]?.repr ?? "u0");
      const message = parseStringUtf8Repr(args[2]?.repr ?? 'u""');

      tips.push({
        id: tips.length,
        sender: tx.sender_address,
        recipient,
        amountMicroStx,
        message,
        timestamp: (tx.burn_block_time ?? 0) * 1000,
      });
    }

    return tips;
  } catch {
    return [];
  }
}

// ---------------------------------------------------------------------------
// Transaction History — user's sent & received tips via Hiro API
// ---------------------------------------------------------------------------

export async function getTransactionHistory(principal: string): Promise<HistoryRecord[]> {
  try {
    const res = await fetch(
      `${getApiUrl()}/extended/v1/address/${principal}/transactions_with_transfers?limit=50`,
      { headers: apiHeaders() }
    );
    if (!res.ok) return [];

    const data = await res.json();
    const records: HistoryRecord[] = [];

    for (const item of data.results ?? []) {
      const tx = item.tx;
      if (!tx || tx.tx_type !== "contract_call") continue;
      if (tx.contract_call?.contract_id !== CONTRACT_ADDRESS) continue;
      if (tx.contract_call?.function_name !== "send-stx-tip") continue;
      if (tx.tx_status !== "success") continue;

      const args: { repr: string }[] = tx.contract_call.function_args ?? [];
      const recipientAddr = parsePrincipalRepr(args[0]?.repr ?? "");
      const amountMicroStx = parseUintRepr(args[1]?.repr ?? "u0");
      const message = parseStringUtf8Repr(args[2]?.repr ?? 'u""');
      const feeMicroStx = Math.floor((amountMicroStx * PLATFORM_FEE_BPS) / 10_000);

      const isSent = tx.sender_address === principal;
      // For received: check that this user is mentioned as the recipient arg
      const isReceived = !isSent && recipientAddr === principal;
      if (!isSent && !isReceived) continue;

      records.push({
        id: records.length,
        direction: isSent ? "sent" : "received",
        counterparty: isSent ? recipientAddr : tx.sender_address,
        amountMicroStx,
        feeMicroStx,
        message,
        txId: tx.tx_id,
        timestamp: (tx.burn_block_time ?? 0) * 1000,
      });
    }

    return records.sort((a, b) => b.timestamp - a.timestamp);
  } catch {
    return [];
  }
}

// ---------------------------------------------------------------------------
// Leaderboard — aggregate from recent on-chain transactions
// ---------------------------------------------------------------------------

export async function getLeaderboard(type: "senders" | "recipients"): Promise<LeaderboardEntry[]> {
  try {
    const res = await fetch(
      `${getApiUrl()}/extended/v1/address/${CONTRACT_ADDRESS}/transactions?limit=100`,
      { headers: apiHeaders() }
    );
    if (!res.ok) return [];

    const data = await res.json();
    const stats = new Map<string, { totalMicroStx: number; tipCount: number }>();

    for (const item of data.results ?? []) {
      const tx = item.tx ?? item;
      if (tx.tx_type !== "contract_call") continue;
      if (tx.contract_call?.function_name !== "send-stx-tip") continue;
      if (tx.tx_status !== "success") continue;

      const args: { repr: string }[] = tx.contract_call.function_args ?? [];
      const amountMicroStx = parseUintRepr(args[1]?.repr ?? "u0");

      const key = type === "senders" ? tx.sender_address : parsePrincipalRepr(args[0]?.repr ?? "");
      if (!key) continue;

      const prev = stats.get(key) ?? { totalMicroStx: 0, tipCount: 0 };
      stats.set(key, {
        totalMicroStx: prev.totalMicroStx + amountMicroStx,
        tipCount: prev.tipCount + 1,
      });
    }

    return Array.from(stats.entries())
      .sort((a, b) => b[1].totalMicroStx - a[1].totalMicroStx)
      .slice(0, 10)
      .map(([principal, s], i) => ({
        rank: i + 1,
        principal,
        totalMicroStx: s.totalMicroStx,
        tipCount: s.tipCount,
      }));
  } catch {
    return [];
  }
}

// ---------------------------------------------------------------------------
// Send Tip — calls send-stx-tip via wallet (stx_callContract)
// ---------------------------------------------------------------------------

export async function sendTipTransaction(
  recipient: string,
  amountMicroStx: number,
  message: string
): Promise<TxResult> {
  const { principal, network } = useWalletStore.getState();

  if (!principal) {
    return { txId: "", status: "failed", error: "Wallet not connected" };
  }

  try {
    // Post condition: sender sends exactly amountMicroStx uSTX in total
    // (net-amount to recipient + fee to contract owner = gross amount)
    const postCondition = Pc.principal(principal).willSendEq(amountMicroStx).ustx();

    const result = await request("stx_callContract", {
      contract: CONTRACT_ADDRESS,
      functionName: "send-stx-tip",
      functionArgs: [
        Cl.principal(recipient),
        Cl.uint(amountMicroStx),
        Cl.stringUtf8(message),
      ],
      network,
      postConditions: [postCondition],
      postConditionMode: "deny",
    });

    return { txId: (result as { txid: string }).txid, status: "submitted" };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    // User rejected — treat as a soft failure (no toast needed, caller decides)
    if (msg.toLowerCase().includes("cancel") || msg.toLowerCase().includes("abort") || msg.toLowerCase().includes("reject")) {
      return { txId: "", status: "failed", error: "Transaction cancelled" };
    }
    return { txId: "", status: "failed", error: msg };
  }
}

// ---------------------------------------------------------------------------
// Poll Transaction Status — polls Hiro API until confirmed or failed
// ---------------------------------------------------------------------------

export async function pollTxStatus(txId: string): Promise<TxStatus> {
  const maxAttempts = 30; // ~5 minutes at 10s intervals

  for (let i = 0; i < maxAttempts; i++) {
    try {
      const res = await fetch(`${getApiUrl()}/extended/v1/tx/${txId}`, {
        headers: apiHeaders(),
      });

      if (res.ok) {
        const tx = await res.json();
        if (tx.tx_status === "success") return "confirmed";
        if (
          tx.tx_status === "abort_by_response" ||
          tx.tx_status === "abort_by_post_condition"
        ) {
          return "failed";
        }
      }
    } catch {
      // transient network error — keep polling
    }

    await new Promise((r) => setTimeout(r, 10_000));
  }

  return "failed"; // confirmation timeout
}
