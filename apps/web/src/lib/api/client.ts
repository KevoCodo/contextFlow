export type ApiClientOptions = {
  baseUrl?: string;
};

export function createApiClient(options: ApiClientOptions = {}) {
  const baseUrl = options.baseUrl ?? "";

  return {
    baseUrl,
    async request<T>(path: string, init?: RequestInit): Promise<T> {
      const url = baseUrl ? new URL(path, baseUrl) : path;
      const res = await fetch(url, {
        ...init,
        headers: {
          "content-type": "application/json",
          ...(init?.headers ?? {}),
        },
      });

      if (!res.ok) {
        const contentType = res.headers.get("content-type") ?? "";
        if (contentType.includes("application/json")) {
          try {
            const data = (await res.json()) as { detail?: unknown };
            if (typeof data?.detail === "string" && data.detail.trim().length > 0) {
              throw new Error(data.detail);
            }
          } catch (err) {
            if (err instanceof Error) throw err;
          }
          throw new Error(`API ${res.status} for ${path}`);
        }

        let hint: string | undefined;
        try {
          const text = await res.text();
          if (text.includes("Failed to proxy") || text.includes("ECONNREFUSED")) {
            hint =
              "API proxy failed. Verify the backend is running and `NEXT_PUBLIC_API_URL` points to it.";
          }
        } catch {
          // ignore
        }

        throw new Error(hint ?? `API ${res.status} for ${path}`);
      }

      if (res.status === 204) {
        return undefined as T;
      }

      return (await res.json()) as T;
    },
    get<T>(path: string, init?: RequestInit): Promise<T> {
      return this.request<T>(path, { ...init, method: "GET" });
    },
    post<T>(path: string, body?: unknown, init?: RequestInit): Promise<T> {
      return this.request<T>(path, {
        ...init,
        method: "POST",
        body: body === undefined ? undefined : JSON.stringify(body),
      });
    },
    patch<T>(path: string, body?: unknown, init?: RequestInit): Promise<T> {
      return this.request<T>(path, {
        ...init,
        method: "PATCH",
        body: body === undefined ? undefined : JSON.stringify(body),
      });
    },
    delete<T>(path: string, init?: RequestInit): Promise<T> {
      return this.request<T>(path, { ...init, method: "DELETE" });
    },
  };
}
