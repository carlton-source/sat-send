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