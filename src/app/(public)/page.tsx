import { HeroShell } from "@/components/marketing/HeroShell";
import { TrustStrip } from "@/components/marketing/TrustStrip";

export default function PublicHomePage() {
  return (
    <section className="py-12 md:py-16">
      <div className="container space-y-8">
        <HeroShell
          title="TopMox Global Tutoring"
          subtitle="School-backed online tutoring for children in Nigeria and abroad."
        />
        <TrustStrip />
      </div>
    </section>
  );
}
