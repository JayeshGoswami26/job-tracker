import "server-only";
import { Auth0Client } from "@auth0/nextjs-auth0/server";
import { authConfigured } from "./auth-policy";

let client: Auth0Client | undefined;
export function getAuth0(): Auth0Client {
  if (!authConfigured()) throw new Error("Authentication is not configured");
  return client ??= new Auth0Client({
    appBaseUrl: process.env.APP_BASE_URL,
    authorizationParameters: { connection: "google-oauth2", scope: "openid profile email" },
    enableAccessTokenEndpoint: false,
    session: { cookie: { sameSite: "lax", secure: process.env.APP_BASE_URL!.startsWith("https:") } },
  });
}
