import React, { useEffect } from "react";
import { Helmet } from "react-helmet-async";

const ADMIN_LOGO_SRC = "/assets/images/packport-dev.png";

export function AdminLayout({ children }: { children: React.ReactNode }) {
  // Ensure the favicon is swapped ONLY while admin pages are rendered.
  // (Helmet will only apply when this layout is active.)
  return (
    <>
      <Helmet>
        <link rel="icon" href={ADMIN_LOGO_SRC} />
        <link rel="shortcut icon" href={ADMIN_LOGO_SRC} />
        <meta name="theme-color" content="#09090b" />
      </Helmet>

      {children}
    </>
  );
}

export function AdminLogo({ className }: { className?: string }) {
  useEffect(() => {
    // no-op; keeps component stable for future enhancements
  }, []);

  return (
    <img
      src={ADMIN_LOGO_SRC}
      alt="PackPort DEV"
      className={className}
    />
  );
}