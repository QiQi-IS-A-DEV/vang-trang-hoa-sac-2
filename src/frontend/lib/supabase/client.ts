import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/shared/types";

let client: SupabaseClient<Database> | null = null;

function publicKey() {
  return process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
}

export function isSupabaseConfigured() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = publicKey();
  if (!url || !key || url.includes("your-project") || key.startsWith("your-") || key.startsWith("sb_secret_")) return false;
  try {
    if (key.startsWith("eyJ")) {
      const payload = JSON.parse(atob(key.split(".")[1]));
      if (payload.role !== "anon") return false;
    } else if (!key.startsWith("sb_publishable_")) return false;
    return new URL(url).protocol === "https:";
  } catch { return false; }
}

export function createSupabaseBrowserClient() {
  if (!isSupabaseConfigured()) {
    throw new Error("Hãy cấu hình URL và publishable key của Supabase trước khi kết nối.");
  }
  if (!client) {
    client = createClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, publicKey()!);
  }
  return client;
}
