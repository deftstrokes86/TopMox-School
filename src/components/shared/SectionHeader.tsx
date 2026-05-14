import { cn } from "@/lib/utils";

type SectionHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
};

export function SectionHeader({
  eyebrow,
  title,
  description,
  align = "left",
  className
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "space-y-3",
        align === "center" ? "mx-auto max-w-3xl text-center" : "max-w-3xl",
        className
      )}
    >
      {eyebrow ? (
        <p className="inline-flex rounded-full bg-accent px-4 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-accent-foreground">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="text-2xl font-semibold text-text-primary md:text-3xl">
        {title}
      </h2>
      {description ? (
        <p className="text-sm text-text-secondary md:text-base">
          {description}
        </p>
      ) : null}
    </div>
  );
}
