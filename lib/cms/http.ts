import { z } from 'zod';

export class ApiError extends Error {
  constructor(public status: number, message: string) { super(message); }
}
export function json(value: unknown, status = 200) {
  return Response.json(value, { status, headers: { 'Cache-Control': 'no-store' } });
}
export function failure(error: unknown) {
  if (error instanceof ApiError) return json({ error: error.message }, error.status);
  if (error instanceof z.ZodError) return json({ error: 'Dữ liệu không hợp lệ.', fields: error.issues.map(i => ({ field: i.path.join('.'), message: i.message })) }, 400);
  console.error('CMS request failed', error instanceof Error ? error.message : 'Database error');
  return json({ error: 'Không thể thực hiện thao tác. Vui lòng thử lại.' }, 503);
}
export async function body(request: Request, max = 512000): Promise<unknown> {
  if (!request.headers.get('content-type')?.includes('application/json')) throw new ApiError(415, 'Cần gửi dữ liệu JSON.');
  if (Number(request.headers.get('content-length')) > max) throw new ApiError(413, 'Dữ liệu quá lớn.');
  const reader = request.body?.getReader();
  if (!reader) throw new ApiError(400, 'Thiếu dữ liệu.');
  const chunks: Uint8Array[] = []; let size = 0;
  for (;;) {
    const { done, value } = await reader.read(); if (done) break;
    size += value.length;
    if (size > max) { await reader.cancel(); throw new ApiError(413, 'Dữ liệu quá lớn.'); }
    chunks.push(value);
  }
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8')); }
  catch { throw new ApiError(400, 'JSON không hợp lệ.'); }
}
export function dbError(error: { code?: string } | null) {
  if (!error) return;
  if (error.code === '23503') throw new ApiError(409, 'Dữ liệu đang được sử dụng hoặc liên kết không tồn tại. Hãy gỡ liên kết trước.');
  if (error.code === '23505') throw new ApiError(409, 'Mã hoặc đường dẫn đã tồn tại.');
  if (['23514','22P02','22023'].includes(error.code || '')) throw new ApiError(400, 'Dữ liệu không hợp lệ; bài đã đăng cần ảnh bìa và album.');
  throw new ApiError(503, 'Không thể lưu hoặc đọc dữ liệu.');
}
export function pagination(request: Request) {
  const query = new URL(request.url).searchParams;
  const limit = Number(query.get('limit') ?? 24), offset = Number(query.get('offset') ?? 0);
  if (!Number.isInteger(limit) || limit < 1 || limit > 100 || !Number.isSafeInteger(offset) || offset < 0 || offset > 1000000) throw new ApiError(400, 'Phân trang không hợp lệ.');
  return { query, limit, offset };
}
