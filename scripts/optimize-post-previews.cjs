/* eslint-disable @typescript-eslint/no-require-imports */
const sharp=require('sharp');
const {createClient}=require('@supabase/supabase-js');
require('@next/env').loadEnvConfig(process.cwd());
const db=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.SUPABASE_SECRET_KEY,{auth:{persistSession:false}});
async function checked(result){if(result.error)throw result.error;return result.data;}
async function main(){
  const ids=new Set();
  for(let offset=0;;offset+=100){
    const posts=await checked(await db.from('posts').select('cover_asset_id,post_images(asset_id),post_content_assets(asset_id)').range(offset,offset+99));
    for(const p of posts){if(p.cover_asset_id)ids.add(p.cover_asset_id);for(const a of [...p.post_images,...p.post_content_assets])ids.add(a.asset_id);}
    if(posts.length<100)break;
  }
  if(!ids.size)return;
  const assets=await checked(await db.from('assets').select('id,url,size_bytes,storage_path').in('id',[...ids]).is('thumbnail_url',null).not('storage_path','is',null));
  let count=0;
  for(const asset of assets){
    // Read the known Storage object, rather than fetching an arbitrary URL.
    const source=await checked(await db.storage.from('gallery').download(asset.storage_path));
    const thumb=await sharp(Buffer.from(await source.arrayBuffer()),{limitInputPixels:100_000_000}).rotate()
      .resize({width:1920,height:1920,fit:'inside',withoutEnlargement:true}).webp({quality:85,effort:4,smartSubsample:true}).toBuffer();
    const path=`cms/${crypto.randomUUID()}.thumb.webp`;
    await checked(await db.storage.from('gallery').upload(path,thumb,{contentType:'image/webp',upsert:false}));
    const url=db.storage.from('gallery').getPublicUrl(path).data.publicUrl;
    const update=await db.from('assets').update({thumbnail_url:url,thumbnail_storage_path:path,size_bytes:asset.size_bytes+thumb.length}).eq('id',asset.id).is('thumbnail_url',null).select('id');
    if(update.error||!update.data?.length){await db.storage.from('gallery').remove([path]);if(update.error)throw update.error;}
    else count++;
  }
  console.log(`Created ${count} article thumbnails; existing full images preserved.`);
}
main().catch(e=>{console.error(e.message);process.exitCode=1;});
