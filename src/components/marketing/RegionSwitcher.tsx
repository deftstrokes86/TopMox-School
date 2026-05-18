"use client";

import { useEffect, useId, useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ChevronDown, Loader2 } from "lucide-react";

import {
  DEFAULT_REGION_CODE,
  PUBLIC_REGION_OPTIONS,
  type RegionCode,
  getRegionConfig
} from "@/lib/constants/locations";
import { setPreferredRegionAction } from "@/server/actions/location.actions";

const regionSyncEventName = "topmox-region-sync";

type RegionSwitcherProps = {
  currentRegionCode: RegionCode;
  compact?: boolean;
  jumpToLocation?: boolean;
};

export function RegionSwitcher({
  currentRegionCode,
  compact = false,
  jumpToLocation = false
}: RegionSwitcherProps) {
  const router = useRouter();
  const pathname = usePathname();
  const selectId = useId();
  const pathRegion = PUBLIC_REGION_OPTIONS.find(
    (region) => pathname === `/locations/${region.slug}`
  );
  const isLocationRoute =
    pathname === "/locations" || pathname.startsWith("/locations/");
  const shouldJumpToLocation = jumpToLocation || isLocationRoute;
  const safeCurrentRegionCode =
    pathRegion?.code ??
    (currentRegionCode === "global" ? DEFAULT_REGION_CODE : currentRegionCode);
  const [selectedRegion, setSelectedRegion] =
    useState<RegionCode>(safeCurrentRegionCode);
  const [isPending, startTransition] = useTransition();
  const currentRegion = getRegionConfig(selectedRegion);

  useEffect(() => {
    setSelectedRegion(safeCurrentRegionCode);
  }, [safeCurrentRegionCode]);

  useEffect(() => {
    const handleRegionSync = (event: Event) => {
      const regionSyncEvent = event as CustomEvent<{ regionCode?: RegionCode }>;
      const regionCode = regionSyncEvent.detail?.regionCode;

      if (!regionCode) {
        return;
      }

      const nextRegion = PUBLIC_REGION_OPTIONS.find(
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
    const nextRegion = PUBLIC_REGION_OPTIONS.find(
      (region) => region.code === value
    );

    if (!nextRegion || nextRegion.code === selectedRegion) {
      return;
    }

    setSelectedRegion(nextRegion.code);
    window.dispatchEvent(
      new CustomEvent(regionSyncEventName, {
        detail: { regionCode: nextRegion.code }
      })
    );

    if (shouldJumpToLocation) {
      router.push(`/locations/${nextRegion.slug}`);
    }

    startTransition(async () => {
      const result = await setPreferredRegionAction(nextRegion.code);

      if (!result.success) {
        if (!shouldJumpToLocation) {
          setSelectedRegion(safeCurrentRegionCode);
        }
        return;
      }

      if (!shouldJumpToLocation) {
        router.refresh();
      }
    });
  }

  const shellClasses = compact
    ? "relative flex items-center gap-2 rounded-full border border-border bg-white px-3 py-1.5 text-xs shadow-soft"
    : "relative flex flex-col gap-2 rounded-2xl border border-royal-blue/20 bg-white/90 p-3 shadow-soft sm:flex-row sm:items-center";

  return (
    <div className={shellClasses} data-region-switcher>
      <div
        className="pointer-events-none relative z-10 flex min-w-0 items-center gap-1.5 text-deep-navy"
        data-testid="region-switcher-trigger"
      >
        {isPending ? (
          <Loader2 className="h-4 w-4 shrink-0 animate-spin text-royal-blue" />
        ) : (
          <span aria-hidden="true" className="text-lg leading-none">
            {currentRegion.flag}
          </span>
        )}
        <ChevronDown className="h-3.5 w-3.5 text-royal-blue" />
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
        className="absolute inset-0 z-20 h-full w-full cursor-pointer appearance-none opacity-0 disabled:cursor-wait"
      >
        {PUBLIC_REGION_OPTIONS.map((region) => (
          <option key={region.code} value={region.code}>
            {region.flag} {region.name} - {region.currency}
          </option>
        ))}
      </select>
    </div>
  );
}
