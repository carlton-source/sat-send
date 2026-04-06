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

  const query = value.toLowerCase();
  const filtered = recipients.filter((r) => r.address.toLowerCase().includes(query));

  function select(address: string) {
    onChange(address);
    setOpen(false);
    inputRef.current?.focus();
  }

  const hasRecipients = recipients.length > 0;

  return (
    <div className="relative flex gap-1.5">
      <Input
        ref={inputRef}
        name={name}
        placeholder="SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7"
        className="font-mono-tabular text-xs flex-1"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        autoComplete="off"
      />
      {hasRecipients && (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="shrink-0 h-10 w-10"
              aria-label="Recent recipients"
            >
              <History className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-80 p-0" onOpenAutoFocus={(e) => e.preventDefault()}>
            <div className="px-3 py-2 border-b">
              <p className="text-xs font-medium text-muted-foreground">Recent Recipients</p>
            </div>
            <ScrollArea className="max-h-[240px]">
              <div className="p-1">
                {filtered.length === 0 ? (
                  <p className="px-2 py-4 text-center text-xs text-muted-foreground">No matching addresses</p>
                ) : (
                  filtered.map((r) => (
                    <button
                      key={r.address}
                      type="button"
                      className="flex w-full items-center justify-between rounded-sm px-2 py-2 text-left hover:bg-accent transition-colors"
                      onClick={() => select(r.address)}
                    >
                      <span className="font-mono-tabular text-xs truncate max-w-[200px]">{r.address}</span>
                      <span className="flex items-center gap-1 text-[10px] text-muted-foreground shrink-0 ml-2">
                        <Clock className="h-3 w-3" />
                        {formatRelativeTime(r.lastTipped)}
                      </span>
                    </button>
                  ))
                )}
              </div>
            </ScrollArea>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}
