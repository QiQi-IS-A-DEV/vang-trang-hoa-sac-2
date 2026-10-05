import 'server-only';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/shared/types/supabase';
import { ApiError } from './http';
export function storageAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL, key = process.env.SUPABASE_SECRET_KEY;
  if(!url || !key) throw new ApiError(503,'Chưa cấu hình dịch vụ lưu ảnh.');
  return createClient<Database>(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
}
