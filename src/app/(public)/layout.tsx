import type { ReactNode } from "react";

import { PublicFooter } from "@/components/marketing/public-footer";
import { PublicHeader } from "@/components/marketing/public-header";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <PublicHeader />
      <main>{children}</main>
      <PublicFooter />
    </div>
  );
}
