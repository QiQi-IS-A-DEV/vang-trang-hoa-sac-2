import 'server-only';
import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto';
import { z } from 'zod';
import { ApiError } from './http';
import { storageAdmin } from './storage';
import { saveUploadedImage, saveUploadedAudio } from './upload';

export const temporaryUploadBucket='cms-uploads';
const initializeSchema=z.object({action:z.literal('initialize'),filename:z.string().min(1).max(200),mime:z.enum(['image/jpeg','image/png','image/webp','audio/mpeg']),size:z.number().int().positive().max(50*1024*1024),purpose:z.enum(['post','original','audio']).default('original'),alt:z.string().max(1000).default('')}).strict();
const claimSchema=initializeSchema.omit({action:true}).extend({path:z.string(),user:z.uuid(),expires:z.number()});
function signature(payload:string){const secret=process.env.SUPABASE_SECRET_KEY;if(!secret)throw new ApiError(503,'Chưa cấu hình dịch vụ lưu ảnh.');return createHmac('sha256',secret).update('vths-upload:'+payload).digest('base64url');}
export async function initializeUpload(input:unknown,user:string){
  const parsed=initializeSchema.parse(input);
  if((parsed.purpose==='audio')!==(parsed.mime==='audio/mpeg')||(parsed.purpose==='audio'&&!/\.mp3$/i.test(parsed.filename)))throw new ApiError(415,'Nhạc nền cần tệp MP3; các trường ảnh chỉ nhận ảnh.');
  const metadata={filename:parsed.filename,mime:parsed.mime,size:parsed.size,purpose:parsed.purpose,alt:parsed.alt};
  if(metadata.purpose==='original'&&metadata.size>10*1024*1024)throw new ApiError(413,'Ảnh gốc tối đa 10 MB.');
  const claim={...metadata,user,path:`${user}/${randomUUID()}`,expires:Date.now()+15*60*1000};
  const payload=Buffer.from(JSON.stringify(claim)).toString('base64url');
  const {data,error}=await storageAdmin().storage.from(temporaryUploadBucket).createSignedUploadUrl(claim.path);
  if(error||!data)throw new ApiError(503,'Không thể chuẩn bị upload. Kiểm tra migration bucket cms-uploads.');
  return {bucket:temporaryUploadBucket,path:claim.path,token:data.token,ticket:`${payload}.${signature(payload)}`};
}
export async function completeUpload(input:unknown,user:string){
  const {ticket}=z.object({action:z.literal('complete'),ticket:z.string().max(8000)}).strict().parse(input);
  const [payload,provided,...extra]=ticket.split('.');
  if(!payload||!provided||extra.length)throw new ApiError(400,'Phiếu upload không hợp lệ.');
  const expected=Buffer.from(signature(payload)),actual=Buffer.from(provided);
  if(expected.length!==actual.length||!timingSafeEqual(expected,actual))throw new ApiError(403,'Phiếu upload không hợp lệ.');
  let claim:z.infer<typeof claimSchema>;
  try{claim=claimSchema.parse(JSON.parse(Buffer.from(payload,'base64url').toString()));}catch{throw new ApiError(400,'Phiếu upload không hợp lệ.');}
  if(claim.user!==user||claim.expires<Date.now()||!claim.path.startsWith(user+'/'))throw new ApiError(403,'Phiếu upload đã hết hạn hoặc thuộc tài khoản khác.');
  const client=storageAdmin();
  const {data,error}=await client.storage.from(temporaryUploadBucket).download(claim.path);
  if(error||!data)throw new ApiError(400,'Chưa nhận được ảnh hoặc ảnh đã được xử lý. Hãy upload lại.');
  try{
    if(data.size!==claim.size)throw new ApiError(400,'Dung lượng ảnh không khớp phiếu upload.');
    const file=new File([data],claim.filename,{type:claim.mime});
    return claim.purpose==='audio'?await saveUploadedAudio(file):await saveUploadedImage(file,claim.alt,claim.purpose==='post');
  }finally{await client.storage.from(temporaryUploadBucket).remove([claim.path]);}
}
