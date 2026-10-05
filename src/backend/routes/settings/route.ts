import 'server-only';
import { defaultSiteContent } from '@/shared/data/site-content';
import { cmsClient, requireAdmin } from '@/backend/cms/auth';
import { body, dbError, failure, json } from '@/backend/cms/http';
import { settingSchema } from '@/shared/validation/cms';
export async function GET() {
  try {
    const {data,error} = await cmsClient().from('site_settings').select('*,logo:assets!site_settings_logo_asset_id_fkey(url),background:assets!site_settings_background_asset_id_fkey(url)').eq('id','main').single();
    dbError(error);
    return json({settings:{...defaultSiteContent,...(data!.content as object),logoUrl:data!.logo?.url,backgroundUrl:data!.background?.url,logo_asset_id:data!.logo_asset_id,background_asset_id:data!.background_asset_id}});
  } catch(e) { return failure(e); }
}
export async function POST(request: Request) {
  try {
    const {client} = await requireAdmin(request);
    const input = settingSchema.parse(await body(request));
    const {data,error} = await client.rpc('update_site_settings',{payload:input}); dbError(error);
    return json({success:true,settings:{...defaultSiteContent,...(data as object)}});
  } catch(e) { return failure(e); }
}
