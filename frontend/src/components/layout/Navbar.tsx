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

        {/* Search bar - desktop */}
        <div className="hidden md:flex items-center flex-1 max-w-xs mx-4">
          <div className="relative w-full">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              ref={searchInputRef}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Search address…"
              className="h-8 pl-8 pr-16 text-xs bg-secondary/50 border-transparent focus-visible:border-input"
            />
            <kbd className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 hidden select-none items-center gap-0.5 rounded border bg-muted px-1.5 py-0.5 font-mono text-[10px] font-medium text-muted-foreground sm:flex">
              ⌘K
            </kbd>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-all duration-200 hover:bg-secondary hover:text-foreground"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          {/* Network badge */}
          <button
            onClick={toggleNetwork}
            className="flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-medium transition-all duration-200 hover:bg-secondary"
          >
            <Radio className={cn("h-3 w-3", network === "mainnet" ? "text-success" : "text-warning")} />
            <span className="font-mono-tabular">{network === "mainnet" ? "Mainnet" : "Testnet"}</span>
          </button>