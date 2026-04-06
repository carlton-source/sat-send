import { useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useRecentRecipients, formatRelativeTime } from "@/hooks/use-recent-recipients";
import { History, Clock } from "lucide-react";

interface RecipientInputProps {
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  name: string;
}

export function RecipientInput({ value, onChange, onBlur, name }: RecipientInputProps) {
  const { recipients } = useRecentRecipients();
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);