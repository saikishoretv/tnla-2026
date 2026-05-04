"use client";

import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const TEN_MINUTES = 10 * 60 * 1000;

export function useLiveSummary() {
  return useSWR("/api/summary", fetcher, {
    refreshInterval: TEN_MINUTES,
    revalidateOnFocus: false,
  });
}

export function useLiveConstituencies() {
  return useSWR("/api/constituencies", fetcher, {
    refreshInterval: TEN_MINUTES,
    revalidateOnFocus: false,
  });
}

export function useLiveConstituency(id: number) {
  return useSWR(`/api/constituency/${id}`, fetcher, {
    refreshInterval: TEN_MINUTES,
    revalidateOnFocus: false,
  });
}
