/* eslint-disable @typescript-eslint/no-require-imports */
// One-time import. Existing CMS rows are never overwritten on repeat runs.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),ts=require('typescript');
const {createClient}=require('@supabase/supabase-js');
require('@next/env').loadEnvConfig(process.cwd());
function source(file){const m={exports:{}};new Function('exports','require','module',ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText)(m.exports,require,m);return m.exports;}
function id(key){const h=crypto.createHash('sha256').update('vths2-import:'+key).digest('hex');return `${h.slice(0,8)}-${h.slice(8,12)}-4${h.slice(13,16)}-a${h.slice(17,20)}-${h.slice(20,32)}`;}
async function main(){
 if(!process.env.SUPABASE_SECRET_KEY)throw new Error('SUPABASE_SECRET_KEY is required.');
 const db=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.SUPABASE_SECRET_KEY,{auth:{persistSession:false,autoRefreshToken:false}});
 async function insert(table,row){const result=await db.from(table).upsert(row,{onConflict:'id',ignoreDuplicates:true});if(result.error)throw result.error;}
 async function asset(url){
  if(!url?.startsWith('/'))return null;
  const file=path.resolve('public','.'+url),root=path.resolve('public')+path.sep;
  if(!file.startsWith(root)||!fs.existsSync(file))return null;
  const ext=path.extname(file).toLowerCase(),mime={'.jpg':'image/jpeg','.jpeg':'image/jpeg','.png':'image/png','.webp':'image/webp'}[ext];if(!mime)return null;
  const assetId=id('asset:'+url);await insert('assets',{id:assetId,storage_path:null,url,filename:path.basename(file),mime_type:mime,size_bytes:fs.statSync(file).size,alt:''});return assetId;
 }
 const defaults=source('data/homepage-data.ts'),settings=source('data/site-content.ts').defaultSiteContent;
 let team={advisors:defaults.advisorsData,organizers:defaults.organizersData,departments:defaults.departmentLeadsData,volunteers:defaults.volunteersData};
 if(fs.existsSync('data/team-override.json'))team={...team,...JSON.parse(fs.readFileSync('data/team-override.json','utf8'))};
 const current=await db.from('site_settings').select('content').eq('id','main').single();if(current.error)throw current.error;
 if(!Object.keys(current.data.content).length){let content=settings;if(fs.existsSync('data/site-content-override.json'))content={...content,...JSON.parse(fs.readFileSync('data/site-content-override.json','utf8'))};
  content.allowSubmissions=true;
  const result=await db.from('site_settings').update({content,logo_asset_id:await asset('/branding/Logo_VTHS.png'),background_asset_id:await asset('/branding/background_khongten_logo.png')}).eq('id','main');if(result.error)throw result.error;
 }
 const departmentIds=new Map();
 for(const [i,d] of team.departments.entries()){const departmentId=id('department:'+d.id);departmentIds.set(d.department,departmentId);await insert('departments',{id:departmentId,name:d.department,code:d.departmentCode||null,sort_order:i});}
 // A single profile is reused across roles when the legacy full name matches.
 async function person(p,index){const personId=id('person:'+p.name.trim().toLocaleLowerCase('vi'));await insert('people',{id:personId,name:p.name,code:p.code||null,unit:p.unit||'',quote:p.quote||p.message||'',badge:p.badge||'',asset_id:await asset(p.image),sort_order:index});return personId;}
 async function assign(p,role,departmentId,index){
  const personId=await person(p,index);
  let query=db.from('assignments').select('id').eq('person_id',personId).eq('role',role);
  query=departmentId?query.eq('department_id',departmentId):query.is('department_id',null);
  const existing=await query.maybeSingle();if(existing.error)throw existing.error;if(existing.data)return;
  await insert('assignments',{id:id('assignment:'+personId+':'+role+':'+departmentId),person_id:personId,department_id:departmentId,role,title:p.role||'',responsibility:p.title||'',sort_order:index});
 }
 for(const [i,p] of team.advisors.entries())await assign(p,'advisor',null,i);
 for(const [i,p] of team.organizers.entries())await assign(p,'organizer',null,i);
 for(const d of team.departments)for(const [i,p] of d.members.entries())await assign(p,p.role==='Trưởng Ban'?'lead':'deputy',departmentIds.get(d.department),i);
 for(const [i,p] of team.volunteers.entries()){
  if(p.department&&!departmentIds.has(p.department)){
   const matches=team.departments.filter(d=>d.department.toLocaleLowerCase('vi').includes(p.department.replace(/^Ban\s+/i,'').toLocaleLowerCase('vi')));
   if(matches.length===1)departmentIds.set(p.department,departmentIds.get(matches[0].department));
  }
  if(p.department&&!departmentIds.has(p.department)){const departmentId=id('department-name:'+p.department);await insert('departments',{id:departmentId,name:p.department});departmentIds.set(p.department,departmentId);}
  await assign(p,'volunteer',departmentIds.get(p.department)??null,i);
 }
 const recap=await db.from('landing_sections').select('content').eq('key','recap').single();if(recap.error)throw recap.error;
 if(!Object.keys(recap.data.content).length){const r=await db.from('landing_sections').update({content:{journey:defaults.recapStoriesData}}).eq('key','recap');if(r.error)throw r.error;}
 console.log('CMS import complete; existing edited rows were preserved.');
}
main().catch(e=>{console.error(e.message);process.exitCode=1;});
