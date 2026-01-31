"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

type StatusResponse = {
  statePath: string;
  indexPath: string;
  state: {
    counts: { pending: number; running: number; done: number; failed: number };
    current: { start: string; end: string } | null;
    updated_at: string | null;
  } | null;
  index: {
    total: number;
    range: string | null;
    unique_days: number;
  } | null;
  parsed: {
    total: number;
    range: string | null;
  } | null;
  error?: string;
};

const STATUS_URL =
  "/api/fos/status?year=2017&state=data/fos/state/2017.json&index=data/fos/indexes/2017.jsonl";

export function FosScraperClient() {
  const [data, setData] = useState<StatusResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchStatus = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(STATUS_URL, { cache: "no-store" });
      const json = (await res.json()) as StatusResponse;
      if (!res.ok) {
        throw new Error(json?.error || "Failed to fetch status");
      }
      setData(json);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch status");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  useEffect(() => {
    if (!autoRefresh) return;
    const timer = setInterval(fetchStatus, 30000);
    return () => clearInterval(timer);
  }, [autoRefresh, fetchStatus]);

  const lastUpdated = useMemo(() => {
    if (!data?.state?.updated_at) return "Unknown";
    return new Date(data.state.updated_at).toLocaleString();
  }, [data?.state?.updated_at]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">FOS Scraper Monitor</h1>
          <p className="text-gray-600 mt-1">
            Live status of weekly decision scraping (2017 queue runner)
          </p>
          <div className="flex items-center gap-2 mt-3 text-sm text-gray-500">
            <span>Last update:</span>
            <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
              {lastUpdated}
            </Badge>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Auto-refresh</span>
            <Switch checked={autoRefresh} onCheckedChange={setAutoRefresh} />
          </div>
          <Button variant="outline" size="sm" onClick={fetchStatus} disabled={loading}>
            {loading ? "Refreshing..." : "Refresh now"}
          </Button>
        </div>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-700">Status error</CardTitle>
            <CardDescription className="text-red-600">{error}</CardDescription>
          </CardHeader>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Queue windows</CardTitle>
            <CardDescription>State file: {data?.statePath || "n/a"}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                Done: {data?.state?.counts.done ?? 0}
              </Badge>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                Running: {data?.state?.counts.running ?? 0}
              </Badge>
              <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                Pending: {data?.state?.counts.pending ?? 0}
              </Badge>
              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                Failed: {data?.state?.counts.failed ?? 0}
              </Badge>
            </div>
            <div className="text-sm text-gray-600">
              Current window:{" "}
              <span className="font-medium text-gray-900">
                {data?.state?.current
                  ? `${data.state.current.start} → ${data.state.current.end}`
                  : "Idle"}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Index coverage</CardTitle>
            <CardDescription>Index file: {data?.indexPath || "n/a"}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>Total rows:</span>
              <span className="font-medium text-gray-900">{data?.index?.total ?? 0}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>Date range:</span>
              <span className="font-medium text-gray-900">{data?.index?.range || "n/a"}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>Unique days:</span>
              <span className="font-medium text-gray-900">{data?.index?.unique_days ?? 0}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Parsed coverage</CardTitle>
            <CardDescription>From data/fos/parsed</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>Parsed decisions:</span>
              <span className="font-medium text-gray-900">{data?.parsed?.total ?? 0}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>Date range:</span>
              <span className="font-medium text-gray-900">{data?.parsed?.range || "n/a"}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tips</CardTitle>
            <CardDescription>Helpful commands</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-gray-600">
            <div className="font-mono text-xs bg-gray-50 border border-gray-200 rounded p-2">
              npm run fos:queue -- --start-date 2017-01-01 --end-date 2017-12-31 --window-days 7 --index
              data/fos/indexes/2017.jsonl --state data/fos/state/2017.json
            </div>
            <div className="font-mono text-xs bg-gray-50 border border-gray-200 rounded p-2">
              npm run fos:status -- --state data/fos/state/2017.json --year 2017 --index
              data/fos/indexes/2017.jsonl
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
