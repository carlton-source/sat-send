import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, CheckCircle2, XCircle, Loader2, Clock } from "lucide-react";
import { STACKS_EXPLORER_URL } from "@/lib/constants";
import type { TxStatus } from "@/services/mock-contract";
import { cn } from "@/lib/utils";