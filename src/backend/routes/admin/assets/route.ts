import 'server-only';
import { z } from 'zod';
import { requireAdmin } from '@/backend/cms/auth';
import { ApiError, body, dbError, failure, json, pagination } from '@/backend/cms/http';
import { uuid } from '@/shared/validation/cms';
import { storageAdmin } from '@/backend/cms/storage';
export async function GET(request: Request) {
  try {
    const {client}=await requireAdmin(request),{limit,offset}=pagination(request);
    const {data,error}=await client.from('assets').select('*').order('created_at',{ascending:false}).order('id').range(offset,offset+limit); dbError(error);
    return json({items:data!.slice(0,limit),next_offset:data!.length>limit?offset+limit:null});
  } catch(e) {return failure(e);}
}
export async function PATCH(request: Request) {
  try {
    await requireAdmin(request); const id=uuid.parse(new URL(request.url).searchParams.get('id'));
    const input=z.object({alt:z.string().trim().max(1000)}).strict().parse(await body(request));
    const {data,error}=await storageAdmin().from('assets').update(input).eq('id',id).select().maybeSingle(); dbError(error);
    if(!data)throw new ApiError(404,'Không tìm thấy ảnh.'); return json({item:data});
  }catch(e){return failure(e);}
}
export async function DELETE(request: Request) {
  try {
    const {client}=await requireAdmin(request),id=uuid.parse(new URL(request.url).searchParams.get('id'));
    const checks=await Promise.all([
      client.from('posts').select('id,title').eq('cover_asset_id',id),
      client.from('post_images').select('post_id').eq('asset_id',id),
      client.from('post_content_assets').select('post_id').eq('asset_id',id),
      client.from('people').select('id,name').eq('asset_id',id),
      client.from('landing_sections').select('key').eq('asset_id',id),
      client.from('site_settings').select('id').or(`logo_asset_id.eq.${id},background_asset_id.eq.${id}`),
    ]);
    checks.forEach(c=>dbError(c.error));
    const usages=checks.flatMap((c,i)=>(c.data??[]).map(item=>({type:['cover','album','content','person','section','branding'][i],...item})));
    if(usages.length) return json({error:'Ảnh đang được sử dụng. Hãy gỡ hoặc thay ảnh trước.',usages},409);
    const admin=storageAdmin();
    const {data,error}=await admin.from('assets').delete().eq('id',id).select('storage_path,thumbnail_storage_path').maybeSingle(); dbError(error);
    if(!data)throw new ApiError(404,'Không tìm thấy ảnh.');
    const paths=[data.storage_path,data.thumbnail_storage_path].filter((path):path is string=>Boolean(path));
    if(!paths.length)return json({success:true,cleanup_pending:false});
    const {error:storageError}=await admin.storage.from('gallery').remove(paths);
    if(!storageError) await admin.from('storage_cleanup').delete().in('storage_path',paths);
    return json({success:true,cleanup_pending:Boolean(storageError)});
  }catch(e){return failure(e);}
}
