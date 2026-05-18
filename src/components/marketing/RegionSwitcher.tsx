"use client";

import { useEffect, useId, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, MapPin } from "lucide-react";

import {
  REGION_OPTIONS,
  type RegionCode,
  getRegionConfig
} from "@/lib/constants/locations";
import { setPreferredRegionAction } from "@/server/actions/location.actions";

const regionSyncEventName = "topmox-region-sync";

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

  useEffect(() => {
    setSelectedRegion(currentRegionCode);
  }, [currentRegionCode]);

  useEffect(() => {
    const handleRegionSync = (event: Event) => {
      const regionSyncEvent = event as CustomEvent<{ regionCode?: RegionCode }>;
      const regionCode = regionSyncEvent.detail?.regionCode;

      if (!regionCode) {
        return;
      }

      const nextRegion = REGION_OPTIONS.find(
        (region) => region.code === regionCode
      );

      if (!nextRegion) {
        return;
      }

      setSelectedRegion((current) => {
        if (current === nextRegion.code) {
          return current;
        }

        return nextRegion.code;
      });
    };

    window.addEventListener(regionSyncEventName, handleRegionSync);

    return () => {
      window.removeEventListener(regionSyncEventName, handleRegionSync);
    };
  }, []);

  function handleRegionChange(value: string) {
    const nextRegion = REGION_OPTIONS.find((region) => region.code === value);

    if (!nextRegion || nextRegion.code === selectedRegion) {
      return;
    }

    setSelectedRegion(nextRegion.code);

    startTransition(async () => {
      const result = await setPreferredRegionAction(nextRegion.code);

      if (!result.success) {
        setSelectedRegion(currentRegionCode);
        return;
      }

      window.dispatchEvent(
        new CustomEvent(regionSyncEventName, {
          detail: { regionCode: nextRegion.code }
        })
      );

      router.refresh();
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
            {region.name} &#183; {region.currency}
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
