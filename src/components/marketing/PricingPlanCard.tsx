import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type PricingPlanCardProps = {
  name: string;
  bestFor: string;
  sessionsPerWeek: number;
  coreOutcomes: string[];
  parentReceives: string[];
  progressVisibility: string;
  priceNote?: string;
  href?: string;
};

export function PricingPlanCard({
  name,
  bestFor,
  sessionsPerWeek,
  coreOutcomes,
  parentReceives,
  progressVisibility,
  priceNote,
  href = "/book-assessment"
}: PricingPlanCardProps) {
  return (
    <Card className="h-full border-border shadow-soft">
      <CardContent className="flex h-full flex-col p-6">
        <h3 className="text-xl font-semibold text-text-primary">{name}</h3>
        <p className="mt-2 text-sm font-medium text-royal-blue">
          {priceNote ?? "Final recommendation after child assessment."}
        </p>

        <p className="mt-4 text-sm text-text-secondary">
          <span className="font-semibold text-text-primary">Best for:</span>{" "}
          {bestFor}
        </p>
        <p className="mt-2 text-sm text-text-secondary">
          <span className="font-semibold text-text-primary">Sessions per week:</span>{" "}
          {sessionsPerWeek}
        </p>

        <div className="mt-4 space-y-3">
          <div>
            <p className="text-sm font-semibold text-text-primary">
              Core outcomes
            </p>
            <ul className="mt-2 space-y-1.5 text-sm text-text-secondary">
              {coreOutcomes.map((item) => (
                <li key={item}>- {item}</li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold text-text-primary">
              What parents receive
            </p>
            <ul className="mt-2 space-y-1.5 text-sm text-text-secondary">
              {parentReceives.map((item) => (
                <li key={item}>- {item}</li>
              ))}
            </ul>
          </div>

          <p className="text-sm text-text-secondary">
            <span className="font-semibold text-text-primary">
              Progress visibility:
            </span>{" "}
            {progressVisibility}
          </p>
        </div>

        <Button asChild className="mt-6 w-full">
          <Link href={href}>Book a Child Assessment</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
