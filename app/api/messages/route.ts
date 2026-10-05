import { createSupabaseServerClient } from "@/lib/supabase/server";
import { parseMessage } from "@/lib/memories/validation";

const columns = "id,author_name,role_team,message,leaf_type,slot_index,created_at";
const headers = { "Cache-Control": "no-store" };
const fail = (error: string, status: number) => Response.json({ error }, { status, headers });

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const limit = Number(params.get("limit") ?? "100");
  const rawAfter = params.get("after");
  const after = rawAfter === null ? null : Number(rawAfter);
  if (!Number.isSafeInteger(limit) || limit < 1 || limit > 500 || (rawAfter !== null && (!/^\d+$/.test(rawAfter) || !Number.isSafeInteger(after)))) return fail("Tham số phân trang không hợp lệ.", 400);
  try {
    let query = createSupabaseServerClient().from("messages").select(columns).order("slot_index").limit(limit + 1);
    if (after !== null) query = query.gt("slot_index", after);
    const { data, error } = await query;
    if (error) return fail("Chưa tải được lời nhắn. Vui lòng thử lại.", 503);
    const more = data.length > limit;
    const items = data.slice(0, limit);
    return Response.json({ items, next_cursor: more ? items[items.length - 1].slot_index : null }, { headers });
  } catch { return fail("Không gian lời nhắn tạm thời chưa sẵn sàng.", 503); }
}

export async function POST(request: Request) {
  if (!(request.headers.get("content-type") ?? "").toLowerCase().startsWith("application/json")) return fail("Hãy gửi dữ liệu JSON.", 415);
  let input;
  try {
    // Bound decoded content before parsing. The maximum valid input fits well below 16KB.
    const reader = request.body?.getReader();
    if (!reader) return fail("Thiếu dữ liệu lời nhắn.", 400);
    const chunks: Uint8Array[] = [];
    let size = 0;
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 16384) { await reader.cancel(); return fail("Dữ liệu gửi quá lớn.", 413); }
      chunks.push(value);
    }
    const buffer = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) { buffer.set(chunk, offset); offset += chunk.byteLength; }
    input = parseMessage(JSON.parse(new TextDecoder().decode(buffer)));
  } catch (error) { return fail(error instanceof SyntaxError ? "JSON không hợp lệ." : error instanceof Error ? error.message : "Dữ liệu không hợp lệ.", 400); }
  try {
    const { data, error } = await createSupabaseServerClient().from("messages").insert(input).select(columns).single();
    if (error) return fail(error.code === "23514" ? "Lời nhắn không đáp ứng quy tắc dữ liệu." : "Chưa lưu được lời nhắn. Vui lòng thử lại.", error.code === "23514" ? 400 : 503);
    return Response.json({ item: data }, { status: 201, headers });
  } catch { return fail("Không gian lời nhắn tạm thời chưa sẵn sàng.", 503); }
}
