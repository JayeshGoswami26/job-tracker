import "server-only";
import { NextResponse } from "next/server";
import { getAuth0 } from "./auth0";
import { authConfigured, isOwner, trustedWriteOrigin } from "./auth-policy";

export const PRIVATE_HEADERS = { "Cache-Control": "private, no-store, max-age=0" };
export async function requireOwner(request: Request): Promise<NextResponse | null> {
  const deny = (error: string, status: number) => NextResponse.json({ error }, { status, headers: PRIVATE_HEADERS });
  if (!authConfigured()) return deny("Authentication is not configured", 503);
  let session;
  try { session = await getAuth0().getSession(); }
  catch { return deny("Please sign in again", 401); }
  if (!session) return deny("Authentication required", 401);
  if (!isOwner(session.user.sub)) return deny("Access denied", 403);
  if (!["GET", "HEAD", "OPTIONS"].includes(request.method) && !trustedWriteOrigin(request)) {
    return deny("Request origin is not allowed", 403);
  }
  return null;
}
