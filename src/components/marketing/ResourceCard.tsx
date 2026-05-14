import Link from "next/link";

import type { ResourceArticle } from "@/lib/demo-data/resources";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type ResourceCardProps = {
  resource: Pick<ResourceArticle, "title" | "excerpt" | "category" | "slug">;
};

export function ResourceCard({ resource }: ResourceCardProps) {
  return (
    <Card className="h-full border-border shadow-soft">
      <CardContent className="flex h-full flex-col p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-royal-blue">
          {resource.category}
        </p>
        <h3 className="mt-3 text-xl font-semibold text-text-primary">
          {resource.title}
        </h3>
        <p className="mt-3 text-sm text-text-secondary">{resource.excerpt}</p>
        <Button asChild variant="outline" className="mt-6 w-fit">
          <Link href={`/resources/${resource.slug}`}>Read More</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
