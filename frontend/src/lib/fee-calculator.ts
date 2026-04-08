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

export function calculateFee(amountStx: number): FeeBreakdown {
  const grossMicroStx = Math.round(amountStx * MICRO_STX_PER_STX);
  const feeMicroStx = Math.floor((grossMicroStx * PLATFORM_FEE_BPS) / 10_000);
  const netMicroStx = grossMicroStx - feeMicroStx;

  return {
    grossAmount: amountStx,
    feeAmount: feeMicroStx / MICRO_STX_PER_STX,
    netAmount: netMicroStx / MICRO_STX_PER_STX,
    feeBps: PLATFORM_FEE_BPS,
    grossMicroStx,
    feeMicroStx,
    netMicroStx,
  };
}

export function formatStx(amount: number): string {
  return amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  });
}

export function formatMicroStx(microStx: number): string {
  return microStx.toLocaleString();
}