import { useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useRecentRecipients, formatRelativeTime } from "@/hooks/use-recent-recipients";
import { History, Clock } from "lucide-react";