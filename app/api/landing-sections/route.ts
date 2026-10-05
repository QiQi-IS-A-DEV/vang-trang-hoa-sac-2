import { cmsClient } from '@/lib/cms/auth';
import { dbError,failure,json } from '@/lib/cms/http';
export async function GET() {
  try {const {data,error}=await cmsClient().from('landing_sections').select('*,asset:assets(url)').order('sort_order').order('id');dbError(error);return json({items:data});}
  catch(e){return failure(e);}
}
