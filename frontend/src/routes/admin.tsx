import {
  createFileRoute,
  Outlet,
  Link,
  useRouter,
} from "@tanstack/react-router";
import { ExternalLink, LogOut } from "lucide-react";
import { api } from "@/lib/api";
import { Unauthorized } from "@/shared/components/Unauthorized";

export const Route = createFileRoute("/admin")({
  // The session cookie belongs to the API domain, so only the browser can check it.
  ssr: false,
  beforeLoad: async () => {
    try {
      await api.getMe();
    } catch (error) {
      throw new Error("401");
    }
  },
  errorComponent: ({ error }) => {
    const message = error instanceof Error ? error.message : String(error);
    if (message === "401") {
      return <Unauthorized />;
    }
    return <div>Something went wrong: {message}</div>;
  },
  component: AdminLayout,
});

function AdminLayout() {
  const router = useRouter();

  const handleLogout = async () => {
    await api.logout();
    router.navigate({ to: "/" });
  };

  return (
    <div className="theme-light min-h-screen bg-card text-ink font-sans">
      {/* Top Bar - Consistent across all admin pages */}
      <header className="h-14 border-b border-rule flex items-center justify-between px-6 sticky top-0 bg-card/80 backdrop-blur-sm z-50">
        <div className="flex items-center gap-2">
          <Link
            to="/admin/dashboard"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <span className="font-serif font-medium text-lg">Admin</span>
            <span className="text-faint">—</span>
            <span className="text-soft text-sm font-mono">
              behind the scenes
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-6 text-sm text-soft">
          <a
            href="/"
            target="_blank"
            className="hover:text-ink transition-colors flex items-center gap-1"
          >
            View site
            <ExternalLink className="w-3 h-3" />
          </a>
          <button
            onClick={handleLogout}
            className="hover:text-ink transition-colors flex items-center gap-1"
          >
            Logout
            <LogOut className="w-3 h-3" />
          </button>
        </div>
      </header>

      <Outlet />
    </div>
  );
}
