import { CTASection } from "@/components/shared/CTASection";

type AssessmentCTAProps = {
  title: string;
  description: string;
};

export function AssessmentCTA({ title, description }: AssessmentCTAProps) {
  return (
    <CTASection
      title={title}
      description={description}
      primaryHref="/book-assessment"
      secondaryHref="/pricing"
    />
  );
}
