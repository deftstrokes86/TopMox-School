import type { Metadata } from "next";
import type { ReactNode } from "react";

import "@/app/globals.css";
import { BRAND } from "@/lib/constants/brand";

export const metadata: Metadata = {
  title: BRAND.PRODUCT_NAME,
  description:
    "School-backed online tutoring for children in Nigeria and abroad."
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
