import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { API_BASE } from "../config/api";

type AdminGuardProps = {
  children: React.ReactNode;
};

/**
 * AdminGuard is UX-only; backend (AdminSessionAuthFilter) remains source of truth.
 * It validates the current session via GET /api/admin/session (credentials: include).
 */
export function AdminGuard({ children }: AdminGuardProps) {
  const [checking, setChecking] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function verify() {
      try {
        const res = await fetch(`${API_BASE}/api/admin/session`, {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        });

        if (cancelled) return;

        if (!res.ok) {
          setAuthenticated(false);
          setChecking(false);
          return;
        }

        const data: { authenticated?: boolean } = await res.json();
        setAuthenticated(Boolean(data.authenticated));
        setChecking(false);
      } catch {
        if (cancelled) return;
        setAuthenticated(false);
        setChecking(false);
      }
    }

    verify();
    return () => {
      cancelled = true;
    };
  }, []);

  if (checking) {
    return (
      <div
        style={{
          minHeight: 240,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#a1a1aa",
          fontSize: 14,
        }}
      >
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 999,
            border: "3px solid rgba(161,161,170,0.25)",
            borderTopColor: "#a1a1aa",
            animation: "spin 0.9s linear infinite",
          }}
        />
        <style>
          {`@keyframes spin { from { transform: rotate(0deg);} to { transform: rotate(360deg);} }`}
        </style>
        <span style={{ marginLeft: 12 }}>Checking admin session…</span>
      </div>
    );
  }

  if (!authenticated) {
    return <Navigate to="/admin" replace />;
  }

  return <>{children}</>;
}