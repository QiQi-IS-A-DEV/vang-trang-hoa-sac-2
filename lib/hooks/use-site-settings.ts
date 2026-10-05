"use client";

import { useEffect, useState } from "react";
import { defaultSiteContent, type SiteContentSettings } from "@/data/site-content";

export function useSiteSettings() {
  const [settings, setSettings] = useState<SiteContentSettings>(defaultSiteContent);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/settings");
        if (res.ok) {
          const data = await res.json();
          if (data.settings) {
            setSettings(data.settings);
          }
        }
      } catch (err) {
        console.warn("Dùng cài đặt mặc định:", err);
      }
    }
    load();
  }, []);

  return settings;
}
