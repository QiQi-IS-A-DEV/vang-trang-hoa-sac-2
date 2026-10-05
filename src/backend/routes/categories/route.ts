import 'server-only';
import { cmsClient } from '@/backend/cms/auth';
import { dbError, failure, json } from '@/backend/cms/http';
export async function GET() {
  try { const {data,error}=await cmsClient().from('categories').select('*').order('sort_order').order('id'); dbError(error); return json({items:data}); }
  catch(e) { return failure(e); }
}
