import React from "react";
import { Link } from "react-router-dom";
import { AdminLogo } from "../layouts/AdminLayout";

type Card = { title: string; href: string; desc: string };

const cards: Card[] = [
  {
    title: "Welcome",
    href: "/admin/dashboard/welcome",
    desc: "Quick overview & shortcuts.",
  },
  {
    title: "Analytics",
    href: "/admin/dashboard/analytics",
    desc: "Conversion & usage metrics.",
  },
  {
    title: "Errors",
    href: "/admin/dashboard/errors",
    desc: "Failed conversions and issues.",
  },
  {
    title: "Logs",
    href: "/admin/dashboard/logs",
    desc: "Server activity log stream.",
  },
  {
    title: "Activity",
    href: "/admin/dashboard/activity",
    desc: "Live admin actions & events.",
  },
  {
    title: "Conversions",
    href: "/admin/dashboard/conversions",
    desc: "Conversion history and outputs.",
  },
  {
    title: "System",
    href: "/admin/dashboard/system",
    desc: "Health, storage, performance.",
  },
  {
    title: "Security",
    href: "/admin/dashboard/security",
    desc: "Session and access controls.",
  },
  {
    title: "Settings",
    href: "/admin/dashboard/settings",
    desc: "Admin preferences & configuration.",
  },
];

function CardGrid() {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
        gap: 16,
        marginTop: 18,
      }}
    >
      {cards
        .filter((c) => c.title !== "Welcome")
        .map((c) => (
          <Link
            key={c.href}
            to={c.href}
            style={{
              textDecoration: "none",
              color: "inherit",
              borderRadius: 16,
              padding: 16,
              border: "1px solid rgba(255,255,255,0.08)",
              background: "rgba(9,9,11,0.4)",
              backdropFilter: "blur(6px)",
              boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
              transition: "transform 120ms ease, border-color 120ms ease",
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget;
              el.style.transform = "translateY(-1px)";
              el.style.borderColor = "rgba(255,255,255,0.18)";
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget;
              el.style.transform = "translateY(0px)";
              el.style.borderColor = "rgba(255,255,255,0.08)";
            }}
          >
            <div style={{ fontSize: 14, color: "rgba(255,255,255,0.75)" }}>
              Admin section
            </div>
            <div style={{ fontSize: 18, marginTop: 6, fontWeight: 700 }}>
              {c.title}
            </div>
            <div style={{ marginTop: 8, fontSize: 13, color: "rgba(255,255,255,0.7)" }}>
              {c.desc}
            </div>
            <div style={{ marginTop: 14, fontSize: 12, color: "rgba(255,255,255,0.9)" }}>
              Open →
            </div>
          </Link>
        ))}
    </div>
  );
}

export default function AdminDashboardWelcomePage() {
  return (
    <div style={{ padding: 20, maxWidth: 1050, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <AdminLogo className="h-10 w-auto" />
        <div>
          <h1 style={{ margin: 0, fontSize: 26 }}>Admin Dashboard</h1>
          <div style={{ marginTop: 6, fontSize: 13, color: "rgba(255,255,255,0.7)" }}>
            Navigate through admin sections. Backend authentication remains the source of truth.
          </div>
        </div>
      </div>

      <div
        style={{
          marginTop: 18,
          borderRadius: 18,
          border: "1px solid rgba(255,255,255,0.08)",
          padding: 18,
          background: "rgba(9,9,11,0.35)",
          backdropFilter: "blur(8px)",
        }}
      >
        <div style={{ fontSize: 14, color: "rgba(255,255,255,0.8)" }}>Welcome</div>
        <div style={{ fontSize: 18, marginTop: 6, fontWeight: 700 }}>
          Choose a section to continue.
        </div>
        <div style={{ marginTop: 8, fontSize: 13, color: "rgba(255,255,255,0.7)" }}>
          Each page verifies your admin session via the backend API.
        </div>

        <CardGrid />
      </div>
    </div>
  );
}