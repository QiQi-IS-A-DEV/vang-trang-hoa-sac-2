import { createSupabaseBrowserClient } from './supabase/client';

async function requestUpload(payload:unknown){
  const options={method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)};
  let response=await fetch('/api/admin/upload',options);
  if(response.status===401){const refresh=await fetch('/api/admin/auth',{method:'PATCH'});if(refresh.ok)response=await fetch('/api/admin/upload',options);}
  const data=await response.json();
  if(!response.ok)throw new Error(data.error||'Không thể upload ảnh.');
  return data;
}
// Large image bytes go straight to Storage, never through a Vercel Function.
export async function adminFetch(url:string,init?:RequestInit):Promise<Response>{
  if(!url.startsWith('/api/admin/upload')||!(init?.body instanceof FormData))return fetch(url,init);
  const file=init.body.get('file');if(!(file instanceof File)||!file.size)throw new Error('Chọn một ảnh hợp lệ.');
  const purpose=url.includes('purpose=post')?'post':'original';
  if(file.size>(purpose==='post'?50:10)*1024*1024)throw new Error(purpose==='post'?'Ảnh tối đa 50 MB trên cấu hình Supabase dùng thử.':'Ảnh gốc tối đa 10 MB.');
  const upload=await requestUpload({action:'initialize',filename:file.name.slice(0,200),mime:file.type,size:file.size,purpose,alt:String(init.body.get('alt')??'').slice(0,1000)});
  const {error}=await createSupabaseBrowserClient().storage.from(upload.bucket).uploadToSignedUrl(upload.path,upload.token,file,{contentType:file.type});
  if(error)throw new Error('Không thể gửi ảnh lên Storage. Kiểm tra kết nối và giới hạn dung lượng Supabase.');
  const result=await requestUpload({action:'complete',ticket:upload.ticket});
  return Response.json(result,{status:201});
}
