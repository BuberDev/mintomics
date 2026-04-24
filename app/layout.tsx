import type { Metadata } from "next";
import AuthProvider from "@/components/auth/AuthProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mintomics — Professional Tokenomics in 60 Seconds",
  description:
    "Design investor-ready mintomics for your Web3 project in under a minute. AI-powered allocation, vesting schedules, emission curves, and red flag analysis.",
  keywords: [
    "mintomics",
    "token engineering",
    "Web3",
    "DeFi",
    "token allocation",
    "vesting schedule",
    "crypto",
  ],
  openGraph: {
    title: "Mintomics",
    description: "Professional Tokenomics design for Web3 founders",
    type: "website",
  },
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <meta name="apple-mobile-web-app-title" content="Mintomics" />
      </head>
      <body className="font-sans">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
