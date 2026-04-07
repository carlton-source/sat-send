import { create } from "zustand";
import {
  connect as stacksConnect,
  disconnect as stacksDisconnect,
  isConnected as stacksIsConnected,
} from "@stacks/connect";
import { toast } from "@/hooks/use-toast";

const PRINCIPAL_KEY = "satsend_wallet_principal";
const NETWORK_KEY = "satsend_wallet_network";

export interface WalletState {
  isConnected: boolean;
  principal: string | null;
  network: "mainnet" | "testnet";
  isConnecting: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  toggleNetwork: () => void;
}

export const useWalletStore = create<WalletState>((set, get) => ({
  // Restore from both @stacks/connect and our own localStorage
  isConnected: stacksIsConnected() && !!localStorage.getItem(PRINCIPAL_KEY),
  principal: stacksIsConnected() ? localStorage.getItem(PRINCIPAL_KEY) : null,
  network: (localStorage.getItem(NETWORK_KEY) as "mainnet" | "testnet") || "mainnet",
  isConnecting: false,

  connect: async () => {
    set({ isConnecting: true });
    try {
      const response = await stacksConnect();
      // Prefer the entry explicitly tagged as STX; fall back to last address (index 2 for Leather)
      const stxEntry =
        response.addresses.find((a) => a.symbol === "STX") ??
        response.addresses[response.addresses.length - 1];
      const principal = stxEntry?.address;
      if (!principal) throw new Error("No STX address returned by wallet");

      localStorage.setItem(PRINCIPAL_KEY, principal);
      set({ isConnected: true, principal, isConnecting: false });
      toast({
        title: "Wallet connected",
        description: `Connected as ${truncatePrincipal(principal)}`,
      });
    } catch (err) {
      set({ isConnecting: false });
      const msg = err instanceof Error ? err.message : String(err);
      // Silently ignore user-initiated cancellations
      if (!msg.toLowerCase().includes("cancel") && !msg.toLowerCase().includes("abort")) {
        toast({ title: "Connection failed", description: msg, variant: "destructive" });
      }
    }
  },

  disconnect: () => {
    stacksDisconnect();
    localStorage.removeItem(PRINCIPAL_KEY);
    set({ isConnected: false, principal: null, isConnecting: false });
    toast({ title: "Wallet disconnected", description: "You have been disconnected." });
  },

  toggleNetwork: () => {
    const newNetwork = get().network === "mainnet" ? "testnet" : "mainnet";
    localStorage.setItem(NETWORK_KEY, newNetwork);
    set({ network: newNetwork });
  },
}));

export function truncatePrincipal(principal: string): string {
  if (principal.length <= 12) return principal;
  return `${principal.slice(0, 5)}…${principal.slice(-5)}`;
}
