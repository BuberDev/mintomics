"use client";

export default function SignOutButton() {
  const handleSignOut = async () => {
    try {
      await fetch("/api/auth/sign-out", { method: "POST" });
    } finally {
      window.location.assign("/");
    }
  };

  return (
    <button
      type="button"
      onClick={() => void handleSignOut()}
      className="inline-flex items-center justify-center rounded-xl border border-white/15 px-4 py-3 text-sm font-semibold text-white transition-colors hover:border-white/30 hover:bg-white/5"
    >
      Sign out
    </button>
  );
}
