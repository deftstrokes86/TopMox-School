import { ArrowRight } from "lucide-react";

import { Button } from "@/components/shared/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/shared/ui/card";

export default function HomePage() {
  return (
    <section className="py-20 md:py-28">
      <div className="container space-y-8">
        <div className="max-w-3xl space-y-4">
          <p className="inline-flex rounded-full bg-primary/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
            Foundation Ready
          </p>
          <h1 className="text-balance text-4xl font-semibold md:text-5xl">
            TopMox Global Tutoring project foundation is set up.
          </h1>
          <p className="text-lg text-slate-600">
            Phase 0 implementation is complete. Feature pages and business
            workflows will be added in subsequent phases.
          </p>
        </div>

        <Card className="max-w-3xl border-slate-200">
          <CardHeader>
            <CardTitle>Current status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-600">
            <p>
              Next.js App Router, TypeScript, Tailwind, shadcn/ui-style
              primitives, Prisma, and validation tooling are configured.
            </p>
            <Button className="w-fit" variant="outline">
              Next phase pending
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
