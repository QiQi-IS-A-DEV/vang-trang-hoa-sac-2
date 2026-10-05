import 'server-only';
import { z } from "zod";
import { requireAdmin } from "@/backend/cms/auth";
import { ApiError, body, dbError, failure, json, pagination } from "@/backend/cms/http";
import { uuid } from "@/shared/validation/cms";
const cardFields = {department_id:uuid,role:z.enum(['lead','deputy','volunteer']),sort_order:z.number().int().min(0).max(100000),visible:z.boolean()};

export async function GET(request: Request) {
  try {
    const { client } = await requireAdmin(request);
    const { limit, offset } = pagination(request);
    const { data, error } = await client.from("assignments")
      .select("*,person:people!inner(id,name,asset:assets!inner(id,url,filename)),department:departments(id,name,sort_order)")
      .or('role.eq.volunteer,responsibility.eq.program-card').order("sort_order").order("id").range(offset, offset + limit);
    dbError(error);
    return json({ items: data!.slice(0, limit), next_offset: data!.length > limit ? offset + limit : null });
  } catch (error) { return failure(error); }
}
export async function POST(request: Request) {
  try {
    const { client } = await requireAdmin(request);
    const input = z.object({ asset_id: uuid, ...cardFields,role:cardFields.role.default('volunteer'),sort_order:cardFields.sort_order.default(0),visible:cardFields.visible.default(true) }).strict().parse(await body(request));
    const [asset, department] = await Promise.all([
      client.from("assets").select("id,filename").eq("id", input.asset_id).maybeSingle(),
      client.from("departments").select("id").eq("id", input.department_id).maybeSingle(),
    ]);
    dbError(asset.error); dbError(department.error);
    if (!asset.data || !department.data) throw new ApiError(400, "Chọn ảnh và ban hợp lệ.");
    // The filename is an internal label; no personal details are entered or rendered.
    const person = await client.from("people").insert({ name: asset.data.filename.slice(0,160) || "Ảnh thẻ", asset_id: input.asset_id, unit: "volunteer-card-upload", visible: true }).select("id").single();
    dbError(person.error);
    const assignment = await client.from("assignments").insert({ person_id: person.data!.id, department_id: input.department_id, role: input.role, responsibility:'program-card',visible: input.visible, sort_order: input.sort_order }).select().single();
    if (assignment.error) {
      const cleanup = await client.from("people").delete().eq("id", person.data!.id);
      dbError(cleanup.error);
      dbError(assignment.error);
    }
    return json({ item: assignment.data }, 201);
  } catch (error) { return failure(error); }
}
export async function PATCH(request: Request) {
  try {
    const {client} = await requireAdmin(request);
    const id = uuid.parse(new URL(request.url).searchParams.get('id'));
    const input = z.object(cardFields).partial().strict().parse(await body(request));
    if(!Object.keys(input).length)throw new ApiError(400,'Thiếu thông tin cập nhật thẻ.');
    const {data,error} = await client.from('assignments').update({...input,responsibility:'program-card'})
      .eq('id',id).or('role.eq.volunteer,responsibility.eq.program-card').select().maybeSingle();
    dbError(error);
    if(!data)throw new ApiError(404,'Không tìm thấy thẻ tình nguyện viên.');
    return json({item:data});
  }catch(error){return failure(error);}
}
export async function DELETE(request:Request){
  try{
    const {client}=await requireAdmin(request);
    const id=uuid.parse(new URL(request.url).searchParams.get('id'));
    const {error}=await client.rpc('delete_program_card',{card_id:id});
    if(error?.code==='P0002')throw new ApiError(404,'Thẻ đã được xóa hoặc không tồn tại.');
    dbError(error);return json({success:true});
  }catch(error){return failure(error);}
}
