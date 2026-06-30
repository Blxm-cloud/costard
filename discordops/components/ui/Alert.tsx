"use client";

type Variant = "error" | "success" | "warning";

const variantStyles: Record<Variant, string> = {
  error: "border-danger/40 bg-danger/10 text-red-300 shadow-glow-danger",
  success: "border-emerald/40 bg-emerald/10 text-emerald-300 shadow-glow-emerald",
  warning: "border-amber-500/40 bg-amber-500/10 text-amber-300",
};

export function Alert({ variant, children }: { variant: Variant; children: React.ReactNode }) {
  return (
    <div className={`rounded-lg border px-4 py-3 text-sm ${variantStyles[variant]}`} role="alert">
      {children}
    </div>
  );
}
