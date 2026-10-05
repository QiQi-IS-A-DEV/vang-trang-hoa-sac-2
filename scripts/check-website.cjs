/* eslint-disable @typescript-eslint/no-require-imports */
const assert=require('node:assert/strict');
const {createClient}=require('@supabase/supabase-js');
require('@next/env').loadEnvConfig(process.cwd());
const origin=process.env.TEST_BASE_URL||'http://localhost:3000';
const db=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.SUPABASE_SECRET_KEY,{auth:{persistSession:false,autoRefreshToken:false}});
let cookie='',userId;
async function request(path,method='GET',payload,auth=true,source=origin){const r=await fetch(origin+path,{method,headers:{Origin:source,...(auth?{Cookie:cookie}:{}),...(payload?{'Content-Type':'application/json'}:{})},body:payload?JSON.stringify(payload):undefined});return {status:r.status,data:await r.json(),response:r};}
(async()=>{try{
 assert.equal((await request('/api/admin/website','GET',undefined,false)).status,401);
 const password=crypto.randomUUID()+'Aa1!',email='website-check-'+crypto.randomUUID()+'@example.com';
 const u=await db.auth.admin.createUser({email,password,email_confirm:true});assert.ifError(u.error);userId=u.data.user.id;
 assert.ifError((await db.from('admin_users').insert({user_id:userId})).error);
 const login=await request('/api/admin/auth','POST',{email,password},false);assert.equal(login.status,200);cookie=login.response.headers.getSetCookie().map(c=>c.split(';')[0]).join('; ');
 const initial=await request('/api/admin/website');assert.equal(initial.status,200);assert.equal(initial.data.sections.length,7);
 assert.equal((await request('/api/admin/website','PUT',{settings:{heroTitle:'test'}},true,'https://foreign.example')).status,403);
 assert.equal((await request('/api/admin/website','PUT',{sections:[{id:initial.data.sections[0].id,key:'footer'}]})).status,400);
 assert.equal((await request('/api/admin/website','PUT',{})).status,400);
 const failed=await request('/api/admin/website','PUT',{settings:{heroTitle:'rollback-'+crypto.randomUUID()},sections:[{id:crypto.randomUUID(),title:'Missing section'}]});assert.equal(failed.status,404);
 const after=await request('/api/admin/website');assert.equal(after.data.settings.heroTitle,initial.data.settings.heroTitle);
 assert.deepEqual(after.data.sections,initial.data.sections);
 const memoriesSettings={memoriesIntroVisible:false,memoriesGuideVisible:true,memoriesFooterVisible:false,memoriesGuideTitle:'Hướng dẫn',memoriesGuideDescription:'Dòng một\n\nDòng hai',memoriesFooterText:'Lời kết'};
 const memoriesFailed=await request('/api/admin/website','PUT',{settings:memoriesSettings,sections:[{id:crypto.randomUUID(),title:'Missing section'}]});
 assert.equal(memoriesFailed.status,404,JSON.stringify(memoriesFailed.data));
 assert.deepEqual((await request('/api/admin/website')).data.settings,initial.data.settings);
 assert.equal((await request('/api/admin/website','PUT',{settings:{memoriesIntroVisible:'false'}})).status,400);
 // The simplified editor sends only label/value. Removing, adding and clearing
 // stats must pass validation without the legacy icon/subtext fields.
 const recap=initial.data.sections.find(s=>s.key==='recap');
 const minimalStats=[{label:'Phần quà Trung Thu',value:'65'},{label:'Tình nguyện viên',value:'57'}];
 for(const stats of [minimalStats.slice(1),minimalStats,[]]){
   const result=await request('/api/admin/website','PUT',{sections:[{id:recap.id,content:{stats}},{id:crypto.randomUUID(),title:'Missing section'}]});
   assert.equal(result.status,404,'Stats should pass validation and reach the transaction: '+JSON.stringify(result.data));
   assert.deepEqual((await request('/api/admin/website')).data.sections,initial.data.sections,'Failed transaction must preserve all authored content');
 }
 assert.equal((await request('/api/admin/website','PUT',{sections:[{id:recap.id,content:{stats:[{label:'',value:'65'}]}}]})).status,400);
 assert.equal((await request('/api/admin/website','PUT',{sections:[{id:recap.id,content:{stats:[{label:'Quà',value:'1',icon:42}]}}]})).status,400);
 // Idempotent save verifies the complete transaction without altering authored content.
 const same=await request('/api/admin/website','PUT',{settings:{heroTitle:initial.data.settings.heroTitle},sections:initial.data.sections.map(s=>({id:s.id,enabled:s.enabled,sort_order:s.sort_order}))});assert.equal(same.status,200,JSON.stringify(same.data));
 const publicSections=await request('/api/landing-sections','GET',undefined,false);assert.ok(publicSections.data.items.every(s=>s.enabled));
 for(const route of ['','/hero','/team','/volunteers','/recap','/footer','/brand','/memories'])assert.equal((await fetch(origin+'/admin/website'+route)).status,200);
 assert.equal((await fetch(origin+'/admin/website/invalid')).status,404);
 for(const section of ['landing-sections','settings']){
   const r=await fetch(origin+'/admin?section='+section,{redirect:'manual'});
   // The shared client session layout can start streaming before page params
   // resolve; Next then sends the same redirect in its RSC response.
   if(r.status===307)assert.equal(r.headers.get('location'),'/admin/website');
   else {assert.equal(r.status,200);assert.ok((await r.text()).includes('NEXT_REDIRECT;replace;/admin/website;307;'),'Legacy route must redirect to the website editor');}
 }
 console.log('PASS: authenticated editor, CSRF, strict validation, atomic rollback, save, public visibility, eight routes and legacy redirects.');
 }finally{if(userId)assert.ifError((await db.auth.admin.deleteUser(userId)).error);console.log('Temporary test account removed.');}})().catch(e=>{console.error(e.message);process.exitCode=1;});
