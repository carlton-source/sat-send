import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Send, Compass, Clock, Trophy } from "lucide-react";
import { Navbar } from "./Navbar";
import { cn } from "@/lib/utils";

const BOTTOM_TABS = [
  { path: "/", label: "Dashboard", icon: LayoutDashboard },
  { path: "/send", label: "Send", icon: Send },
  { path: "/history", label: "History", icon: Clock },
  { path: "/leaderboard", label: "Board", icon: Trophy },
  { path: "/explore", label: "Explore", icon: Compass },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const location = useLocation();