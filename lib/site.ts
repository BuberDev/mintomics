const fallbackSiteUrl = "https://mintomics.com";

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? fallbackSiteUrl;

export function absoluteUrl(pathname = "/") {
  const normalizedPath = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return new URL(normalizedPath, SITE_URL).toString();
}
