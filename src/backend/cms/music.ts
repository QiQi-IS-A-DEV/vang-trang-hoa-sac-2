import 'server-only';
import { ApiError } from './http';
import { storageAdmin } from './storage';

type Track={storage_path:string;filename:string;url:string};
// Music has one independent slot in site_settings.content, separate from image records.
export async function validateMusicAsset(input:{musicTrack?:Track|null}){
  if(!input.musicTrack)return;
  const track=input.musicTrack,storage=storageAdmin().storage.from('gallery');
  if(track.url!==storage.getPublicUrl(track.storage_path).data.publicUrl)throw new ApiError(400,'Đường dẫn nhạc nền không hợp lệ.');
  const {data,error}=await storage.info(track.storage_path);
  if(error||data?.contentType!=='audio/mpeg')throw new ApiError(400,'Nhạc nền cần một tệp MP3 đã upload.');
}
