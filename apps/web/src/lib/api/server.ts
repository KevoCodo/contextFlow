import { headers } from "next/headers";

export async function getServerBaseUrl() {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "http";
  if (!host) {
    throw new Error("Request host header is missing");
  }
  return `${proto}://${host}`;
}

export async function serverGet<T>(path: string): Promise<T> {
  const baseUrl = await getServerBaseUrl();
  const res = await fetch(new URL(path, baseUrl), { cache: "no-store" });
  if (!res.ok) {
    let detail: string | undefined;
    try {
      const data = (await res.json()) as { detail?: string };
      detail = data?.detail;
    } catch {
      // ignore
    }
    throw new Error(detail ?? `API ${res.status} for ${path}`);
  }
  return (await res.json()) as T;
}
