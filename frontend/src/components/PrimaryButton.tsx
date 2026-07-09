import React from "react";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary";
};

export function PrimaryButton({
  variant = "primary",
  className = "",
  disabled,
  type = "button",
  ...rest
}: Props) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-white/70 disabled:opacity-50 disabled:cursor-not-allowed";
  const styles =
    variant === "secondary"
      ? "bg-white/5 text-zinc-50 hover:bg-white/10 focus-visible:ring-white/70"
      : "bg-gradient-to-r from-indigo-500 to-violet-500 text-white hover:from-indigo-400 hover:to-violet-400 focus-visible:ring-white/70";

  return (
    <button
      type={type}
      disabled={disabled}
      className={`${base} ${styles} ${className}`}
      {...rest}
    />
  );
}