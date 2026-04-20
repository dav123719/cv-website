"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { trackClientEvent } from "@/lib/client-analytics";

export function AnalyticsBeacon() {
  const pathname = usePathname();

  useEffect(() => {
    void trackClientEvent("page_view", pathname);
  }, [pathname]);

  return null;
}
