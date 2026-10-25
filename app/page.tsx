import { Suspense } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";
import styles from "./access.module.css";
import Tracker from "@/components/Tracker";
import { getAuth0 } from "@/lib/auth0";
import { authConfigured, isOwner } from "@/lib/auth-policy";

export const dynamic = "force-dynamic";
export default async function Page() {
  if (!authConfigured()) return <AccessScreen message="Authentication is not configured. Set the required environment variables." />;
  let session;
  try { session = await getAuth0().getSession(); } catch { session = null; }
  if (!session) return <AccessScreen message="Sign in to your private application tracker." login />;
  if (!isOwner(session.user.sub)) return <AccessScreen message="This account does not have access to this tracker." />;
  return <Suspense><Tracker /></Suspense>;
}
function AccessScreen({ message, login = false }: { message: string; login?: boolean }) {
  return <main className={styles.page}>
    <header className={styles.header}>
      <span className={styles.brand}><span className={styles.mark} aria-hidden="true">↗</span> Application Tracker</span>
      <ThemeToggle />
    </header>
    <section className={styles.card} aria-labelledby="access-title">
      <div className={styles.icon} aria-hidden="true">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="4" y="6" width="16" height="15" rx="3"/><path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M8 11h8M8 15h5"/></svg>
      </div>
      <p className={styles.eyebrow}>YOUR NEXT CHAPTER</p>
      <h1 id="access-title">{login ? "A little more clarity.\nA step closer." : "Your private workspace"}</h1>
      <p className={styles.description}>{login ? "Keep your applications, conversations, and next steps together. Pick up right where you left off." : message}</p>
      {authConfigured() && <a className={styles.button} href={login ? "/auth/login" : "/auth/logout"}>
        {login && <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24"><path fill="#4285F4" d="M21.6 12.23c0-.71-.06-1.39-.18-2.05H12v3.88h5.38a4.6 4.6 0 0 1-2 3.02v2.51h3.24c1.9-1.75 2.98-4.33 2.98-7.36Z"/><path fill="#34A853" d="M12 22c2.7 0 4.96-.9 6.62-2.41l-3.24-2.51c-.9.6-2.05.96-3.38.96-2.6 0-4.8-1.76-5.59-4.12H3.07v2.59A10 10 0 0 0 12 22Z"/><path fill="#FBBC05" d="M6.41 13.92a6 6 0 0 1 0-3.84V7.49H3.07a10 10 0 0 0 0 9.02l3.34-2.59Z"/><path fill="#EA4335" d="M12 5.96c1.47 0 2.79.5 3.82 1.5l2.87-2.87A9.6 9.6 0 0 0 12 2a10 10 0 0 0-8.93 5.49l3.34 2.59A6 6 0 0 1 12 5.96Z"/></svg>}
        {login ? "Continue with Google" : "Sign out"}
        <span className={styles.arrow} aria-hidden="true">→</span>
      </a>}
      <div className={styles.note}><svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg> A private space for your job search</div>
      {login && <div className={styles.features}><span>Applications</span><span>Follow-ups</span><span>Progress</span></div>}
    </section>
    <footer className={styles.footer}>One application at a time. One step forward.</footer>
  </main>;
}
