"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { apiRequest } from "@/lib/api";
import type { App, Draft } from "@/lib/types";
import { useToast } from "./useToast";

/**
 * Client state for the applications collection with optimistic writes.
 * All mutations go through commit() so appsRef always mirrors state —
 * snapshot/rollback stays correct even if two writes race.
 */
export function useApplications() {
  const [apps, setApps] = useState<App[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [loadError, setLoadError] = useState("");
  const appsRef = useRef<App[]>([]);
  const toast = useToast();

  const commit = useCallback((next: App[]) => {
    appsRef.current = next;
    setApps(next);
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const r = await fetch("/api/applications", { cache: "no-store" });
        if (!r.ok) {
          const j = (await r.json().catch(() => ({}))) as { error?: string };
          throw new Error(j.error || "Could not load applications.");
        }
        const data = (await r.json()) as App[];
        if (active) {
          commit(data);
          setLoadError("");
        }
      } catch (e) {
        if (active) {
          setLoadError((e as Error).message || "Could not load applications. Check the server and reload.");
        }
      } finally {
        if (active) setLoaded(true);
      }
    })();
    return () => {
      active = false;
    };
  }, [commit]);

  const create = useCallback(
    async (draft: Draft): Promise<App | null> => {
      try {
        const created = (await apiRequest("POST", "/api/applications", draft)) as App;
        commit([created, ...appsRef.current]);
        return created;
      } catch (e) {
        toast("Could not save: " + (e as Error).message);
        return null;
      }
    },
    [commit, toast],
  );

  const update = useCallback(
    async (id: string, patch: Partial<Draft>, successMsg?: string): Promise<boolean> => {
      const snapshot = appsRef.current;
      commit(snapshot.map((a) => (a.id === id ? { ...a, ...patch, updatedAt: Date.now() } : a)));
      try {
        const server = (await apiRequest("PATCH", `/api/applications/${id}`, patch)) as App;
        commit(appsRef.current.map((a) => (a.id === id ? server : a)));
        if (successMsg) toast(successMsg);
        return true;
      } catch (e) {
        commit(snapshot);
        toast("Could not save: " + (e as Error).message);
        return false;
      }
    },
    [commit, toast],
  );

  const remove = useCallback(
    async (id: string): Promise<boolean> => {
      const snapshot = appsRef.current;
      const target = snapshot.find((a) => a.id === id);
      commit(snapshot.filter((a) => a.id !== id));
      try {
        await apiRequest("DELETE", `/api/applications/${id}`);
        if (target) toast("Deleted " + target.company);
        return true;
      } catch (e) {
        commit(snapshot);
        toast("Could not delete: " + (e as Error).message);
        return false;
      }
    },
    [commit, toast],
  );

  return { apps, loaded, loadError, create, update, remove };
}
