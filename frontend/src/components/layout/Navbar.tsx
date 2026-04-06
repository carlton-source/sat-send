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
  function handleSearch() {
    const trimmed = searchQuery.trim();
    if (!trimmed) return;
    if (isValidStacksAddress(trimmed)) {
      navigate(`/profile/${trimmed}`);
      setSearchQuery("");
    } else {
      toast({ title: "Invalid address", description: "Please enter a valid Stacks address", variant: "destructive" });
    }
  }

  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md shadow-layer-1">
      <div className="container flex h-14 items-center justify-between gap-4">
        {/* Logo + Nav */}
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2 font-semibold text-foreground transition-smooth hover:text-primary">
            <Zap className="h-5 w-5 text-primary" />
            <span className="text-base tracking-tight">SatSend</span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm font-medium transition-all duration-200",
                  location.pathname === item.path
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>