"use client";

import { createContext, useContext, type ReactNode } from "react";
import { DEFAULT_SITE_INFO, type SiteInfo } from "@/lib/siteInfo";

const SiteInfoContext = createContext<SiteInfo>(DEFAULT_SITE_INFO);

/** Hands the ERP-managed contact details (phone, address, hours…) to
 * client components such as the booking menu and the mobile call bar. */
export function SiteInfoProvider({ value, children }: { value: SiteInfo; children: ReactNode }) {
  return <SiteInfoContext.Provider value={value}>{children}</SiteInfoContext.Provider>;
}

export function useSiteInfo(): SiteInfo {
  return useContext(SiteInfoContext);
}
