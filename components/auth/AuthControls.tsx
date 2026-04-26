"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Loader2 } from "lucide-react";
import { trackEvent } from "@/lib/analytics/client";
import { cn } from "@/lib/utils";

type AuthUser = {
  id: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
};

interface AuthControlsProps {
  mode?: "landing" | "app" | "mobile";
}

function getDefaultRedirectTarget(pathname: string) {
  if (pathname.startsWith("/account")) {
    return "/account";
  }

  return "/generate";
}

export default function AuthControls({ mode = "landing" }: AuthControlsProps) {
  const pathname = usePathname();
  const [user, setUser] = useState<AuthUser | null | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;

    void fetch("/api/auth/me", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) {
          return null;
        }

        return response.json() as Promise<{ user: AuthUser | null }>;
      })
      .then((payload) => {
        if (!cancelled) {
          setUser(payload?.user ?? null);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setUser(null);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const linkClassName = cn(
    "min-h-10 whitespace-nowrap text-sm font-medium transition-colors",
    mode === "landing"
      ? "text-gray-300 hover:text-white"
      : mode === "app"
        ? "inline-flex items-center justify-center rounded-lg border border-white/15 px-3 py-2 text-center text-gray-300 hover:border-white/35 hover:text-white"
        : "rounded-xl border border-white/10 px-4 py-3 text-center text-white hover:bg-white/5",
  );

  const primaryButtonClassName = cn(
    "min-h-11 rounded-full bg-white px-5 py-2 text-sm font-semibold text-black transition-all hover:bg-gray-100 hover:scale-105 active:scale-95 text-center",
    mode === "mobile" && "w-full py-3 text-base",
  );

  const secondaryButtonClassName = cn(
    "min-h-10 rounded-xl border border-white/10 px-4 py-2.5 text-center text-white hover:bg-white/5",
    mode === "mobile" && "w-full min-h-11 py-3",
    mode === "app" && "text-sm font-medium text-gray-200 hover:border-white/25 hover:bg-white/5",
  );

  const handleSignOut = async () => {
    try {
      await fetch("/api/auth/sign-out", { method: "POST" });
      setUser(null);
      window.location.assign("/");
    } catch {
      window.location.assign("/");
    }
  };

  if (user === undefined) {
    return (
      <div className="flex items-center gap-3 text-sm text-gray-400">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Loading account…</span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={cn("flex w-full flex-col gap-3", mode === "mobile" ? "items-stretch" : "sm:w-auto sm:flex-row sm:flex-wrap sm:items-center")}>
        <Link
          href={pathname.startsWith("/sign-in") ? "/sign-in" : `/sign-in?redirect_url=${encodeURIComponent(getDefaultRedirectTarget(pathname))}`}
          onClick={() => {
            void trackEvent("cta_clicked", { surface: "landing", label: "sign_in" });
          }}
          className={linkClassName}
        >
          Sign In
        </Link>
        <Link
          href={pathname.startsWith("/sign-up") ? "/sign-up" : `/sign-up?redirect_url=${encodeURIComponent(getDefaultRedirectTarget(pathname))}`}
          onClick={() => {
            void trackEvent("cta_clicked", { surface: "landing", label: "start_free" });
          }}
          className={primaryButtonClassName}
        >
          Start Free
        </Link>
      </div>
    );
  }

  return (
    <div
      className={cn(
        mode === "mobile"
          ? "flex w-full flex-col gap-3 items-stretch"
          : mode === "app"
            ? "inline-flex w-auto flex-row flex-wrap items-center justify-end gap-1.5 sm:gap-2"
            : "flex w-full flex-col gap-3",
        mode === "mobile"
          ? ""
          : "",
      )}
    >
      {pathname !== "/generate" && (
        <Link
          href="/generate"
          onClick={() => {
            void trackEvent("cta_clicked", { surface: "app", label: "dashboard" });
          }}
          className={cn(linkClassName, mode === "app" && "px-3 py-2 text-[11px] sm:text-xs")}
        >
          Dashboard
        </Link>
      )}

      {pathname !== "/account" && (
        <Link href="/account" className={cn(linkClassName, mode === "app" && "px-3 py-2 text-[11px] sm:text-xs")}>
          Account
        </Link>
      )}

      <button
        type="button"
        onClick={() => void handleSignOut()}
        className={cn(secondaryButtonClassName, mode === "app" && "w-auto px-3 py-2 text-[11px] sm:text-xs")}
      >
        Sign Out
      </button>
    </div>
  );
}
