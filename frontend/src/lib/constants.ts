export const PLATFORM_FEE_BPS = 50; // 0.5% — matches contract fee-basis-points
export const MIN_TIP_AMOUNT = 0.001; // STX
export const MAX_MESSAGE_LENGTH = 280;
export const MICRO_STX_PER_STX = 1_000_000;
export const STACKS_EXPLORER_URL = "https://explorer.stacks.co";

// Contract deployment (from deployments/default.mainnet-plan.yaml)
export const CONTRACT_DEPLOYER = "SP262DFWDS07XGFC8HYE4H7MAESRD6M6G1AS6K16Y";
export const CONTRACT_NAME = "sat-send";
export const CONTRACT_ADDRESS = `${CONTRACT_DEPLOYER}.${CONTRACT_NAME}`;
