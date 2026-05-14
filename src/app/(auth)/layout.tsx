import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-screen place-items-center bg-soft-cream px-4 py-10">
      <div className="w-full max-w-md rounded-xl border border-border bg-white p-6 shadow-card">
        {children}
      </div>
    </div>
  );
}
