/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const {createClient} = require('@supabase/supabase-js');
require('@next/env').loadEnvConfig(process.cwd());
const origin=process.env.TEST_BASE_URL||'http://localhost:3000';
const db=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.SUPABASE_SECRET_KEY,{auth:{persistSession:false,autoRefreshToken:false}});
const marker='deletion-check-'+crypto.randomUUID();
const created={assignments:[],people:[],posts:[],departments:[],categories:[]};
let userId,cookie='';
async function request(path,method='GET',payload,auth=true,source=origin){
  const response=await fetch(origin+path,{method,headers:{Origin:source,...(auth?{Cookie:cookie}:{}),...(payload?{'Content-Type':'application/json'}:{})},body:payload?JSON.stringify(payload):undefined,signal:AbortSignal.timeout(30000)});
  return {status:response.status,data:await response.json(),response};
}
async function create(resource,payload){
  const r=await request('/api/admin/'+resource,'POST',payload);assert.equal(r.status,201,JSON.stringify(r.data));
  const row=r.data.item??r.data;
  created[resource==='cards'?'assignments':resource].push(row.id);
  if(resource==='cards')created.people.push(row.person_id);
  return row;
}
async function row(table,id){const r=await db.from(table).select('*').eq('id',id).maybeSingle();assert.ifError(r.error);return r.data;}
(async()=>{
 try{
  assert.equal((await request('/api/admin/cards?id='+crypto.randomUUID(),'DELETE',undefined,false)).status,401);
  const password=crypto.randomUUID()+'Aa1!';
  const u=await db.auth.admin.createUser({email:marker+'@example.com',password,email_confirm:true});assert.ifError(u.error);userId=u.data.user.id;
  assert.ifError((await db.from('admin_users').insert({user_id:userId})).error);
  const login=await request('/api/admin/auth','POST',{email:u.data.user.email,password},false);assert.equal(login.status,200);
  cookie=login.response.headers.getSetCookie().map(c=>c.split(';')[0]).join('; ');
  assert.equal((await request('/api/admin/cards?id='+crypto.randomUUID(),'DELETE',undefined,true,'https://foreign.example')).status,403);
  const a=await db.from('assets').select('id').limit(1).single();assert.ifError(a.error);
  const dept=await create('departments',{name:marker+' old'}),dest=await create('departments',{name:marker+' destination'});
  const card=await create('cards',{asset_id:a.data.id,department_id:dept.id,role:'lead'});
  assert.equal((await request('/api/admin/departments?id='+dept.id,'DELETE')).status,409);
  assert.ok(await row('departments',dept.id));assert.equal((await row('assignments',card.id)).department_id,dept.id);
  assert.equal((await request(`/api/admin/departments?id=${dept.id}&move_to=${crypto.randomUUID()}`,'DELETE')).status,400);
  assert.equal((await request(`/api/admin/departments?id=${dept.id}&move_to=${dept.id}`,'DELETE')).status,400);
  assert.equal((await request(`/api/admin/departments?id=${dept.id}&move_to=${dest.id}`,'DELETE')).status,200);
  assert.equal(await row('departments',dept.id),null);assert.equal((await row('assignments',card.id)).department_id,dest.id);
  assert.equal((await row('assignments',card.id)).role,'lead');
  assert.equal((await request('/api/admin/cards?id='+card.id,'DELETE')).status,200);
  assert.equal(await row('assignments',card.id),null);assert.equal(await row('people',card.person_id),null);assert.ok(await row('assets',a.data.id));
  assert.equal((await request('/api/admin/cards?id='+card.id,'DELETE')).status,404);
  const shared=await create('cards',{asset_id:a.data.id,department_id:dest.id,role:'deputy'});
  const membership=await db.from('assignments').insert({person_id:shared.person_id,department_id:dest.id,role:'volunteer',responsibility:'program-card'}).select().single();assert.ifError(membership.error);created.assignments.push(membership.data.id);
  assert.equal((await request('/api/admin/cards?id='+shared.id,'DELETE')).status,200);assert.ok(await row('people',shared.person_id));
  assert.equal((await request('/api/admin/cards?id='+membership.data.id,'DELETE')).status,200);assert.equal(await row('people',shared.person_id),null);
  console.log('PASS: authorization, CSRF, card deletion, shared-person preservation and atomic department transfer.');
  const cat=await create('categories',{name:marker+' old'}),catDest=await create('categories',{name:marker+' destination'});
  const post=await create('posts',{title:marker,category_id:cat.id,cover_asset_id:a.data.id,status:'published',content:[{type:'paragraph',text:'Disposable deletion test'}]});
  const published=await row('posts',post.id);
  let publicPost=await request('/api/posts/'+published.slug,'GET',undefined,false);
  assert.equal(publicPost.status,200);assert.equal(publicPost.data.item.post_images.length,0);
  const payload={title:marker,category_id:cat.id,cover_asset_id:a.data.id,status:'published',content:[{type:'paragraph',text:'Disposable deletion test'}]};
  assert.equal((await request('/api/admin/posts?id='+post.id,'PUT',{...payload,album:[{asset_id:a.data.id}]})).status,200);
  assert.equal((await request('/api/admin/posts?id='+post.id,'PUT',{...payload,album:[]})).status,200);
  publicPost=await request('/api/posts/'+published.slug,'GET',undefined,false);
  assert.equal(publicPost.data.item.post_images.length,0);
  const article=await fetch(origin+'/posts/'+published.slug).then(r=>r.text());
  assert.ok(!article.includes('<h2>Album ảnh</h2>'));
  assert.ok(article.includes('image-natural'));
  assert.ok(!article.includes('class="image-action"'));
  console.log('PASS: publish without album, add/remove album on published post, empty album hidden and natural image markup.');
  assert.equal((await request('/api/admin/categories?id='+cat.id,'DELETE')).status,409);
  assert.equal((await row('posts',post.id)).category_id,cat.id);
  assert.equal((await request(`/api/admin/categories?id=${cat.id}&move_to=${catDest.id}`,'DELETE')).status,200);
  assert.equal((await row('posts',post.id)).category_id,catDest.id);assert.equal(await row('categories',cat.id),null);
  assert.equal((await request('/api/admin/posts?id='+post.id,'DELETE')).status,200);assert.equal(await row('posts',post.id),null);
  assert.equal((await request('/api/admin/categories?id='+catDest.id,'DELETE')).status,200);
  assert.equal((await request('/api/admin/departments?id='+dest.id,'DELETE')).status,200);
  assert.equal((await request('/api/admin/departments?id='+dest.id,'DELETE')).status,404);
  for(const route of ['/admin/departments','/admin/categories','/admin/volunteers'])assert.equal((await fetch(origin+route)).status,200);
  for(const [section,path] of [['departments','departments'],['categories','categories'],['cards','volunteers']]){
   const r=await fetch(origin+'/admin?section='+section,{redirect:'manual'});assert.equal(r.status,307);assert.equal(r.headers.get('location'),'/admin/'+path);
  }
  console.log('PASS: category transfer, post deletion, empty-group deletion, dedicated routes and legacy redirects.');
 }finally{
  for(const table of ['assignments','posts','people','departments','categories'])if(created[table].length)assert.ifError((await db.from(table).delete().in('id',created[table])).error);
  if(userId)assert.ifError((await db.auth.admin.deleteUser(userId)).error);
  console.log('Disposable test data cleaned up.');
 }
})().catch(e=>{console.error(e.message);process.exitCode=1;});
