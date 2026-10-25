"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { apiRequest } from "@/lib/api";
import type { App, ApplicationListResponse, ApplicationSort, ApplicationSummary, Draft } from "@/lib/types";
import { useToast } from "./useToast";

type Params = {
  query: string;
  status: string;
  source: string;
  sort: ApplicationSort;
  page: number;
  pageSize: number;
};

const emptySummary: ApplicationSummary = {
  total: 0,
  active: 0,
  activeTab: 0,
  byStatus: {
    Applied: 0,
    "Followed up": 0,
    Interview: 0,
    Offer: 0,
    Rejected: 0,
    Closed: 0,
  },
  due: [],
};

export function useApplications(params: Params) {
  const [apps, setApps] = useState<App[]>([]);
  const [summary, setSummary] = useState<ApplicationSummary>(emptySummary);
  const [pagination, setPagination] = useState<ApplicationListResponse["pagination"]>({
    page: params.page,
    pageSize: params.pageSize,
    total: 0,
    totalPages: 1,
  });
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const requestId = useRef(0);
  const toast = useToast();
  const summaryReady = useRef(false);
  const controller = useRef<AbortController | null>(null);

  const load = useCallback(async (refreshSummary = false): Promise<boolean> => {
    controller.current?.abort();
    const abortController = new AbortController();
    controller.current = abortController;
    const currentRequest = ++requestId.current;
    const search = new URLSearchParams({
      query: params.query,
      status: params.status,
      source: params.source,
      sort: params.sort,
      page: String(params.page),
      pageSize: String(params.pageSize),
      summary: String(refreshSummary || !summaryReady.current),
    });
    setLoading(true);
    setLoadError("");
    try {
      const response = await fetch(`/api/applications?${search.toString()}`, { cache: "no-store", signal: abortController.signal });
      if (!response.ok) {
        const body = (await response.json().catch(() => ({}))) as { error?: string };
        throw new Error(`Server error: ${body.error || "Could not load applications."}`);
      }
      const data = (await response.json()) as ApplicationListResponse;
      if (currentRequest !== requestId.current) return false;
      setApps(data.items);
      if (data.summary) {
        setSummary(data.summary);
        summaryReady.current = true;
      }
      setPagination(data.pagination);
      setLoadError("");
      return true;
    } catch (error) {
      if (abortController.signal.aborted) return false;
      if (currentRequest === requestId.current) {
        const message = error instanceof TypeError
          ? "Network error. Check your connection and try again."
          : error instanceof Error
            ? error.message
            : "Could not load applications. Check the server and try again.";
        setLoadError(message);
      }
      return false;
    } finally {
      if (currentRequest === requestId.current) {
        setLoaded(true);
        setLoading(false);
      }
    }
  }, [params.page, params.pageSize, params.query, params.sort, params.source, params.status]);

  const cancelLoad = useCallback(() => controller.current?.abort(), []);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => {
      window.clearTimeout(timer);
      cancelLoad();
    };
  }, [load, cancelLoad]);

  const create = useCallback(
    async (draft: Draft): Promise<App | null> => {
      try {
        const created = (await apiRequest("POST", "/api/applications", draft)) as App;
        summaryReady.current = false;
        void load(true);
        return created;
      } catch (error) {
        toast("Could not save: " + (error as Error).message);
        return null;
      }
    },
    [load, toast],
  );

  const update = useCallback(
    async (id: string, patch: Partial<Draft>, successMsg?: string): Promise<boolean> => {
      try {
        const updated = await apiRequest("PATCH", `/api/applications/${id}`, patch) as App;
        setApps((items) => items.map((item) => item.id === id ? updated : item));
        summaryReady.current = false;
        void load(true);
        if (successMsg) toast(successMsg);
        return true;
      } catch (error) {
        toast("Could not save: " + (error as Error).message);
        return false;
      }
    },
    [load, toast],
  );

  const remove = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        await apiRequest("DELETE", `/api/applications/${id}`);
        setApps((items) => items.filter((item) => item.id !== id));
        summaryReady.current = false;
        void load(true);
        return true;
      } catch (error) {
        toast("Could not delete: " + (error as Error).message);
        return false;
      }
    },
    [load, toast],
  );

  const retry = useCallback(() => load(true), [load]);

  return { apps, summary, pagination, loaded, loading, error: loadError, retry, loadError, create, update, remove };
}
