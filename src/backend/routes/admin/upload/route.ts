import 'server-only';
import { requireAdmin } from '@/backend/cms/auth';
import { ApiError, body, failure, json } from '@/backend/cms/http';
import { saveUploadedImage } from '@/backend/cms/upload';
import { initializeUpload, completeUpload } from '@/backend/cms/direct-upload';
export const runtime='nodejs';
export const maxDuration=60;
export async function POST(request: Request) {
  try {
    const {user}=await requireAdmin(request);
    if(request.headers.get('content-type')?.includes('application/json')){
      const input=await body(request,16000);
      const complete=typeof input==='object'&&input!==null&&'action' in input&&input.action==='complete';
      return json(complete?await completeUpload(input,user.id):await initializeUpload(input,user.id),complete?201:200);
    }
    const article=new URL(request.url).searchParams.get('purpose')==='post';
    const limit=(article?100:10)*1024*1024;
    const limitMessage=article?'Ảnh vượt dung lượng xử lý 100 MB.':'Ảnh tối đa 10 MB.';
    if(Number(request.headers.get('content-length'))>limit+1024*1024) throw new ApiError(413,limitMessage);
    const reader=request.body?.getReader(); if(!reader) throw new ApiError(400,'Thiếu tệp.');
    let size=0; const chunks:Uint8Array[]=[];
    for(;;) { const {done,value}=await reader.read(); if(done)break; size+=value.length;
      if(size>limit+1024*1024){await reader.cancel();throw new ApiError(413,limitMessage);} chunks.push(value); }
    let form:FormData;
    try { form=await new Response(Buffer.concat(chunks),{headers:{'content-type':request.headers.get('content-type')??''}}).formData(); }
    catch { throw new ApiError(400,'Dữ liệu upload không hợp lệ.'); }
    const file = form.get('file');
    if(!(file instanceof File) || file.size<1) throw new ApiError(400,'Thiếu ảnh.');
    if(file.size>limit) throw new ApiError(413,limitMessage);
    return json(await saveUploadedImage(file,String(form.get('alt')??'').trim().slice(0,1000),article),201);
  } catch(e) { return failure(e); }
}
