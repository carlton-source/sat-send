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