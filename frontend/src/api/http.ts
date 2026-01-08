const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export async function http<T>(
  path: string,
  options: RequestInit & { json?: unknown } = {}
): Promise<T> {
  const { json, headers, ...rest } = options;

  const res = await fetch(`${BASE_URL}${path}`, {
    ...rest,
    headers: {
      ...(json ? { "Content-Type": "application/json" } : {}),
      ...(headers ?? {}),
    },
    body: json ? JSON.stringify(json) : rest.body,
    credentials: "include", // refresh cookie
  });

  if (!res.ok) {
    let msg = `${res.status} ${res.statusText}`;
    try {
      const data = await res.json();
      if (data?.message)
        msg = Array.isArray(data.message)
          ? data.message.join(", ")
          : data.message;
      else if (data?.error) msg = data.error;
    } catch {}
    throw new Error(msg);
  }

  // 204 no content
  if (res.status === 204) return undefined as T;

  return (await res.json()) as T;
}

export { BASE_URL };
