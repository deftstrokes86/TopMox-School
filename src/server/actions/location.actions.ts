"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

import {
  REGION_COOKIE_NAME,
  type RegionCode,
  isRegionCode
} from "@/lib/constants/locations";

export type RegionActionResult =
  | {
      success: true;
      regionCode?: RegionCode;
    }
  | {
      success: false;
      message: string;
    };

export async function setPreferredRegionAction(
  regionCode: string
): Promise<RegionActionResult> {
  const normalizedRegionCode = regionCode?.trim();

  if (!isRegionCode(normalizedRegionCode)) {
    return {
      success: false,
      message: "Please choose a supported TopMox region."
    };
  }

  cookies().set(REGION_COOKIE_NAME, normalizedRegionCode, {
    path: "/",
    maxAge: 60 * 60 * 24 * 180,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production"
  });
  revalidatePath("/", "layout");

  return {
    success: true,
    regionCode: normalizedRegionCode
  };
}

export async function clearPreferredRegionAction(): Promise<RegionActionResult> {
  cookies().delete(REGION_COOKIE_NAME);
  revalidatePath("/", "layout");

  return {
    success: true
  };
}
