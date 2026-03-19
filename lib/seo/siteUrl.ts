import { headers } from "next/headers";

export async function getSiteUrl(): Promise<string> {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;

  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = (h.get("x-forwarded-proto") ?? "").split(",")[0] || "https";

  if (!host) return `https://localhost:3000`;
  return `${proto}://${host}`;
}

