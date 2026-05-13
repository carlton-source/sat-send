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

type DirectionFilter = "all" | "sent" | "received";
type SortOrder = "newest" | "oldest";

const PAGE_SIZE = 8;

  const { isConnected, principal, connect, isConnecting } = useWalletStore();
  const [directionFilter, setDirectionFilter] = useState<DirectionFilter>("all");
  const [sortOrder, setSortOrder] = useState<SortOrder>("newest");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);

  const history = useQuery({
    queryKey: ["tx-history", principal],
    queryFn: () => getTransactionHistory(principal!),
    enabled: isConnected && !!principal,
  });

  const filtered = useMemo(() => {
    if (!history.data) return [];
    let items = [...history.data];

    if (directionFilter !== "all") {
      items = items.filter((t) => t.direction === directionFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      items = items.filter(
        (t) =>
          t.counterparty.toLowerCase().includes(q) ||
          t.message.toLowerCase().includes(q)
      );
    }

    items.sort((a, b) =>
      sortOrder === "newest" ? b.timestamp - a.timestamp : a.timestamp - b.timestamp
    );

  // Reset page when filters change
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  if (safePage !== page) setPage(safePage);
