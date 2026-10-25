/** Shared, pure authorization rules; never trust a user ID supplied by the browser. */
export function authConfigured(env: NodeJS.ProcessEnv = process.env): boolean {
  const required = ["AUTH0_DOMAIN", "AUTH0_CLIENT_ID", "AUTH0_CLIENT_SECRET", "AUTH0_SECRET", "APP_BASE_URL", "AUTH0_OWNER_SUB"];
  if (!required.every((key) => env[key]?.trim())) return false;
  if (!/^[a-f0-9]{64}$/i.test(env.AUTH0_SECRET!)) return false;
  try {
    const url = new URL(env.APP_BASE_URL!);
    return url.origin === env.APP_BASE_URL && (url.protocol === "https:" ||
      (env.NODE_ENV !== "production" && url.protocol === "http:" && url.hostname === "localhost"));
  } catch { return false; }
}

export function isOwner(sub: unknown): boolean {
  return typeof sub === "string" && !!process.env.AUTH0_OWNER_SUB && sub === process.env.AUTH0_OWNER_SUB;
}

export function trustedWriteOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  return !!origin && origin === process.env.APP_BASE_URL &&
    request.headers.get("sec-fetch-site") !== "cross-site";
}
