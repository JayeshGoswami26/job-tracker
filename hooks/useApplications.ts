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

  const load = useCallback(async (): Promise<boolean> => {
    const currentRequest = ++requestId.current;
    const search = new URLSearchParams({
      query: params.query,
      status: params.status,
      source: params.source,
      sort: params.sort,
      page: String(params.page),
      pageSize: String(params.pageSize),
    });
    setLoading(true);
    setLoadError("");
    try {
      const response = await fetch(`/api/applications?${search.toString()}`, { cache: "no-store" });
      if (!response.ok) {
        const body = (await response.json().catch(() => ({}))) as { error?: string };
        throw new Error(`Server error: ${body.error || "Could not load applications."}`);
      }
      const data = (await response.json()) as ApplicationListResponse;
      if (currentRequest !== requestId.current) return false;
      setApps(data.items);
      setSummary(data.summary);
      setPagination(data.pagination);
      setLoadError("");
      return true;
    } catch (error) {
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

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const create = useCallback(
    async (draft: Draft): Promise<App | null> => {
      try {
        const created = (await apiRequest("POST", "/api/applications", draft)) as App;
        await load();
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
        await apiRequest("PATCH", `/api/applications/${id}`, patch);
        await load();
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
        await load();
        return true;
      } catch (error) {
        toast("Could not delete: " + (error as Error).message);
        return false;
      }
    },
    [load, toast],
  );

  return { apps, summary, pagination, loaded, loading, error: loadError, retry: load, loadError, create, update, remove };
}
