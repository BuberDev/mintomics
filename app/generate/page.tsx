import { redirect } from "next/navigation";
import { requireCurrentAuth } from "@/lib/auth/session";
import GenerateClient from "@/components/generate/GenerateClient";

export const runtime = "nodejs";

export default async function GeneratePage() {
  const auth = await requireCurrentAuth("/generate");

  if (!auth?.user) {
    redirect("/sign-in?redirect_url=%2Fgenerate");
  }

  return <GenerateClient />;
}
