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
    await auth().protect();
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
