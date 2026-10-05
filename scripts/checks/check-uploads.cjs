/* eslint-disable @typescript-eslint/no-require-imports */
const assert=require('node:assert/strict');
const {randomUUID,randomBytes}=require('node:crypto');
const sharp=require('sharp');
const {createClient}=require('@supabase/supabase-js');
require('@next/env').loadEnvConfig(process.cwd());
const origin=process.env.TEST_BASE_URL||'http://localhost:3001';
const options={auth:{persistSession:false,autoRefreshToken:false}};
const admin=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.SUPABASE_SECRET_KEY,options);
const browser=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,options);
const assets=[],temporary=[],audioPaths=[];
let previousTrack,trackTouched=false;
let user,cookie='';
async function request(payload,authenticated=true,requestOrigin=origin){
 const response=await fetch(origin+'/api/admin/upload',{method:'POST',headers:{'Content-Type':'application/json',Origin:requestOrigin,...(authenticated?{Cookie:cookie}:{})},body:JSON.stringify(payload),signal:AbortSignal.timeout(90000)});
 return {status:response.status,data:await response.json()};
}
async function upload(bytes,purpose){
 const initialized=await request({action:'initialize',filename:'isolated-upload-check.png',mime:'image/png',size:bytes.length,purpose});
 assert.equal(initialized.status,200,JSON.stringify(initialized.data));
 const ticket=initialized.data;temporary.push(ticket.path);
 const sent=await browser.storage.from(ticket.bucket).uploadToSignedUrl(ticket.path,ticket.token,bytes,{contentType:'image/png'});assert.ifError(sent.error);
 assert.ok((await browser.storage.from(ticket.bucket).download(ticket.path)).error,'Staging images must remain private');
 const completed=await request({action:'complete',ticket:ticket.ticket});assert.equal(completed.status,201,JSON.stringify(completed.data));
 assets.push(completed.data.asset);return completed.data.asset;
}
async function main(){
 assert.equal((await request({action:'initialize'},false)).status,401);
 const password=randomUUID()+'aA1!';
 const created=await admin.auth.admin.createUser({email:'upload-check-'+randomUUID()+'@example.com',password,email_confirm:true});assert.ifError(created.error);user=created.data.user;
 assert.ifError((await admin.from('admin_users').insert({user_id:user.id})).error);
 const login=await fetch(origin+'/api/admin/auth',{method:'POST',headers:{'Content-Type':'application/json',Origin:origin},body:JSON.stringify({email:user.email,password})});assert.equal(login.status,200);
 cookie=login.headers.getSetCookie().map(value=>value.split(';')[0]).join('; ');
 const metadata={action:'initialize',filename:'test.png',mime:'image/png',size:1,purpose:'original'};
 assert.equal((await request(metadata,true,'https://foreign.example')).status,403);
 assert.equal((await request({...metadata,size:10*1024*1024+1})).status,413);
 assert.equal((await request({...metadata,purpose:'post',size:50*1024*1024+1})).status,400);
 const initialized=await request(metadata);assert.equal(initialized.status,200);temporary.push(initialized.data.path);
 assert.equal((await request({action:'complete',ticket:initialized.data.ticket+'x'})).status,403);
 assert.equal((await request({action:'complete',ticket:initialized.data.ticket})).status,400);
 console.log('PASS: authentication, origin checks, upload limits, signed tickets and missing uploads.');
 assert.equal((await request({...metadata,filename:'track.mp3',mime:'audio/mpeg',purpose:'original'})).status,415);
 assert.equal((await request({...metadata,purpose:'audio'})).status,415);
 const mp3=Buffer.alloc(417*12);for(let i=0;i<12;i++)mp3.set([255,251,144,100],i*417);
 const music=await request({action:'initialize',filename:'isolated-silent-check.mp3',mime:'audio/mpeg',purpose:'audio',size:mp3.length});assert.equal(music.status,200,JSON.stringify(music.data));temporary.push(music.data.path);
 assert.ifError((await browser.storage.from(music.data.bucket).uploadToSignedUrl(music.data.path,music.data.token,mp3,{contentType:'audio/mpeg'})).error);
 const musicCompleted=await request({action:'complete',ticket:music.data.ticket});assert.equal(musicCompleted.status,201,JSON.stringify(musicCompleted.data));
 const audio=musicCompleted.data.asset;audioPaths.push(audio.storage_path);
 assert.deepEqual(Buffer.from(await (await admin.storage.from('gallery').download(audio.storage_path)).data.arrayBuffer()),mp3);
 const before=await admin.from('site_settings').select('content').eq('id','main').single();assert.ifError(before.error);previousTrack=before.data.content.musicTrack??null;
 const track={storage_path:audio.storage_path,url:audio.url,filename:audio.filename};
 async function saveTrack(value){return fetch(origin+'/api/admin/website',{method:'PUT',headers:{'Content-Type':'application/json',Origin:origin,Cookie:cookie},body:JSON.stringify({settings:{musicTrack:value}})});}
 assert.equal((await saveTrack({...track,url:'https://foreign.example/song.mp3'})).status,400);
 const saved=await saveTrack(track);assert.equal(saved.status,200,await saved.text());trackTouched=true;
 assert.equal((await (await fetch(origin+'/api/settings')).json()).settings.musicUrl,audio.url);
 const invalid=await request({action:'initialize',filename:'fake.mp3',mime:'audio/mpeg',purpose:'audio',size:8});assert.equal(invalid.status,200);temporary.push(invalid.data.path);
 assert.ifError((await browser.storage.from(invalid.data.bucket).uploadToSignedUrl(invalid.data.path,invalid.data.token,Buffer.alloc(8),{contentType:'audio/mpeg'})).error);
 assert.equal((await request({action:'complete',ticket:invalid.data.ticket})).status,415);
 console.log('PASS: MP3 bytes preserved, single track saved and publicly resolved; foreign URLs, wrong MIME and fake MP3 rejected.');

 const bytes=await sharp(randomBytes(1600*1100*3),{raw:{width:1600,height:1100,channels:3}}).png().toBuffer();
 assert.ok(bytes.length>4.5*1024*1024,'Fixture must exceed Vercel request limit');
 const original=await upload(bytes,'original');
 const originalFile=await admin.storage.from('gallery').download(original.storage_path);assert.ifError(originalFile.error);
 assert.deepEqual(Buffer.from(await originalFile.data.arrayBuffer()),bytes,'Volunteer originals must remain byte-identical');
 const article=await upload(bytes,'post');assert.equal(article.mime_type,'image/webp');assert.ok(article.thumbnail_storage_path);
 const full=await admin.storage.from('gallery').download(article.storage_path);assert.ifError(full.error);
 const dimensions=await sharp(Buffer.from(await full.data.arrayBuffer())).metadata();assert.equal(dimensions.width,1600);assert.equal(dimensions.height,1100);
 for(const path of temporary)assert.ok((await admin.storage.from('cms-uploads').download(path)).error,'Processed staging files must be removed');
 console.log('PASS: images above 4.5 MB upload directly; originals stay intact; posts retain dimensions and generate previews.');
}
main().catch(error=>{console.error(error.message);process.exitCode=1;}).finally(async()=>{
 if(trackTouched){const restored=await fetch(origin+'/api/admin/website',{method:'PUT',headers:{'Content-Type':'application/json',Origin:origin,Cookie:cookie},body:JSON.stringify({settings:{musicTrack:previousTrack}})});if(!restored.ok){console.error('Music setting restore failed; test audio retained.');process.exitCode=1;audioPaths.length=0;}}
 if(audioPaths.length)await admin.storage.from('gallery').remove(audioPaths);
 for(const asset of assets){await admin.from('assets').delete().eq('id',asset.id);await admin.storage.from('gallery').remove([asset.storage_path,...(asset.thumbnail_storage_path?[asset.thumbnail_storage_path]:[])]);}
 if(temporary.length)await admin.storage.from('cms-uploads').remove(temporary);
 if(user){await admin.from('admin_users').delete().eq('user_id',user.id);await admin.auth.admin.deleteUser(user.id);}
});
