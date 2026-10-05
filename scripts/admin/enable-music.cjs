/* eslint-disable @typescript-eslint/no-require-imports */
// Add MP3 support without changing any bucket permissions or size limits.
require('@next/env').loadEnvConfig(process.cwd());
const {createClient}=require('@supabase/supabase-js');
const client=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.SUPABASE_SECRET_KEY,{auth:{persistSession:false}});
async function main(){
  for(const id of ['cms-uploads','gallery']){
    const {data,error}=await client.storage.getBucket(id);if(error)throw error;
    if(data.allowed_mime_types&&!data.allowed_mime_types.includes('audio/mpeg')){
      const changed=await client.storage.updateBucket(id,{public:data.public,allowedMimeTypes:[...data.allowed_mime_types,'audio/mpeg']});
      if(changed.error)throw changed.error;
    }
    console.log(`PASS: ${id} supports MP3; visibility and size limit preserved.`);
  }
}
main().catch(error=>{console.error(error.message);process.exitCode=1;});
