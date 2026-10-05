import { z } from 'zod';
import { requireAdmin } from '@/lib/cms/auth';
import { ApiError, body, dbError, failure, json } from '@/lib/cms/http';
import { schemas, settingSchema, uuid } from '@/lib/cms/schema';
import { defaultSiteContent } from '@/data/site-content';

const schema=z.object({settings:settingSchema.optional(),sections:z.array(schemas['landing-sections'].omit({key:true}).partial().extend({id:uuid}).strict()).max(7).optional()}).strict().refine(p=>Boolean(p.settings&&Object.keys(p.settings).length)||Boolean(p.sections?.length),'Thiếu nội dung cần lưu.');
export async function GET(request:Request){
  try{
    const {client}=await requireAdmin(request);
    const [sections,settings]=await Promise.all([
      client.from('landing_sections').select('*').order('sort_order').order('id'),
      client.from('site_settings').select('*').eq('id','main').single(),
    ]);
    dbError(sections.error);dbError(settings.error);
    return json({sections:sections.data,settings:{...defaultSiteContent,...(settings.data!.content as object),logo_asset_id:settings.data!.logo_asset_id,background_asset_id:settings.data!.background_asset_id}});
  }catch(e){return failure(e);}
}
export async function PUT(request:Request){
  try{
    const {client}=await requireAdmin(request),input=schema.parse(await body(request));
    const {error}=await client.rpc('save_website',{payload:input});
    if(error?.code==='P0002')throw new ApiError(404,'Một khu vực đã thay đổi. Hãy tải lại cấu hình trước khi lưu.');
    dbError(error);return json({success:true});
  }catch(e){return failure(e);}
}
