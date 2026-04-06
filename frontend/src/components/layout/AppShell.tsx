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

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 pb-16 md:pb-0">{children}</main>

      {/* Mobile bottom tab bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur-md md:hidden">
        <div className="flex h-14 items-stretch">
          {BOTTOM_TABS.map((tab) => {
            const isActive = location.pathname === tab.path;
            const Icon = tab.icon;
            return (
              <Link
                key={tab.path}
                to={tab.path}
                className={cn(
                  "flex flex-1 flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-colors",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className={cn("h-5 w-5", isActive && "drop-shadow-sm")} />
                {tab.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
