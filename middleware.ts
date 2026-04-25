import { NextResponse } from "next/server";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { isClerkConfigured } from "@/lib/auth/config";

const isProtectedRoute = createRouteMatcher([
  "/generate(.*)",
  "/api/generate(.*)",
  "/api/projects(.*)",
]);

const clerkEnabled = isClerkConfigured();

const authMiddleware = clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    const { userId } = auth();

    if (!userId) {
      const pathname = req.nextUrl.pathname;
      const search = req.nextUrl.search;
      const returnTo = `${pathname}${search}`;

      if (pathname.startsWith("/api/")) {
        return new NextResponse(
          JSON.stringify({
            error: "Unauthorized",
            redirectUrl: `/sign-in?redirect_url=${encodeURIComponent(returnTo)}`,
          }),
          {
            status: 401,
            headers: {
              "Content-Type": "application/json",
            },
          },
        );
      }

      const signInUrl = new URL("/sign-in", req.url);
      signInUrl.searchParams.set("redirect_url", returnTo);

      return NextResponse.redirect(signInUrl);
    }
  }
});

export default clerkEnabled
  ? authMiddleware
  : function middleware() {
      return NextResponse.next();
    };

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
