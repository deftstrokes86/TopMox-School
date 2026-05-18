"use client";

import { useId, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, MapPin } from "lucide-react";

import {
  REGION_OPTIONS,
  type RegionCode,
  getRegionConfig
} from "@/lib/constants/locations";
import { setPreferredRegionAction } from "@/server/actions/location.actions";

type RegionSwitcherProps = {
  currentRegionCode: RegionCode;
  compact?: boolean;
};

export function RegionSwitcher({
  currentRegionCode,
  compact = false
}: RegionSwitcherProps) {
  const router = useRouter();
  const selectId = useId();
  const [selectedRegion, setSelectedRegion] =
    useState<RegionCode>(currentRegionCode);
  const [isPending, startTransition] = useTransition();
  const currentRegion = getRegionConfig(selectedRegion);

  function handleRegionChange(value: string) {
    const nextRegion = value as RegionCode;
    setSelectedRegion(nextRegion);

    startTransition(async () => {
      const result = await setPreferredRegionAction(nextRegion);

      if (result.success) {
        router.refresh();
      }
    });
  }

  return (
    <div
      className={
        compact
          ? "flex items-center gap-2 rounded-full border border-border bg-white px-3 py-1.5 text-xs shadow-soft"
          : "flex flex-col gap-2 rounded-2xl border border-royal-blue/20 bg-white/90 p-3 shadow-soft sm:flex-row sm:items-center"
      }
    >
      <div className="flex min-w-0 items-center gap-2 text-deep-navy">
        {isPending ? (
          <Loader2 className="h-4 w-4 shrink-0 animate-spin text-royal-blue" />
        ) : (
          <MapPin className="h-4 w-4 shrink-0 text-royal-blue" />
        )}
        <span className={compact ? "sr-only" : "text-sm font-semibold"}>
          Region
        </span>
      </div>

      <label className="sr-only" htmlFor={selectId}>
        Choose TopMox region
      </label>
      <select
        id={selectId}
        aria-label="Choose TopMox region"
        value={selectedRegion}
        onChange={(event) => handleRegionChange(event.target.value)}
        disabled={isPending}
        className="max-w-full rounded-full border border-border bg-white px-3 py-1.5 text-xs font-semibold text-text-primary outline-none transition focus:border-royal-blue focus:ring-2 focus:ring-royal-blue/20 disabled:cursor-wait disabled:opacity-70"
      >
        {REGION_OPTIONS.map((region) => (
          <option key={region.code} value={region.code}>
            {region.name} · {region.currency}
          </option>
        ))}
      </select>

      {!compact ? (
        <p className="text-xs text-text-secondary">
          Showing {currentRegion.currency} guidance. You can change this anytime.
        </p>
      ) : null}
    </div>
  );
}
