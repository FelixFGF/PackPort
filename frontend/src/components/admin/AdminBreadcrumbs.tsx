import React from "react";
import { Link } from "react-router-dom";

export type BreadcrumbItem = { label: string; to?: string };

export function AdminBreadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Breadcrumbs" className="text-xs sm:text-sm">
      <ol className="flex flex-wrap items-center gap-2">
        {items.map((it, idx) => {
          const isLast = idx === items.length - 1;
          return (
            <li key={`${it.label}-${idx}`} className="flex items-center gap-2">
              {it.to && !isLast ? (
                <Link to={it.to} className="text-pp-muted hover:text-white transition-colors">
                  {it.label}
                </Link>
              ) : (
                <span className="text-pp-text font-medium">{it.label}</span>
              )}
              {!isLast && <span className="text-pp-muted-2">/</span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}