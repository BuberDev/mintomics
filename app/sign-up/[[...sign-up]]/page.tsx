import type { Metadata } from "next";
import AuthFlowPage from "@/components/auth/AuthFlowPage";

export const metadata: Metadata = {
  title: "Create Account",
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
      "max-image-preview": "none",
      "max-snippet": 0,
      "max-video-preview": 0,
    },
  },
};

export default function SignUpPage() {
  return <AuthFlowPage mode="sign-up" />;
}
