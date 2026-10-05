import { requireAdmin } from '@/lib/cms/auth';
import { dbError,failure,json } from '@/lib/cms/http';
import { storageAdmin } from '@/lib/cms/storage';
export async function POST(request: Request) {
  try {
    await requireAdmin(request);const admin=storageAdmin();
    const {data,error}=await admin.from('storage_cleanup').select('storage_path').order('created_at').limit(100);dbError(error);
    let removed=0;
    for(const row of data!) {
      const result=await admin.storage.from('gallery').remove([row.storage_path]);
      if(!result.error){const cleanup=await admin.from('storage_cleanup').delete().eq('storage_path',row.storage_path);if(!cleanup.error)removed++;}
    }
    return json({removed,remaining_in_batch:data!.length-removed});
  }catch(e){return failure(e);}
}
