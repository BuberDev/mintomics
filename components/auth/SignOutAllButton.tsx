"use client";

export default function SignOutAllButton() {
  const handleSignOutAll = async () => {
    try {
      await fetch("/api/auth/sign-out-all", { method: "POST" });
    } finally {
      window.location.assign("/");
    }
  };

  return (
    <button
      type="button"
      onClick={() => void handleSignOutAll()}
      className="inline-flex items-center justify-center rounded-xl border border-white/15 px-4 py-3 text-sm font-semibold text-white transition-colors hover:border-white/30 hover:bg-white/5"
    >
      Sign out all devices
    </button>
  );
}
