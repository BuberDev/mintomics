const nextConfig = {
  // Enable streaming responses — critical for AI calls on Vercel
  // Without this, long AI requests would hit the 10s serverless timeout
  experimental: {
    serverComponentsExternalPackages: ["@anthropic-ai/sdk"],
  },
};

export default nextConfig;
