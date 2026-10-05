import { requireAdmin } from '@/lib/cms/auth';
import { ApiError, body, dbError, failure, json, pagination } from '@/lib/cms/http';
import { postSchema, slugify, uuid } from '@/lib/cms/schema';

export async function GET(request: Request) {
  try {
    const { client } = await requireAdmin(request), { query, limit, offset } = pagination(request);
    let search = client.from('posts').select('*,cover:assets!posts_cover_asset_id_fkey(id,url,filename,thumbnail_url),post_images(*,asset:assets(id,url,filename,thumbnail_url)),post_content_assets(asset:assets(id,url,filename,thumbnail_url))').order('sort_order').order('created_at').order('id');
    if(query.has('id')) search = search.eq('id',uuid.parse(query.get('id')));
    const {data,error} = await search.range(offset,offset+limit); dbError(error);
    return json({items:data!.slice(0,limit), next_offset:data!.length>limit?offset+limit:null});
  } catch(e) { return failure(e); }
}
async function save(request: Request, update: boolean) {
  try {
    const { client } = await requireAdmin(request), input = postSchema.parse(await body(request));
    const id = update ? uuid.parse(new URL(request.url).searchParams.get('id')) : undefined;
    if(!id && !input.slug) input.slug = `${slugify(input.title)}-${crypto.randomUUID().slice(0,8)}`;
    const {data,error} = await client.rpc('save_post',{post_id:id ?? null!,payload:input});
    if(error?.code === 'P0002') throw new ApiError(404,'Không tìm thấy bài viết.'); dbError(error);
    return json({id:data,success:true},update?200:201);
  } catch(e) { return failure(e); }
}
export const POST = (request: Request) => save(request,false);
export const PUT = (request: Request) => save(request,true);
export async function DELETE(request: Request) {
  try {
    const {client} = await requireAdmin(request), id = uuid.parse(new URL(request.url).searchParams.get('id'));
    const {data,error} = await client.from('posts').delete().eq('id',id).select('id').maybeSingle(); dbError(error);
    if(!data) throw new ApiError(404,'Không tìm thấy bài viết.'); return json({success:true});
  } catch(e) { return failure(e); }
}
