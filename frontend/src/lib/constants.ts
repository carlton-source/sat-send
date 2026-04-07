export const PLATFORM_FEE_BPS = 250; // 2.5%
export const MIN_TIP_AMOUNT = 0.001; // STX
export const MAX_MESSAGE_LENGTH = 280;
export const MICRO_STX_PER_STX = 1_000_000;
export const STACKS_EXPLORER_URL = "https://explorer.stacks.co";
export const CONTRACT_ADDRESS = "SP000000000000000000002Q6VF78.satsend-v1";

export const NETWORKS = {
  mainnet: { label: "Mainnet", color: "success" },
  testnet: { label: "Testnet", color: "warning" },
} as const;

export type NetworkType = keyof typeof NETWORKS;
