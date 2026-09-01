"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  type BuilderContentEntry,
  type FetchOptions,
  fetchBuilderContent,
} from "./builder-content-fetch";

const BUILDER_API_KEY = process.env.NEXT_PUBLIC_BUILDER_API_KEY;

interface UseBuilderDataOptions<T> extends FetchOptions {
  fallback?: T[];
  // When provided, static fallback items whose key is NOT present in the
  // Builder response are preserved alongside the Builder items. Prevents
  // Builder from acting as an all-or-nothing override for lists where the
  // static array is canonical historical data (e.g. meetings).
  mergeBy?: (item: T) => string | number | undefined;
}

interface UseBuilderDataResult<T> {
  data: T[];
  loading: boolean;
  error: Error | null;
}

/**
 * React hook to fetch all entries from a Builder.io data model.
 * Returns fallback data while loading and on error.
 */
function useBuilderData<T>(
  modelName: string,
  options?: UseBuilderDataOptions<T>
): UseBuilderDataResult<T> {
  const fallback = options?.fallback ?? [];
  const [data, setData] = useState<T[]>(fallback);
  const [loading, setLoading] = useState(!!BUILDER_API_KEY);
  const [error, setError] = useState<Error | null>(null);

  // Serialize options for dependency tracking (excluding fallback)
  const optionsKey = JSON.stringify({
    query: options?.query,
    sort: options?.sort,
    limit: options?.limit,
    offset: options?.offset,
  });

  useEffect(() => {
    if (!BUILDER_API_KEY) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    const mergeBy = options?.mergeBy;

    const doFetch = async () => {
      try {
        setLoading(true);
        const result = await fetchBuilderContent<T>(modelName, options);
        if (!cancelled) {
          if (mergeBy) {
            const builderKeys = new Set<string | number>();
            for (const item of result.results) {
              const key = mergeBy(item);
              if (key !== undefined && key !== "") builderKeys.add(key);
            }
            const preserved = fallback.filter((item) => {
              const key = mergeBy(item);
              return key === undefined || key === "" || !builderKeys.has(key);
            });
            setData([...result.results, ...preserved]);
          } else {
            setData(result.results.length > 0 ? result.results : fallback);
          }
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error(String(err)));
          setData(fallback);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    doFetch();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modelName, optionsKey]);

  return { data, loading, error };
}

interface PaginationResult<T> {
  docs: T[];
  allData: T[];
  totalDocs: number;
  totalPages: number;
  page: number;
  loading: boolean;
  error: Error | null;
}

interface UsePaginatedOptions<T> {
  page?: number;
  limit?: number;
  fetchLimit?: number;
  query?: Record<string, unknown>;
  sort?: Record<string, number>;
  fallbackData?: T[];
  /** Client-side filter applied after fetching all data */
  filter?: (item: T) => boolean;
  /** Client-side sort applied after fetching all data */
  clientSort?: (a: T, b: T) => number;
  /** Client-side search across specified fields */
  search?: string;
  searchFields?: (keyof T)[];
}

/**
 * React hook for paginated Builder.io data.
 * Fetches all entries (small datasets) and paginates client-side.
 */
function useBuilderPaginatedData<T>(
  modelName: string,
  options?: UsePaginatedOptions<T>
): PaginationResult<T> {
  const {
    page = 1,
    limit = 10,
    fetchLimit = 100,
    query,
    sort,
    fallbackData = [],
    filter,
    clientSort,
    search,
    searchFields,
  } = options ?? {};

  const {
    data: allData,
    loading,
    error,
  } = useBuilderData<T>(modelName, {
    query,
    sort,
    limit: fetchLimit,
    fallback: fallbackData,
  });

  let filtered = [...allData];

  // Apply search
  if (search && searchFields && searchFields.length > 0) {
    const lowerSearch = search.toLowerCase();
    filtered = filtered.filter((item) =>
      searchFields.some((field) => {
        const value = item[field];
        return typeof value === "string" && value.toLowerCase().includes(lowerSearch);
      })
    );
  }

  // Apply filter
  if (filter) {
    filtered = filtered.filter(filter);
  }

  // Apply sort
  if (clientSort) {
    filtered.sort(clientSort);
  }

  const totalDocs = filtered.length;
  const totalPages = Math.ceil(totalDocs / limit);
  const start = (page - 1) * limit;
  const docs = filtered.slice(start, start + limit);

  return { docs, allData, totalDocs, totalPages, page, loading, error };
}

interface UseBuilderEntryResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

interface UseBuilderEntryOptions<T> {
  fallback?: T | null;
}

/**
 * React hook to fetch a single entry from a Builder.io data model by query.
 */
function useBuilderEntry<T>(
  modelName: string,
  query: Record<string, unknown>,
  options?: UseBuilderEntryOptions<T>
): UseBuilderEntryResult<T> {
  const fallback = options?.fallback ?? null;
  const [data, setData] = useState<T | null>(fallback);
  const [loading, setLoading] = useState(!!BUILDER_API_KEY);
  const [error, setError] = useState<Error | null>(null);

  const queryKey = JSON.stringify(query);

  useEffect(() => {
    if (!BUILDER_API_KEY) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    const doFetch = async () => {
      try {
        setLoading(true);
        const result = await fetchBuilderContent<T>(modelName, {
          query,
          limit: 1,
        });
        if (!cancelled) {
          setData(result.results[0] ?? fallback);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error(String(err)));
          setData(fallback);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    doFetch();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modelName, queryKey]);

  return { data, loading, error };
}

export { fetchBuilderContent, useBuilderData, useBuilderEntry, useBuilderPaginatedData };
export type {
  BuilderContentEntry,
  FetchOptions,
  PaginationResult,
  UseBuilderDataOptions,
  UseBuilderDataResult,
  UseBuilderEntryOptions,
  UseBuilderEntryResult,
  UsePaginatedOptions,
};
