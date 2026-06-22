"use client";

import { useEffect, useState } from "react";
import { health, API_BASE } from "@/lib/api";

type State =
  | { kind: "loading" }
  | { kind: "ok"; status: string }
  | { kind: "error"; message: string };

export function HealthCheck() {
  const [state, setState] = useState<State>({ kind: "loading" });

  useEffect(() => {
    health().then(({ data, error }) => {
      if (error) {
        setState({ kind: "error", message: error });
      } else if (data) {
        setState({ kind: "ok", status: data.status });
      }
    });
  }, []);

  if (state.kind === "loading") {
    return (
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-2 text-muted text-sm">
        <span className="w-2 h-2 rounded-full bg-muted animate-pulse" />
        Connecting to {API_BASE}...
      </div>
    );
  }

  if (state.kind === "error") {
    return (
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-950 text-red-300 text-sm border border-red-900">
        <span className="w-2 h-2 rounded-full bg-red-400" />
        Backend offline: {state.message}
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent-soft text-accent text-sm border border-accent/30">
      <span className="w-2 h-2 rounded-full bg-accent" />
      Connected to backend · status: {state.status}
    </div>
  );
}