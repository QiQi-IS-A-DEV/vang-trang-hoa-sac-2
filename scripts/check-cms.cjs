/* eslint-disable @typescript-eslint/no-require-imports */
const assert=require('node:assert/strict');
const {createClient}=require('@supabase/supabase-js');
require('@next/env').loadEnvConfig(process.cwd());
const origin=process.env.TEST_BASE_URL||'http://localhost:3001';
const options={auth:{persistSession:false,autoRefreshToken:false}};
const admin=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.SUPABASE_SECRET_KEY,options);
const publicDb=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,options);
const marker='cms-check-'+crypto.randomUUID(),password=crypto.randomUUID()+'aA1!';
const created={users:[],posts:[],assets:[],people:[],departments:[],categories:[],assignments:[]};
let originalSettings=null,originalSection=null;
let cookie='';
async function request(path,method='GET',payload,auth=true,customHeaders={}) {
 const headers={Origin:origin,...(auth?{Cookie:cookie}:{}),...customHeaders};
 const init={method,headers,signal:AbortSignal.timeout(25000)};
 if(payload instanceof FormData)init.body=payload;
 else if(payload!==undefined){headers['Content-Type']='application/json';init.body=JSON.stringify(payload);}
 const response=await fetch(origin+path,init),text=await response.text(),data=text?JSON.parse(text):{};
 return {status:response.status,data,response};
}
async function create(resource,payload) {
 const result=await request('/api/admin/'+resource,'POST',payload);assert.equal(result.status,201,JSON.stringify(result.data));
 const row=result.data.item??{id:result.data.id};created[resource].push(row.id);return row;
}
async function main(){
 assert.ok(process.env.SUPABASE_SECRET_KEY,'Server key needed for isolated test setup/cleanup.');
 for(const path of ['/api/admin/posts','/api/admin/people','/api/admin/assets','/api/admin/landing-sections'])assert.equal((await request(path,'GET',undefined,false)).status,401);
 for(const path of ['/api/settings','/api/admin/upload','/api/admin/posts','/api/admin/people'])assert.equal((await request(path,'POST',{},false)).status,401);
 assert.equal((await request('/api/team','POST',{},false)).status,405);
 assert.equal((await request('/api/admin/messages','DELETE',{},false)).status,405);
 const {data:auth,error}=await admin.auth.admin.createUser({email:marker+'@example.com',password,email_confirm:true});if(error)throw error;
 created.users.push(auth.user.id);
 const nonAdmin=await request('/api/admin/auth','POST',{email:auth.user.email,password},false);assert.equal(nonAdmin.status,403);
 const grant=await admin.from('admin_users').insert({user_id:auth.user.id});if(grant.error)throw grant.error;
 const login=await request('/api/admin/auth','POST',{email:auth.user.email,password},false);assert.equal(login.status,200,JSON.stringify(login.data));
 cookie=login.response.headers.getSetCookie().map(c=>c.split(';')[0]).join('; ');assert.ok(cookie.includes('vths_access'));
 assert.equal((await request('/api/admin/auth')).status,200);
 assert.equal((await request('/api/admin/people','POST',{name:marker},true,{Origin:'https://foreign.example'})).status,403);
 assert.equal((await request('/api/admin/people','POST',{name:marker,id:crypto.randomUUID()})).status,400);
 assert.equal((await request('/api/admin/people?limit=0')).status,400);
 assert.equal((await request('/api/admin/categories','POST',{name:'Tất cả'})).status,400);
 console.log('PASS: login, admin allowlist, API auth, CSRF and strict validation.');
 originalSettings=(await admin.from('site_settings').select('*').eq('id','main').single()).data;
 const settingsUpdate=await request('/api/settings','POST',{heroSubtitle:marker});assert.equal(settingsUpdate.status,200);
 assert.equal((await request('/api/settings','GET',undefined,false)).data.settings.heroSubtitle,marker);
 assert.equal((await request('/api/settings','POST',{allowSubmissions:false})).status,400);
 originalSection=(await admin.from('landing_sections').select('*').eq('key','footer').single()).data;
 assert.equal((await request('/api/admin/landing-sections?id='+originalSection.id,'PATCH',{title:marker,enabled:true})).status,200);
 assert.ok((await fetch(origin+'/').then(r=>r.text())).includes(marker));
 assert.equal((await request('/api/admin/landing-sections?id='+originalSection.id,'PATCH',{enabled:false})).status,200);
 assert.ok(!(await publicDb.from('landing_sections').select('id').eq('id',originalSection.id)).data.length);
 await admin.from('site_settings').update(originalSettings).eq('id','main');originalSettings=null;
 await admin.from('landing_sections').update(originalSection).eq('id',originalSection.id);originalSection=null;
 console.log('PASS: persistent landing settings, sections and public visibility.');
 const category=await create('categories',{name:marker});
 const department=await create('departments',{name:marker,code:marker.slice(-36)});
 const person=await create('people',{name:marker,visible:true});
 await create('assignments',{person_id:person.id,department_id:department.id,role:'lead',title:'Trưởng ban'});
 await create('assignments',{person_id:person.id,department_id:department.id,role:'volunteer'});
 assert.equal((await request('/api/admin/departments?id='+department.id,'DELETE')).status,409);
 assert.equal((await request('/api/admin/departments?id='+department.id,'PATCH',{name:marker+' renamed'})).status,200);
 const team=await request('/api/team','GET',undefined,false);assert.equal(team.status,200);
 assert.ok(team.data.volunteers.some(p=>p.personId===person.id&&p.department===marker+' renamed'));
 assert.ok(team.data.departments.some(d=>d.id===department.id&&d.members.some(p=>p.id===person.id)));
 assert.equal((await request('/api/admin/people?id='+person.id,'PATCH',{visible:false})).status,200);
 assert.ok(!(await request('/api/team','GET',undefined,false)).data.volunteers.some(p=>p.personId===person.id));
 console.log('PASS: shared profiles, roles, rename propagation, linked department deletion, hidden personnel.');
 const png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Wl6gXcAAAAASUVORK5CYII=','base64');
 const form=new FormData();form.set('file',new Blob([png],{type:'image/png'}),marker+'.png');
 const uploaded=await request('/api/admin/upload','POST',form);assert.equal(uploaded.status,201,JSON.stringify(uploaded.data));const asset=uploaded.data.asset;created.assets.push(asset.id);
 const bad=new FormData();bad.set('file',new Blob(['<svg>'],{type:'image/png'}),'fake.png');assert.equal((await request('/api/admin/upload','POST',bad)).status,415);
 const svg=new FormData();svg.set('file',new Blob(['<svg/>'],{type:'image/svg+xml'}),'x.svg');assert.equal((await request('/api/admin/upload','POST',svg)).status,415);
 const large=new FormData();large.set('file',new Blob([new Uint8Array(10485761)],{type:'image/png'}),'big.png');assert.equal((await request('/api/admin/upload','POST',large)).status,413);
 const base={title:marker,category_id:category.id,cover_asset_id:asset.id,content:[{type:'paragraph',text:'<script>alert(1)</script>'},{type:'image',asset_id:asset.id}],album:[{asset_id:asset.id,caption:'First photo',sort_order:0}]};
 const post=await create('posts',{...base,status:'draft'});
 const shared=await create('posts',{...base,title:marker+' shared',status:'draft'});
 const draft=(await admin.from('posts').select('slug').eq('id',post.id).single()).data;
 assert.equal((await request('/api/posts/'+draft.slug,'GET',undefined,false)).status,404);
 assert.equal((await publicDb.from('posts').select('id').eq('id',post.id)).data.length,0);
 assert.equal((await request('/api/admin/assets?id='+asset.id,'DELETE')).status,409);
 const publish=await request('/api/admin/posts?id='+post.id,'PUT',{...base,status:'published'});assert.equal(publish.status,200,JSON.stringify(publish.data));
 let detail=await request('/api/posts/'+draft.slug,'GET',undefined,false);assert.equal(detail.status,200);assert.equal(detail.data.item.post_images[0].caption,'First photo');
 const publishedAt=detail.data.item.published_at;assert.ok(publishedAt);
 const edited=await request('/api/admin/posts?id='+post.id,'PUT',{...base,title:marker+' changed',status:'published',album:[{asset_id:asset.id,caption:'Edited caption'}]});assert.equal(edited.status,200);
 detail=await request('/api/posts/'+draft.slug,'GET',undefined,false);assert.equal(detail.data.item.slug,draft.slug);assert.equal(detail.data.item.published_at,publishedAt);assert.equal(detail.data.item.post_images[0].caption,'Edited caption');
 const noAlbum=await request('/api/admin/posts?id='+post.id,'PUT',{...base,status:'published',album:[]});assert.equal(noAlbum.status,200);
 assert.equal((await request('/api/posts/'+draft.slug,'GET',undefined,false)).data.item.post_images.length,0);
 const restored=await request('/api/admin/posts?id='+post.id,'PUT',{...base,status:'published'});assert.equal(restored.status,200);
 assert.equal((await request('/api/posts/'+draft.slug,'GET',undefined,false)).data.item.post_images.length,1);
 const filtered=await request('/api/posts?category='+category.id+'&limit=1','GET',undefined,false);assert.equal(filtered.data.items.length,1);
 assert.equal((await request('/api/admin/categories?id='+category.id,'DELETE')).status,409);
 const duplicate=await request('/api/admin/posts','POST',{...base,slug:draft.slug});assert.equal(duplicate.status,409);
 const badLink=await request('/api/admin/posts?id='+post.id,'PUT',{...base,album:[{asset_id:crypto.randomUUID()}]});assert.equal(badLink.status,409);
 assert.equal((await request('/api/posts/'+draft.slug,'GET',undefined,false)).data.item.post_images.length,1);
 const html=await fetch(origin+'/posts/'+draft.slug).then(r=>r.text());assert.ok(html.includes('&lt;script&gt;alert(1)&lt;/script&gt;'),'Text must be escaped');
 await request('/api/admin/posts?id='+post.id,'PUT',{...base,status:'draft'});
 assert.equal((await request('/api/posts/'+draft.slug,'GET',undefined,false)).status,404);
 assert.equal((await request('/api/admin/posts?id='+post.id,'DELETE')).status,200);
 assert.equal((await request('/api/admin/assets?id='+asset.id,'DELETE')).status,409,'Other post still uses image');
 assert.equal((await request('/api/admin/posts?id='+shared.id,'DELETE')).status,200);
 assert.equal((await request('/api/admin/assets?id='+asset.id,'DELETE')).status,200);
 console.log('PASS: uploads, MIME/signatures/size, draft RLS, publish/unpublish, stable slug, albums, transaction rollback, safe text.');
 for(const table of ['people','departments','posts','assets','categories','landing_sections']) {
  const attempt=await publicDb.from(table).insert(table==='people'?{name:marker}:{id:crypto.randomUUID()});assert.ok(attempt.error,table+' public insert denied');
 }
 const plainUser=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,options);
 await plainUser.auth.signInWithPassword({email:auth.user.email,password});
 await admin.from('admin_users').delete().eq('user_id',auth.user.id);
 assert.ok((await plainUser.from('people').insert({name:marker})).error);
 assert.equal((await request('/api/admin/people')).status,403);
 await admin.from('admin_users').insert({user_id:auth.user.id});
 assert.equal((await request('/api/admin/auth','PATCH')).status,200);
 assert.equal((await request('/api/admin/auth','DELETE')).status,200);
 console.log('PASS: direct DB writes denied and immediate admin revocation.');
}
async function cleanup(){
 if(originalSettings)await admin.from('site_settings').update(originalSettings).eq('id','main');
 if(originalSection)await admin.from('landing_sections').update(originalSection).eq('id',originalSection.id);
 for(const table of ['posts','assignments','people','departments','categories'])if(created[table].length){const r=await admin.from(table).delete().in('id',created[table]);if(r.error)console.error('Cleanup failed:',table,r.error.code);}
 for(const id of created.assets){const row=await admin.from('assets').select('storage_path').eq('id',id).maybeSingle();await admin.from('assets').delete().eq('id',id);if(row.data?.storage_path){await admin.storage.from('gallery').remove([row.data.storage_path]);await admin.from('storage_cleanup').delete().eq('storage_path',row.data.storage_path);}}
 for(const id of created.users)await admin.auth.admin.deleteUser(id);
 console.log('Temporary CMS test records cleaned.');
}
main().catch(e=>{console.error(e.message);process.exitCode=1;}).finally(cleanup);
