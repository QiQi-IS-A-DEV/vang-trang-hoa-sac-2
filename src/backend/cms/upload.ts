import 'server-only';
import { randomUUID } from 'node:crypto';
import { ApiError, dbError } from './http';
import { storageAdmin } from './storage';
import { compressPostImage } from './post-image';

export async function saveUploadedAudio(file:File){
    const bytes=Buffer.from(await file.arrayBuffer());
    let offset=0;
    // Editors can prepend multiple ID3 tags; skip every complete tag before audio.
    while(bytes.toString('ascii',offset,offset+3)==='ID3'){
      if(offset+10>bytes.length||![2,3,4].includes(bytes[offset+3])||bytes.subarray(offset+6,offset+10).some(value=>value>127))throw new ApiError(415,'Metadata của tệp MP3 không đọc được.');
      const size=(bytes[offset+6]<<21)|(bytes[offset+7]<<14)|(bytes[offset+8]<<7)|bytes[offset+9];
      const footer=bytes[offset+3]===4&&(bytes[offset+5]&16)?10:0;
      offset+=10+size+footer;
      if(offset>bytes.length)throw new ApiError(415,'Metadata của tệp MP3 chưa đầy đủ.');
    }
    // Verify actual MPEG Layer III frames, including the next frame boundary.
    function frameLength(at:number){
      if(at+4>bytes.length||bytes[at]!==255||(bytes[at+1]&224)!==224||(bytes[at+1]&6)!==2)return 0;
      const version=(bytes[at+1]>>3)&3,index=bytes[at+2]>>4,rate=(bytes[at+2]>>2)&3;
      if(version===1||index===0||index===15||rate===3)return 0;
      const bitrate=(version===3?[0,32,40,48,56,64,80,96,112,128,160,192,224,256,320]:[0,8,16,24,32,40,48,56,64,80,96,112,128,144,160])[index]*1000;
      const sampleRate=[44100,48000,32000][rate]/(version===3?1:version===2?2:4);
      return Math.floor((version===3?144:72)*bitrate/sampleRate)+((bytes[at+2]>>1)&1);
    }
    const length=frameLength(offset),next=frameLength(offset+length);
    if(file.type!=='audio/mpeg'||!length||!next||offset+length+next>bytes.length)throw new ApiError(415,'Chọn một tệp MP3 hợp lệ; đổi đuôi tệp không chuyển đổi được định dạng.');
    if(bytes.length>50*1024*1024)throw new ApiError(413,'Nhạc nền tối đa 50 MB.');
    const client=storageAdmin(),path=`music/${randomUUID()}.mp3`;
    const {error:uploadError}=await client.storage.from('gallery').upload(path,bytes,{contentType:'audio/mpeg',upsert:false});
    if(uploadError)throw new ApiError(503,'Không thể lưu nhạc nền. Hãy thử lại.');
    const url=client.storage.from('gallery').getPublicUrl(path).data.publicUrl;
    return {success:true,url,asset:{id:randomUUID(),storage_path:path,url,filename:file.name.slice(0,200),mime_type:'audio/mpeg',size_bytes:bytes.length}};
}

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
