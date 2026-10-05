import { randomUUID } from 'node:crypto';
import { requireAdmin } from '@/lib/cms/auth';
import { ApiError, dbError, failure, json } from '@/lib/cms/http';
import { storageAdmin } from '@/lib/cms/storage';
import { compressPostImage } from '@/lib/cms/post-image';
export async function POST(request: Request) {
  try {
    await requireAdmin(request);
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
    const extensions:Record<string,string>={'image/jpeg':'jpg','image/png':'png','image/webp':'webp'};
    if(!extensions[file.type]) throw new ApiError(415,'Chỉ hỗ trợ JPEG, PNG và WebP.');
    const bytes=Buffer.from(await file.arrayBuffer());
    const valid = file.type==='image/jpeg' ? bytes[0]===255&&bytes[1]===216&&bytes[2]===255 : file.type==='image/png' ? bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])) : bytes.toString('ascii',0,4)==='RIFF'&&bytes.toString('ascii',8,12)==='WEBP';
    if(!valid) throw new ApiError(415,'Nội dung tệp không khớp định dạng ảnh.');
    let full=bytes,thumbnail:Buffer|undefined;
    if(article){try{const optimized=await compressPostImage(bytes);full=optimized.full;thumbnail=optimized.thumbnail;}catch{throw new ApiError(415,'Ảnh không đọc được hoặc quá lớn để xử lý. Hãy chọn một ảnh JPEG, PNG hoặc WebP hợp lệ.');}}
    const client=storageAdmin(),stem=`cms/${randomUUID()}`,path=`${stem}.${article?'webp':extensions[file.type]}`;
    const thumbnailPath=thumbnail?`${stem}.thumb.webp`:null;
    const {error:uploadError}=await client.storage.from('gallery').upload(path,full,{contentType:article?'image/webp':file.type,upsert:false});
    if(uploadError) throw new ApiError(503,'Không thể tải ảnh lên.');
    const url=client.storage.from('gallery').getPublicUrl(path).data.publicUrl;
    let thumbnailUrl:string|null=null;
    if(thumbnail&&thumbnailPath){
      const {error}=await client.storage.from('gallery').upload(thumbnailPath,thumbnail,{contentType:'image/webp',upsert:false});
      if(error){await client.storage.from('gallery').remove([path]);throw new ApiError(503,'Không thể lưu thumbnail. Hãy thử tải lại ảnh.');}
      thumbnailUrl=client.storage.from('gallery').getPublicUrl(thumbnailPath).data.publicUrl;
    }
    const alt=String(form.get('alt')??'').trim().slice(0,1000);
    const {data,error}=await client.from('assets').insert({storage_path:path,url,thumbnail_url:thumbnailUrl,thumbnail_storage_path:thumbnailPath,filename:file.name.slice(0,200),mime_type:article?'image/webp':file.type,size_bytes:full.length+(thumbnail?.length??0),alt}).select().single();
    if(error) { await client.storage.from('gallery').remove([path,...(thumbnailPath?[thumbnailPath]:[])]); dbError(error); }
    return json({success:true,url,asset:data},201);
  } catch(e) { return failure(e); }
}
