import { BRAND } from "@/lib/constants/brand";

export function PublicFooter() {
  return (
    <footer className="border-t border-border bg-white">
      <div className="container py-8">
        <p className="text-sm text-text-secondary">
          {BRAND.PRODUCT_NAME} by {BRAND.PARENT_BRAND}.
        </p>
      </div>
    </footer>
  );
}
