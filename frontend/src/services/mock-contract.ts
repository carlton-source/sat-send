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