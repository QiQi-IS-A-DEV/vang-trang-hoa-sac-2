import 'server-only';
import { cmsClient } from '@/backend/cms/auth';
import { dbError, failure, json, pagination } from '@/backend/cms/http';
import { uuid } from '@/shared/validation/cms';

export async function GET(request: Request) {
  try {
    const {query,limit,offset} = pagination(request);
    let search = cmsClient().from('posts').select('id,title,slug,excerpt,category_id,sort_order,published_at,cover:assets!posts_cover_asset_id_fkey(url,alt,thumbnail_url)').eq('status','published').order('sort_order').order('created_at').order('id');
    if(query.has('category')) search = search.eq('category_id',uuid.parse(query.get('category')));
    const {data,error} = await search.range(offset,offset+limit); dbError(error);
    return json({items:data!.slice(0,limit),next_offset:data!.length>limit?offset+limit:null});
  } catch(e) { return failure(e); }
}
