import React from "react";

export default function AdminDashboardPlaceholderPage({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div style={{ padding: 20, maxWidth: 1050, margin: "0 auto" }}>
      <h1 style={{ margin: 0, fontSize: 26 }}>{title}</h1>
      <p style={{ marginTop: 8, fontSize: 13, color: "rgba(255,255,255,0.7)" }}>
        {subtitle}
      </p>

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
        <div style={{ fontSize: 14, color: "rgba(255,255,255,0.85)" }}>
          Placeholder page
        </div>
        <div style={{ marginTop: 10, fontSize: 13, color: "rgba(255,255,255,0.7)" }}>
          Protected admin route: {title}
        </div>
      </div>
    </div>
  );
}