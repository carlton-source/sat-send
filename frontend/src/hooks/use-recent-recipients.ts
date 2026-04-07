import { useCallback, useSyncExternalStore } from "react";

export interface RecentRecipient {
  address: string;
  lastTipped: number;
}

const STORAGE_KEY = "satsend:recent-recipients";
const MAX_ENTRIES = 10;

let listeners: Array<() => void> = [];

function emitChange() {
  listeners.forEach((l) => l());
}

function getSnapshot(): RecentRecipient[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as RecentRecipient[]) : [];
  } catch {
    return [];
  }
}

let cachedSnapshot = getSnapshot();

function subscribe(listener: () => void) {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

function getSnapshotCached() {
  return cachedSnapshot;
}

function persist(recipients: RecentRecipient[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(recipients));
  cachedSnapshot = recipients;
  emitChange();
}

export function useRecentRecipients() {
  const recipients = useSyncExternalStore(subscribe, getSnapshotCached, () => []);

  const addRecipient = useCallback((address: string) => {
    const current = getSnapshot().filter((r) => r.address !== address);
    const updated: RecentRecipient[] = [{ address, lastTipped: Date.now() }, ...current].slice(0, MAX_ENTRIES);
    persist(updated);
  }, []);

  return { recipients, addRecipient };
}

export function formatRelativeTime(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
