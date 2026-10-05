import { cookies } from 'next/headers';
import { z } from 'zod';
import { cmsClient, requireAdmin, sameOrigin } from '@/lib/cms/auth';
import { ApiError, body, failure, json } from '@/lib/cms/http';

const options = { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict' as const, path: '/' };
export async function GET(request: Request) {
  try { const { user } = await requireAdmin(request); return json({ user: { id: user.id, email: user.email } }); }
  catch (e) { return failure(e); }
}
export async function POST(request: Request) {
  try {
    sameOrigin(request);
    const input = z.object({ email: z.email(), password: z.string().min(1).max(200) }).strict().parse(await body(request, 4096));
    const client = cmsClient();
    const { data, error } = await client.auth.signInWithPassword(input);
    if (error || !data.session) throw new ApiError(401, 'Email hoặc mật khẩu không đúng.');
    const authenticated = cmsClient(data.session.access_token);
    const { data: admin, error: lookup } = await authenticated.from('admin_users').select('user_id').eq('user_id',data.user.id).maybeSingle();
    if (lookup) throw new ApiError(503, 'Không thể kiểm tra quyền quản trị.');
    if (!admin) { await client.auth.signOut(); throw new ApiError(403, 'Tài khoản không có quyền admin.'); }
    const jar = await cookies();
    jar.set('vths_access', data.session.access_token, { ...options, maxAge: data.session.expires_in });
    jar.set('vths_refresh', data.session.refresh_token, { ...options, maxAge: 60 * 60 * 24 * 7 });
    return json({ user: { id: data.user.id, email: data.user.email } });
  } catch (e) { return failure(e); }
}
export async function PATCH(request: Request) {
  try {
    sameOrigin(request);
    const jar = await cookies();
    const refresh = jar.get('vths_refresh')?.value;
    if (!refresh) throw new ApiError(401, 'Vui lòng đăng nhập lại.');
    const client = cmsClient();
    const { data, error } = await client.auth.refreshSession({ refresh_token: refresh });
    if (error || !data.session) throw new ApiError(401, 'Phiên đăng nhập hết hạn.');
    const { data: admin, error: lookup } = await cmsClient(data.session.access_token).from('admin_users').select('user_id').eq('user_id',data.user!.id).maybeSingle();
    if (lookup || !admin) throw new ApiError(403, 'Tài khoản không có quyền admin.');
    jar.set('vths_access',data.session.access_token,{...options,maxAge:data.session.expires_in});
    jar.set('vths_refresh',data.session.refresh_token,{...options,maxAge:604800});
    return json({ success: true });
  } catch(e) { return failure(e); }
}
export async function DELETE(request: Request) {
  try {
    sameOrigin(request);
    const jar = await cookies(), token = jar.get('vths_access')?.value;
    if (token) { const client = cmsClient(token); await client.auth.admin.signOut(token,'local'); }
    jar.set('vths_access','',{...options,maxAge:0}); jar.set('vths_refresh','',{...options,maxAge:0});
    return json({ success: true });
  } catch(e) { return failure(e); }
}
