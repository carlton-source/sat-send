import { create } from "zustand";
import { toast } from "@/hooks/use-toast";

const MOCK_PRINCIPALS = [
  "SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7",
  "SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE",
  "SP1H1733V5MZ3SZ9XRW9FSEF7GVAXYP6NNKV0P7QN",
];

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
  isConnected: localStorage.getItem("satsend_wallet_connected") === "true",
  principal: localStorage.getItem("satsend_wallet_principal"),
  network: (localStorage.getItem("satsend_wallet_network") as "mainnet" | "testnet") || "mainnet",
  isConnecting: false,

  connect: async () => {
    set({ isConnecting: true });
    await new Promise((r) => setTimeout(r, 1200));
    const principal = MOCK_PRINCIPALS[Math.floor(Math.random() * MOCK_PRINCIPALS.length)];
    localStorage.setItem("satsend_wallet_connected", "true");
    localStorage.setItem("satsend_wallet_principal", principal);
    set({ isConnected: true, principal, isConnecting: false });
    toast({
      title: "Wallet connected",
      description: `Connected as ${truncatePrincipal(principal)}`,
    });
  },

  disconnect: () => {
    localStorage.removeItem("satsend_wallet_connected");
    localStorage.removeItem("satsend_wallet_principal");
    set({ isConnected: false, principal: null, isConnecting: false });
    toast({ title: "Wallet disconnected", description: "You have been disconnected." });
  },

  toggleNetwork: () => {
    const newNetwork = get().network === "mainnet" ? "testnet" : "mainnet";
    localStorage.setItem("satsend_wallet_network", newNetwork);
    set({ network: newNetwork });
  },
}));

export function truncatePrincipal(principal: string): string {
  if (principal.length <= 12) return principal;
  return `${principal.slice(0, 5)}…${principal.slice(-5)}`;
}
