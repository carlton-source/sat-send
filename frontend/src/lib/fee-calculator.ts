import { PLATFORM_FEE_BPS, MICRO_STX_PER_STX } from "./constants";

export interface FeeBreakdown {
  grossAmount: number;
  feeAmount: number;
  netAmount: number;
  feeBps: number;
  grossMicroStx: number;
  feeMicroStx: number;
  netMicroStx: number;
}