import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Skeleton } from "@/components/ui/skeleton";
import { getUserStats } from "@/services/mock-contract";
import { truncatePrincipal } from "@/services/mock-wallet";
import { formatStx } from "@/lib/fee-calculator";
import { MICRO_STX_PER_STX } from "@/lib/constants";
import { ArrowUpRight, ArrowDownLeft, ExternalLink } from "lucide-react";

interface AddressHoverCardProps {
  principal: string;
  children?: React.ReactNode;
}