import 'server-only';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';
import { ApiError } from './http';

export function cmsClient(token?: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new ApiError(503, 'Chưa cấu hình Supabase.');
  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: { headers: token ? { Authorization: `Bearer ${token}` } : {}, fetch: (input, init) => fetch(input, { ...init, cache: 'no-store', signal: AbortSignal.timeout(15000) }) },
  });
}
export function sameOrigin(request: Request) {
  if (request.headers.get('origin') !== new URL(request.url).origin) throw new ApiError(403, 'Nguồn yêu cầu không hợp lệ.');
}
export async function requireAdmin(request: Request) {
  if (!['GET','HEAD'].includes(request.method)) sameOrigin(request);
  const token = (await cookies()).get('vths_access')?.value;
  if (!token) throw new ApiError(401, 'Vui lòng đăng nhập quản trị.');
  const client = cmsClient(token);
  const { data, error } = await client.auth.getUser(token);
  if (error || !data.user) throw new ApiError(401, 'Phiên đăng nhập đã hết hạn.');
  const { data: admin, error: lookupError } = await client.from('admin_users').select('user_id').eq('user_id',data.user.id).maybeSingle();
  if (lookupError) throw new ApiError(503, 'Không thể kiểm tra quyền quản trị.');
  if (!admin) throw new ApiError(403, 'Tài khoản không có quyền admin.');
  return { client, user: data.user };
}
