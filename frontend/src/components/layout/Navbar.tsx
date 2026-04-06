import { Link, useLocation, useNavigate } from "react-router-dom";
import { Zap, Wallet, LogOut, ChevronDown, Radio, Sun, Moon, Search } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useWalletStore, truncatePrincipal } from "@/services/mock-wallet";
import { useThemeStore } from "@/hooks/use-theme";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { isValidStacksAddress } from "@/lib/validation";
import { toast } from "@/hooks/use-toast";

const NAV_ITEMS = [
  { path: "/", label: "Dashboard" },
  { path: "/send", label: "Send Tip" },
  { path: "/history", label: "History" },
  { path: "/leaderboard", label: "Leaderboard" },
  { path: "/explore", label: "Explore" },
];

export function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isConnected, principal, network, isConnecting, connect, disconnect, toggleNetwork } = useWalletStore();
  const { theme, toggleTheme } = useThemeStore();
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);