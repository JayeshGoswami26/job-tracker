export async function apiRequest(method: "POST" | "PATCH" | "DELETE", url: string, body?: unknown): Promise<unknown> {
  const r = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!r.ok) {
    const j = (await r.json().catch(() => ({}))) as { error?: string };
    throw new Error(j.error || "Request failed");
  }
  if (r.status === 204) return null;
  return r.json();
}
