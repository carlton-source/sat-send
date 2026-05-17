import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { AddressHoverCard } from "@/components/history/AddressHoverCard";
import { AppShell } from "@/components/layout/AppShell";
import { PageTransition } from "@/components/layout/PageTransition";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useWalletStore } from "@/services/mock-wallet";
import { getTransactionHistory } from "@/services/mock-contract";
import { formatStx } from "@/lib/fee-calculator";
import { MICRO_STX_PER_STX, STACKS_EXPLORER_URL } from "@/lib/constants";
import { formatDistanceToNow } from "date-fns";
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Search,
  ExternalLink,
  Inbox,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";