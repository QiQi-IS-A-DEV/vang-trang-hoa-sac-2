import sharp from 'sharp';

// Article previews are smaller; the viewer uses the complete, unresized image.
export async function compressPostImage(bytes:Buffer) {
  const image=sharp(bytes,{limitInputPixels:100_000_000,failOn:'error'}).rotate();
  const full=await image.clone().webp({quality:92,effort:4,smartSubsample:true}).toBuffer({resolveWithObject:true});
  const thumbnail=await image.clone().resize({width:1920,height:1920,fit:'inside',withoutEnlargement:true})
    .webp({quality:85,effort:4,smartSubsample:true}).toBuffer({resolveWithObject:true});
  return {full:full.data,thumbnail:thumbnail.data,width:full.info.width,height:full.info.height};
}
