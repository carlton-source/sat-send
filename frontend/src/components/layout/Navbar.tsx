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