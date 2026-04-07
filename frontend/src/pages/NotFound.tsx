import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { PageTransition } from "@/components/layout/PageTransition";
import { Button } from "@/components/ui/button";
import { Zap } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <AppShell>
      <PageTransition>
      <div className="flex flex-1 flex-col items-center justify-center py-24">
        <div className="rounded-full bg-primary/10 p-5 mb-6">
          <Zap className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-6xl font-bold font-mono-tabular tracking-tight">404</h1>
        <p className="mt-2 text-lg text-muted-foreground">Page not found</p>
        <p className="mt-1 text-sm text-muted-foreground/60">
          The page <code className="rounded bg-secondary px-1.5 py-0.5 font-mono-tabular text-xs">{location.pathname}</code> doesn't exist.
        </p>
        <Button asChild className="mt-6 gap-2">
          <Link to="/">
            <Zap className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
      </div>
      </PageTransition>
    </AppShell>
  );
};

export default NotFound;
