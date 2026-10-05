import { cmsClient } from '@/lib/cms/auth';
import { ApiError, dbError, failure, json } from '@/lib/cms/http';
export async function GET(_request: Request, context: {params:Promise<{slug:string}>}) {
  try {
    const {slug} = await context.params;
    const {data,error} = await cmsClient().from('posts').select('*,cover:assets!posts_cover_asset_id_fkey(url,alt,thumbnail_url),post_images(*,asset:assets(url,alt,thumbnail_url)),post_content_assets(asset_id,asset:assets(url,alt,thumbnail_url))').eq('slug',slug).eq('status','published').maybeSingle();
    dbError(error); if(!data) throw new ApiError(404,'Không tìm thấy bài viết.');
    data.post_images.sort((a,b)=>a.sort_order-b.sort_order || a.id.localeCompare(b.id));
    return json({item:data});
  } catch(e) { return failure(e); }
}
