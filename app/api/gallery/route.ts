// Compatibility read endpoint. New content is managed through posts and albums.
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { ApiError,dbError,failure,json,pagination } from '@/lib/cms/http';
export async function GET(request: Request) {
  try {
    const {query,limit,offset}=pagination(request);
    let search=createSupabaseServerClient().from('gallery_images').select('*').order('sort_order').order('created_at').order('id');
    if(query.has('category')){const category=query.get('category')!.trim();if(!category||category.length>80)throw new ApiError(400,'Danh mục không hợp lệ.');search=search.eq('category',category);}
    const {data,error}=await search.range(offset,offset+limit);dbError(error);
    return json({items:data!.slice(0,limit),next_offset:data!.length>limit?offset+limit:null});
  }catch(e){return failure(e);}
}
