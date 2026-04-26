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
    "inline-flex shrink-0 items-center justify-center whitespace-nowrap text-sm font-medium leading-none transition-colors",
    mode === "landing"
      ? "h-12 rounded-full px-5 text-gray-300 hover:text-white"
      : mode === "app"
        ? "min-h-10 rounded-lg border border-white/15 px-3 py-2 text-center text-gray-300 hover:border-white/35 hover:text-white"
        : "min-h-11 rounded-xl border border-white/10 px-4 py-3 text-center text-white hover:bg-white/5",
  );

  const primaryButtonClassName = cn(
    "inline-flex h-12 shrink-0 items-center justify-center whitespace-nowrap rounded-full bg-white px-6 text-sm font-semibold leading-none text-black transition-all hover:bg-gray-100 hover:shadow-[0_10px_30px_rgba(255,255,255,0.14)] active:scale-[0.98] text-center",
    mode === "mobile" && "w-full px-5 text-base",
  );

  const secondaryButtonClassName = cn(
    "inline-flex h-12 shrink-0 items-center justify-center whitespace-nowrap rounded-full border border-white/10 px-5 text-sm font-medium leading-none text-white transition-colors hover:border-white/20 hover:bg-white/5 text-center",
    mode === "mobile" && "w-full px-4 text-base",
    mode === "app" && "h-10 rounded-lg border-white/15 px-3 text-sm text-gray-200 hover:border-white/25 hover:bg-white/5",
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
      <div
        className={cn(
          "flex w-full flex-col gap-3",
          mode === "landing"
            ? "items-center sm:w-auto sm:flex-row sm:gap-3"
            : mode === "mobile"
              ? "items-stretch"
              : "sm:w-auto sm:flex-row sm:flex-wrap sm:items-center",
        )}
      >
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
            : "flex w-full flex-col gap-3 items-center sm:w-auto sm:flex-row sm:gap-3",
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
