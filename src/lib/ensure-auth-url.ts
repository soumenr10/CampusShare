/**
 * NextAuth v4 uses NEXTAUTH_URL to decide cookie security and CSRF origin.
 * If Vercel still has the local .env value (http://localhost:3000), sign-in
 * appears to fail because the session cookie is rejected on HTTPS.
 */
export function ensureAuthUrl() {
  if (!process.env.VERCEL) return;

  const current = process.env.NEXTAUTH_URL ?? "";
  const isLocal =
    current.length === 0 ||
    current.includes("localhost") ||
    current.includes("127.0.0.1");

  if (!isLocal) return;

  const host =
    process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
  if (!host) return;

  process.env.NEXTAUTH_URL = `https://${host.replace(/^https?:\/\//, "")}`;
}
