import 'server-only';
import { randomUUID } from 'node:crypto';
import { ApiError, dbError } from './http';
import { storageAdmin } from './storage';
import { compressPostImage } from './post-image';

export async function saveUploadedImage(file:File,alt:string,article:boolean){
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

    const {data,error}=await client.from('assets').insert({storage_path:path,url,thumbnail_url:thumbnailUrl,thumbnail_storage_path:thumbnailPath,filename:file.name.slice(0,200),mime_type:article?'image/webp':file.type,size_bytes:full.length+(thumbnail?.length??0),alt}).select().single();
    if(error) { await client.storage.from('gallery').remove([path,...(thumbnailPath?[thumbnailPath]:[])]); dbError(error); }

  return {success:true,url,asset:data};
}
