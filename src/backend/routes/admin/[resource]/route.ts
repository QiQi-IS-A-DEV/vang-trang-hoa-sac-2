import 'server-only';
import { requireAdmin } from '@/backend/cms/auth';
import { ApiError, body, dbError, failure, json, pagination } from '@/backend/cms/http';
import { schemas, uuid } from '@/shared/validation/cms';

type Resource = keyof typeof schemas;
type Context = { params: Promise<{ resource: string }> };
function resource(value: string): Resource {
  if (!Object.hasOwn(schemas,value)) throw new ApiError(404,'Không tìm thấy dữ liệu.');
  return value as Resource;
}
function table(key: Resource) { return key === 'landing-sections' ? 'landing_sections' : key; }
export async function GET(request: Request, context: Context) {
  try {
    const { client } = await requireAdmin(request), key = resource((await context.params).resource);
    const { limit, offset } = pagination(request);
    const { data, error } = await client.from(table(key)).select('*').order('sort_order').order('id').range(offset,offset+limit);
    dbError(error); return json({ items: data!.slice(0,limit), next_offset: data!.length > limit ? offset+limit : null });
  } catch(e) { return failure(e); }
}
export async function POST(request: Request, context: Context) {
  try {
    const { client } = await requireAdmin(request), key = resource((await context.params).resource);
    const raw = await body(request);
    const result = key === 'categories' ? await client.from('categories').insert(schemas.categories.parse(raw)).select().single()
      : key === 'people' ? await client.from('people').insert(schemas.people.parse(raw)).select().single()
      : key === 'departments' ? await client.from('departments').insert(schemas.departments.parse(raw)).select().single()
      : key === 'assignments' ? await client.from('assignments').insert(schemas.assignments.parse(raw)).select().single()
      : await client.from('landing_sections').insert(schemas['landing-sections'].parse(raw)).select().single();
    const {data,error} = result;
    dbError(error); return json({ item: data },201);
  } catch(e) { return failure(e); }
}
export async function PATCH(request: Request, context: Context) {
  try {
    const { client } = await requireAdmin(request), key = resource((await context.params).resource);
    const id = uuid.parse(new URL(request.url).searchParams.get('id'));
    const input = schemas[key].partial().parse(await body(request));
    if (!Object.keys(input).length) throw new ApiError(400,'Thiếu dữ liệu cập nhật.');
    const { data, error } = await client.from(table(key)).update(input).eq('id',id).select().maybeSingle();
    dbError(error); if (!data) throw new ApiError(404,'Không tìm thấy dữ liệu.'); return json({item:data});
  } catch(e) { return failure(e); }
}
export async function DELETE(request: Request, context: Context) {
  try {
    const { client } = await requireAdmin(request), key = resource((await context.params).resource);
    const id = uuid.parse(new URL(request.url).searchParams.get('id'));
    if(key==='departments'||key==='categories'){
      const moveTo=new URL(request.url).searchParams.get('move_to');
      const replacement=moveTo?uuid.parse(moveTo):null;
      if(replacement===id)throw new ApiError(400,'Chọn một nơi chuyển đến khác với mục đang xóa.');
      const {error}=await client.rpc('delete_cms_group',{resource_name:key,target_id:id,replacement_id:replacement});
      if(error?.code==='P0002')throw new ApiError(404,'Mục này đã được xóa hoặc không tồn tại.');
      if(error?.code==='23503')throw new ApiError(409,key==='departments'?'Ban đang có thẻ hoặc phân công nhân sự. Chọn ban khác để chuyển dữ liệu trước khi xóa.':'Danh mục đang có bài viết. Chọn danh mục khác để chuyển bài viết trước khi xóa.');
      if(error?.code==='22023')throw new ApiError(400,'Nơi chuyển đến không hợp lệ.');
      dbError(error);return json({success:true});
    }
    const { data, error } = await client.from(table(key)).delete().eq('id',id).select('id').maybeSingle();
    dbError(error); if (!data) throw new ApiError(404,'Không tìm thấy dữ liệu.'); return json({success:true});
  } catch(e) { return failure(e); }
}
