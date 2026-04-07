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

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

const MOCK_TIPS: RecentTip[] = [
  { id: 1042, sender: "SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7", recipient: "SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE", amountMicroStx: 5000000, message: "Great work on the STX tooling!", timestamp: Date.now() - 120000 },
  { id: 1041, sender: "SP1H1733V5MZ3SZ9XRW9FSEF7GVAXYP6NNKV0P7QN", recipient: "SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7", amountMicroStx: 2500000, message: "Thanks for the tutorial 🙏", timestamp: Date.now() - 480000 },
  { id: 1040, sender: "SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE", recipient: "SP1H1733V5MZ3SZ9XRW9FSEF7GVAXYP6NNKV0P7QN", amountMicroStx: 1000000, message: "Coffee tip ☕", timestamp: Date.now() - 900000 },
  { id: 1039, sender: "SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7", recipient: "SP1H1733V5MZ3SZ9XRW9FSEF7GVAXYP6NNKV0P7QN", amountMicroStx: 10000000, message: "Bounty reward for issue #247", timestamp: Date.now() - 3600000 },
  { id: 1038, sender: "SP1H1733V5MZ3SZ9XRW9FSEF7GVAXYP6NNKV0P7QN", recipient: "SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE", amountMicroStx: 500000, message: "", timestamp: Date.now() - 7200000 },
];

export async function getPlatformStats(): Promise<PlatformStats> {
  await delay(600);
  return {
    totalTips: 1042,
    totalVolumeMicroStx: 4_827_350_000,
    totalFeesMicroStx: 120_683_750,
    activeTippers: 287,
  };
}

const KNOWN_PRINCIPALS = new Set([
  "SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7",
  "SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE",
  "SP1H1733V5MZ3SZ9XRW9FSEF7GVAXYP6NNKV0P7QN",
]);

export async function getUserStats(principal: string): Promise<UserStats | null> {
  await delay(500);
  if (!KNOWN_PRINCIPALS.has(principal)) return null;
  return {
    tipsSent: 47,
    tipsReceived: 23,
    totalSentMicroStx: 235_000_000,
    totalReceivedMicroStx: 115_000_000,
  };
}

export async function getTip(tipId: number): Promise<TipRecord | null> {
  await delay(400);
  if (tipId < 1 || tipId > 1042) return null;
  return {
    id: tipId,
    sender: "SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7",
    recipient: "SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE",
    amountMicroStx: 5_000_000,
    feeMicroStx: 125_000,
    message: "Great work on the STX tooling!",
    blockHeight: 142_857,
    timestamp: Date.now() - 120_000,
  };
}

export async function getRecentTips(): Promise<RecentTip[]> {
  await delay(500);
  return MOCK_TIPS;
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

const MOCK_HISTORY: HistoryRecord[] = [
  { id: 1042, direction: "sent", counterparty: "SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE", amountMicroStx: 5000000, feeMicroStx: 125000, message: "Great work on the STX tooling!", txId: "0xabc1", timestamp: Date.now() - 120000 },
  { id: 1041, direction: "received", counterparty: "SP1H1733V5MZ3SZ9XRW9FSEF7GVAXYP6NNKV0P7QN", amountMicroStx: 2500000, feeMicroStx: 62500, message: "Thanks for the tutorial 🙏", txId: "0xabc2", timestamp: Date.now() - 480000 },
  { id: 1040, direction: "sent", counterparty: "SP1H1733V5MZ3SZ9XRW9FSEF7GVAXYP6NNKV0P7QN", amountMicroStx: 1000000, feeMicroStx: 25000, message: "Coffee tip ☕", txId: "0xabc3", timestamp: Date.now() - 900000 },
  { id: 1039, direction: "received", counterparty: "SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE", amountMicroStx: 10000000, feeMicroStx: 250000, message: "Bounty reward for issue #247", txId: "0xabc4", timestamp: Date.now() - 3600000 },
  { id: 1038, direction: "sent", counterparty: "SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE", amountMicroStx: 500000, feeMicroStx: 12500, message: "", txId: "0xabc5", timestamp: Date.now() - 7200000 },
  { id: 1037, direction: "received", counterparty: "SP1H1733V5MZ3SZ9XRW9FSEF7GVAXYP6NNKV0P7QN", amountMicroStx: 3000000, feeMicroStx: 75000, message: "Keep shipping 🚀", txId: "0xabc6", timestamp: Date.now() - 14400000 },
  { id: 1036, direction: "sent", counterparty: "SP1H1733V5MZ3SZ9XRW9FSEF7GVAXYP6NNKV0P7QN", amountMicroStx: 750000, feeMicroStx: 18750, message: "For the docs fix", txId: "0xabc7", timestamp: Date.now() - 28800000 },
  { id: 1035, direction: "received", counterparty: "SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE", amountMicroStx: 20000000, feeMicroStx: 500000, message: "Hackathon prize 🏆", txId: "0xabc8", timestamp: Date.now() - 86400000 },
  { id: 1034, direction: "sent", counterparty: "SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE", amountMicroStx: 1500000, feeMicroStx: 37500, message: "Nice PR review", txId: "0xabc9", timestamp: Date.now() - 172800000 },
  { id: 1033, direction: "received", counterparty: "SP1H1733V5MZ3SZ9XRW9FSEF7GVAXYP6NNKV0P7QN", amountMicroStx: 8000000, feeMicroStx: 200000, message: "Community contribution reward", txId: "0xabca", timestamp: Date.now() - 259200000 },
  { id: 1032, direction: "sent", counterparty: "SP1H1733V5MZ3SZ9XRW9FSEF7GVAXYP6NNKV0P7QN", amountMicroStx: 250000, feeMicroStx: 6250, message: "Quick thanks", txId: "0xabcb", timestamp: Date.now() - 345600000 },
  { id: 1031, direction: "received", counterparty: "SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE", amountMicroStx: 4000000, feeMicroStx: 100000, message: "Bug bounty payout", txId: "0xabcc", timestamp: Date.now() - 432000000 },
];

export async function getTransactionHistory(_principal: string): Promise<HistoryRecord[]> {
  await delay(700);
  return MOCK_HISTORY;
}

export interface LeaderboardEntry {
  rank: number;
  principal: string;
  totalMicroStx: number;
  tipCount: number;
}

const MOCK_SENDERS: LeaderboardEntry[] = [
  { rank: 1, principal: "SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7", totalMicroStx: 482_000_000, tipCount: 142 },
  { rank: 2, principal: "SP1H1733V5MZ3SZ9XRW9FSEF7GVAXYP6NNKV0P7QN", totalMicroStx: 315_000_000, tipCount: 98 },
  { rank: 3, principal: "SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE", totalMicroStx: 207_500_000, tipCount: 76 },
  { rank: 4, principal: "SP1HTBVD3JG9C05J7HBJTHGR0GGW7KXW28M5JS8QE", totalMicroStx: 156_000_000, tipCount: 61 },
  { rank: 5, principal: "SP2C2YFP12AJZB1MAREPARF6RVEKZ0VN1T7PZMXY3", totalMicroStx: 98_750_000, tipCount: 45 },
  { rank: 6, principal: "SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9", totalMicroStx: 72_000_000, tipCount: 33 },
  { rank: 7, principal: "SP1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ0001", totalMicroStx: 54_200_000, tipCount: 27 },
  { rank: 8, principal: "SP1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ0002", totalMicroStx: 38_900_000, tipCount: 19 },
  { rank: 9, principal: "SP1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ0003", totalMicroStx: 21_500_000, tipCount: 12 },
  { rank: 10, principal: "SP1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ0004", totalMicroStx: 12_000_000, tipCount: 7 },
];

const MOCK_RECIPIENTS: LeaderboardEntry[] = [
  { rank: 1, principal: "SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE", totalMicroStx: 523_000_000, tipCount: 189 },
  { rank: 2, principal: "SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7", totalMicroStx: 401_000_000, tipCount: 134 },
  { rank: 3, principal: "SP1H1733V5MZ3SZ9XRW9FSEF7GVAXYP6NNKV0P7QN", totalMicroStx: 278_500_000, tipCount: 91 },
  { rank: 4, principal: "SP1HTBVD3JG9C05J7HBJTHGR0GGW7KXW28M5JS8QE", totalMicroStx: 189_000_000, tipCount: 72 },
  { rank: 5, principal: "SP2C2YFP12AJZB1MAREPARF6RVEKZ0VN1T7PZMXY3", totalMicroStx: 134_250_000, tipCount: 58 },
  { rank: 6, principal: "SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9", totalMicroStx: 87_000_000, tipCount: 41 },
  { rank: 7, principal: "SP1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ0005", totalMicroStx: 62_400_000, tipCount: 29 },
  { rank: 8, principal: "SP1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ0006", totalMicroStx: 43_100_000, tipCount: 22 },
  { rank: 9, principal: "SP1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ0007", totalMicroStx: 28_700_000, tipCount: 15 },
  { rank: 10, principal: "SP1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ0008", totalMicroStx: 15_300_000, tipCount: 9 },
];

export async function getLeaderboard(type: "senders" | "recipients"): Promise<LeaderboardEntry[]> {
  await delay(600);
  return type === "senders" ? MOCK_SENDERS : MOCK_RECIPIENTS;
}

export type TxStatus = "idle" | "signing" | "submitted" | "pending" | "confirmed" | "failed";

export interface TxResult {
  txId: string;
  status: TxStatus;
  error?: string;
}

export async function sendTipTransaction(
  _recipient: string,
  _amountMicroStx: number,
  _message: string
): Promise<TxResult> {
  // Simulate signing
  await delay(1500);
  const txId = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`;

  // Simulate random failure ~10% of the time
  if (Math.random() < 0.1) {
    return { txId, status: "failed", error: "Transaction rejected by wallet" };
  }

  return { txId, status: "submitted" };
}

export async function pollTxStatus(txId: string): Promise<TxStatus> {
  await delay(2000);
  void txId;
  // Always confirm for demo
  return "confirmed";
}
