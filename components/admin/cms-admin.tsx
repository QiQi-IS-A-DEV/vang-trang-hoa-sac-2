'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAdminSession } from './admin-session';
import { DeleteDialog } from './delete-dialog';
import { PostWorkspace } from './post-workspace';
import Image from 'next/image';


import { VolunteerCardManager } from './volunteer-card-manager';
import { WebsiteWorkspace } from './website-workspace';
import { AdminOverview } from './admin-overview';
import { IconDashboard, IconTalisman, IconStylus, IconAperture, IconCouncil, IconParchment, IconCompassExit, IconGlobe, IconShieldAdmin, IconPlusNode, IconMonocle, IconCipherLock } from './admin-icons';

type Row = Record<string, unknown>;

type Field = {key:string;label:string;type?:'boolean'|'number'|'text'|'textarea';options?:string[];source?:string;required?:boolean};
const definitions:Record<string,{label:string;fields:Field[]}> = {
  overview:{label:'Tổng quan',fields:[]},
  website:{label:'Quản lý trang chủ',fields:[]},
  'website-brand':{label:'Logo & ảnh nền',fields:[]},
  'website-memories':{label:'Cây kỷ niệm',fields:[]},
  cards:{label:'Tình nguyện viên chương trình',fields:[]},
  settings:{label:'Cài đặt nội dung',fields:[
    ...[['heroTitle','Tên chương trình'],['heroSubtitle','Tiêu đề phụ'],['heroDescription','Giới thiệu'],['statPresents','Số phần quà'],['statScholarships','Số học bổng'],['statVolunteers','Số TNV'],['statLanterns','Số lồng đèn'],['footerQuote','Lời kết'],['memoriesTitle','Tiêu đề cây'],['memoriesSubtitle','Tiêu đề phụ cây'],['memoriesDescription','Mô tả cây'],['primaryButton','Nút cây kỷ niệm'],['secondaryButton','Nút xem chương trình']].map(([key,label])=>({key,label})),
    {key:'logo_asset_id',label:'Logo',source:'assets'},{key:'background_asset_id',label:'Ảnh nền',source:'assets'}]},
  posts:{label:'Bài viết',fields:[]},
  categories:{label:'Danh mục',fields:[{key:'name',label:'Tên',required:true},{key:'sort_order',label:'Thứ tự',type:'number'}]},
  departments:{label:'Các ban',fields:[{key:'name',label:'Tên ban',required:true},{key:'code',label:'Mã ban'},{key:'description',label:'Mô tả',type:'textarea'},{key:'visible',label:'Hiển thị',type:'boolean'},{key:'sort_order',label:'Thứ tự',type:'number'}]},
  'landing-sections':{label:'Khu vực trang chủ',fields:[{key:'key',label:'Khu vực',options:['hero','advisors','organizers','departments','volunteers','recap','footer']},{key:'title',label:'Tiêu đề'},{key:'description',label:'Mô tả',type:'textarea'},{key:'enabled',label:'Bật khu vực',type:'boolean'},{key:'sort_order',label:'Thứ tự',type:'number'},{key:'asset_id',label:'Ảnh khu vực',source:'assets'}]},
  assets:{label:'Thư viện ảnh',fields:[{key:'alt',label:'Mô tả ảnh'}]},
};
const roleLabels:Record<string,string>={advisor:'Cố vấn',organizer:'Ban tổ chức',lead:'Trưởng ban',deputy:'Phó ban',volunteer:'Tình nguyện viên',draft:'Nháp',published:'Đã đăng'};
async function api(url:string,init?:RequestInit):Promise<Row> {
  let response=await fetch(url,init);
  if(response.status===401 && !url.includes('/auth')) {
    const refresh=await fetch('/api/admin/auth',{method:'PATCH'});
    if(refresh.ok) response=await fetch(url,init);
  }
  const data=await response.json();
  if(!response.ok) throw new Error(data.error+(data.usages?' '+data.usages.map((u:Row)=>`${u.type}: ${u.title??u.name??u.post_id??u.key??u.id}`).join(', '):''));
  return data;
}
async function all(resource:string):Promise<Row[]> {
  let offset:number|null=0; const rows:Row[]=[];
  while(offset!==null) {const data=await api(`/api/admin/${resource}?limit=100&offset=${offset}`);rows.push(...data.items as Row[]);offset=data.next_offset as number|null;}
  return rows;
}
const control='admin-control';
const navigationGroups=[{label:'Không gian làm việc',keys:['overview','cards','posts','assets']},{label:'Tổ chức & nội dung',keys:['departments','categories']},{label:'Website',keys:['website','website-brand','website-memories']}];
const navigationIcons:Record<string,typeof IconDashboard>={overview:IconDashboard,cards:IconTalisman,posts:IconStylus,assets:IconAperture,departments:IconCouncil,people:IconCouncil,assignments:IconShieldAdmin,categories:IconParchment,'landing-sections':IconParchment,settings:IconCipherLock,website:IconParchment,'website-brand':IconAperture,'website-memories':IconTalisman};
const descriptions:Record<string,string>={posts:'Viết, lưu nháp và đăng những câu chuyện của mùa trăng.',assets:'Upload và quản lý ảnh gốc của chương trình.',departments:'Sắp xếp các ban để phân nhóm ảnh thẻ trên trang chủ.',people:'Quản lý hồ sơ nhân sự và các liên kết hiện có.',assignments:'Kết nối nhân sự với ban và vai trò.',categories:'Sắp xếp các chủ đề bài viết.',settings:'Cập nhật lời giới thiệu, hình ảnh thương hiệu và lời kết.','landing-sections':'Chọn nội dung, thứ tự và các khu vực được hiển thị.'};
export function CmsAdmin({postView,postId,initialTab,websiteView}:{postView?:'list'|'new'|'edit';postId?:string;initialTab?:string;websiteView?:string}) {
  const router=useRouter();
  const websiteTab=websiteView==='brand'?'website-brand':websiteView==='memories'?'website-memories':'website';
  const [postDirty,setPostDirty]=useState(false);
  const {email,signOut}=useAdminSession();
  const [notice,setNotice]=useState(''),[busy,setBusy]=useState(false);
  const [loadingRows,setLoadingRows]=useState(true);
  const [tab,setTab]=useState(websiteView?websiteTab:postView?'posts':initialTab??'overview'),[rows,setRows]=useState<Row[]>([]),[lookup,setLookup]=useState<Record<string,Row[]>>({});
  const [menuOpen,setMenuOpen]=useState(false),[search,setSearch]=useState(''),[status,setStatus]=useState('all'),[pendingCreate,setPendingCreate]=useState(false),[loadRevision,setLoadRevision]=useState(0);
  const [editing,setEditing]=useState<Row|null>(null);
  const [deleteTarget,setDeleteTarget]=useState<Row|null>(null),[moveTo,setMoveTo]=useState('');
  const [journey,setJourney]=useState<Row[]>([]),[stats,setStats]=useState<Row[]>([]);
  useEffect(()=>{
    if(tab.startsWith('website') || tab==='cards' || tab==='overview' || tab==='posts' || tab==='landing-sections')return;
    let active=true;
    async function load(){try {
      const [items,...related]=await Promise.all([tab==='settings'?api('/api/settings').then(d=>[d.settings as Row]):all(tab),...['assets','departments','categories'].map(all)]);
      if(active){setRows(items);setLookup(Object.fromEntries(['assets','departments','categories'].map((key,i)=>[key,related[i]])));if(pendingCreate){setEditing(Object.fromEntries(definitions[tab].fields.map(f=>[f.key,f.type==='boolean'?true:f.type==='number'?0:f.options?.[0]??''])));setPendingCreate(false);}}
    }catch(e){if(active)setNotice((e as Error).message);}finally{if(active)setLoadingRows(false);}}
    void load();return()=>{active=false;};
  },[tab,pendingCreate,loadRevision]);
  function navigate(key:string,create=false){
    if(busy)return;
    if((editing||postDirty)&&!confirm('Rời khỏi biểu mẫu? Các thay đổi chưa lưu sẽ không được giữ.'))return;
    const routes:Record<string,string>={overview:'/admin',cards:'/admin/volunteers',posts:'/admin/posts',departments:'/admin/departments',categories:'/admin/categories',website:'/admin/website','website-brand':'/admin/website/brand','website-memories':'/admin/website/memories','landing-sections':'/admin/website',settings:'/admin/website/brand'};
    setMenuOpen(false);
    if(routes[key]){router.push(key==='posts'&&create?'/admin/posts/new':routes[key]);return;}
    if(websiteView||postView||initialTab==='cards'||initialTab==='departments'||initialTab==='categories'){router.push(`/admin?section=${key}`);return;}
    setLoadingRows(true);setRows([]);setTab(key);setEditing(null);setNotice('');setSearch('');setStatus('all');setPendingCreate(create);window.scrollTo({top:0,behavior:'instant'});
  }
  const visibleRows=rows.filter(r=>[r.title,r.name,r.filename,r.key,(lookup.people?.find(p=>p.id===r.person_id)?.name)].filter(Boolean).join(' ').toLocaleLowerCase('vi').includes(search.toLocaleLowerCase('vi'))&&(status==='all'||r.status===status));
  async function reload(){setRows(tab==='settings'?[(await api('/api/settings')).settings as Row]:await all(tab));}
  function edit(row:Row={}) {
    const fresh:Row={};
    definitions[tab].fields.forEach(f=>{fresh[f.key]=row[f.key]??(f.type==='boolean'?true:f.type==='number'?0:f.options?.[0]??'');});
    if(row.id)fresh.id=row.id;
    setEditing(fresh);
    const content=(row.content && !Array.isArray(row.content)?row.content:{}) as Row;
    setJourney((content.journey as Row[])??[]);setStats((content.stats as Row[])??[]);
  }
  async function save(e:React.FormEvent) {
    e.preventDefault();if(!editing)return;setBusy(true);setNotice('');
    try {
      const {id,...payload}=editing;
      definitions[tab].fields.forEach(f=>{if(f.source&&payload[f.key]==='')payload[f.key]=null;});
      if(['people','departments'].includes(tab)&&payload.code==='')payload.code=null;
      if(tab==='landing-sections')payload.content={journey,stats};
      await api(tab==='settings'?'/api/settings':`/api/admin/${tab}${id?'?id='+id:''}`,{method:tab==='settings'?'POST':id?(tab==='posts'?'PUT':'PATCH'):'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
      setEditing(null);await reload();setNotice('Đã lưu thành công.');
    }catch(e){setNotice((e as Error).message);}finally{setBusy(false);}
  }
  return <div className="admin-workspace" onKeyDown={e=>{if(e.key==='Escape')setMenuOpen(false);}}>
    <a href="#admin-content" className="admin-skip">Đến nội dung quản trị</a>
    <aside className={`admin-sidebar ${menuOpen?'is-open':''}`} id="admin-sidebar">
      <Link href="/" className="admin-brand"><Image src="/branding/Logo_VTHS.png" alt="" width={48} height={48} unoptimized/><span>Vầng Trăng<br/>Hòa Sắc 2<small>Không gian quản trị</small></span></Link>
      <nav aria-label="Quản lý nội dung">{navigationGroups.map(group=><div key={group.label} className="admin-nav-group"><p>{group.label}</p>{group.keys.map(key=>{const Icon=navigationIcons[key];return <button key={key} disabled={busy} aria-current={tab===key?'page':undefined} onClick={()=>navigate(key)}><Icon size={20}/><span>{definitions[key].label}</span></button>;})}</div>)}</nav>
      <div className="admin-sidebar-footer"><span><IconShieldAdmin size={18}/>Quyền quản trị viên</span><button disabled={busy} onClick={async()=>{setBusy(true);try{await signOut();setEditing(null);setNotice('');}catch(e){setNotice((e as Error).message);}finally{setBusy(false);}}}><IconCompassExit size={18}/>Đăng xuất</button></div>
    </aside>
    <div className="admin-main">
      <header className="admin-topbar"><button className="admin-menu-toggle" aria-label={menuOpen?'Đóng điều hướng':'Mở điều hướng'} aria-expanded={menuOpen} aria-controls="admin-sidebar" onClick={()=>setMenuOpen(v=>!v)}><IconDashboard size={20}/></button><div className="admin-breadcrumb"><span>Quản trị</span><span>/</span><strong>{definitions[tab].label}</strong></div><div className="admin-topbar-actions"><Link href="/" className="admin-public-link"><IconGlobe size={18}/><span>Trang công khai ↗</span></Link><span className="admin-avatar" title={email}>AD</span></div></header>
      <main id="admin-content" className="admin-content">
    {postView ? <PostWorkspace key={postId??postView} view={postView} postId={postId} onBusyChange={setBusy} onDirtyChange={setPostDirty}/> : tab==='overview' ? <AdminOverview load={all} navigate={navigate}/> : tab==='cards' ? <VolunteerCardManager onBusyChange={setBusy} onManageDepartments={()=>navigate('departments')}/> : tab.startsWith('website') ? <WebsiteWorkspace key={websiteView??'overview'} view={websiteView??'overview'} onBusyChange={setBusy} onDirtyChange={setPostDirty}/> : <>
    <div className="admin-page-heading"><div><span className="admin-kicker">Quản lý nội dung</span><h1>{definitions[tab].label}</h1><p>{descriptions[tab]}</p></div>{!editing&&tab!=='assets'&&tab!=='settings'&&<button className="admin-primary" disabled={loadingRows||busy} onClick={()=>edit()}><IconPlusNode size={18}/>Thêm mới</button>}</div>
    {notice&&<p role="status" className="admin-notice">{notice}</p>}
    {!editing&&tab!=='settings'&&<div className="admin-resource-toolbar"><label><IconMonocle size={18}/><input type="search" aria-label="Tìm trong danh sách" placeholder="Tìm trong danh sách…" value={search} onChange={e=>setSearch(e.target.value)}/></label>{tab==='posts'&&<select aria-label="Lọc trạng thái bài viết" value={status} onChange={e=>setStatus(e.target.value)}><option value="all">Mọi trạng thái</option><option value="published">Đã đăng</option><option value="draft">Bản nháp</option></select>}<span className="admin-resource-count">{loadingRows?'Đang tải…':`${visibleRows.length} mục`}</span></div>}
    {tab==='assets'&&<label className="block">Tải ảnh gốc JPEG, PNG hoặc WebP (tối đa 10 MB, giữ nguyên chất lượng)<input className={control} type="file" accept="image/jpeg,image/png,image/webp" disabled={busy} onChange={async e=>{const file=e.target.files?.[0];if(!file)return;setBusy(true);try{const form=new FormData();form.set('file',file);await api('/api/admin/upload',{method:'POST',body:form});await reload();setLookup({...lookup,assets:await all('assets')});setNotice('Đã tải ảnh lên.');}catch(e){setNotice((e as Error).message);}finally{setBusy(false);e.target.value='';}}}/></label>}

    {editing?<form onSubmit={save} className="admin-editor space-y-4"><div className="admin-panel-heading"><h2>{editing.id?'Chỉnh sửa nội dung':'Tạo nội dung mới'}</h2><button type="button" className="admin-text-button" disabled={busy} onClick={()=>{if(confirm('Bỏ các thay đổi chưa lưu?'))setEditing(null);}}>Đóng biểu mẫu ×</button></div>
      <div className="grid gap-4 md:grid-cols-2">{definitions[tab].fields.map(f=><label key={f.key} className="block">{f.label}{f.required && <span aria-label="bắt buộc"> *</span>}{f.type==='boolean'?<input className="ml-3" type="checkbox" checked={Boolean(editing[f.key])} onChange={e=>setEditing({...editing,[f.key]:e.target.checked})}/>:f.options||f.source?<select className={control} required={f.required} value={String(editing[f.key]??'')} onChange={e=>setEditing({...editing,[f.key]:e.target.value})}>{f.source&&<option value="">Không chọn</option>}{f.options?.map(o=><option key={o} value={o}>{roleLabels[o]??o}</option>)}{f.source&&lookup[f.source]?.map(r=><option key={String(r.id)} value={String(r.id)}>{String(r.name??r.filename)} · {String(r.id).slice(0,8)}</option>)}</select>:f.type==='textarea'?<textarea className={control} value={String(editing[f.key]??'')} onChange={e=>setEditing({...editing,[f.key]:e.target.value})}/>:<input className={control} type={f.type==='number'?'number':'text'} min={0} required={f.required} value={String(editing[f.key]??'')} onChange={e=>setEditing({...editing,[f.key]:f.type==='number'?Number(e.target.value):e.target.value})}/>}</label>)}</div>
      {tab==='landing-sections'&&<>{[['Số liệu',stats,setStats,['label','value','subtext','icon']],['Hành trình',journey,setJourney,['phase','title','date','description','highlight']]].map(([label,entries,setter,keys])=>{
        const items=entries as Row[],update=setter as (r:Row[])=>void;return <div key={String(label)} className="space-y-3 mt-4"><h2 className="font-bold text-amber-200">{String(label)}</h2>{items.map((r,i)=><div key={i} className="grid gap-3 md:grid-cols-2 rounded-xl border border-amber-400/15 bg-black/20 p-4">{(keys as string[]).map(key=><label key={key} className="block text-xs font-semibold text-purple-200">{({label:'Nhãn',value:'Giá trị',subtext:'Mô tả phụ',icon:'Biểu tượng',phase:'Giai đoạn',title:'Tiêu đề',date:'Thời gian',description:'Mô tả',highlight:'Điểm nhấn'} as Record<string,string>)[key]}<input className={control} value={String(r[key]??'')} onChange={e=>update(items.map((old,j)=>i===j?{...r,[key]:e.target.value}:old))}/></label>)}<div className="md:col-span-2 text-right"><button type="button" className="text-rose-400 hover:underline text-xs" onClick={()=>update(items.filter((_,j)=>i!==j))}>Gỡ mục</button></div></div>)}<button type="button" className="admin-secondary text-xs" onClick={()=>update([...items,Object.fromEntries((keys as string[]).map(k=>[k,'']))])}>+ Thêm mục</button></div>;
      })}</>}
      <div className="pt-4 border-t border-amber-400/20 flex items-center gap-3"><button disabled={busy} className="admin-primary">{busy?'Đang lưu…':'Lưu thay đổi'}</button><button type="button" className="admin-secondary" onClick={()=>setEditing(null)}>Hủy</button></div>
    </form>:<div className={`admin-resource-list ${tab==='assets'?'is-assets':''}`}>{loadingRows?<p className="admin-empty" role="status">Đang tải nội dung…</p>:!visibleRows.length?<div className="admin-empty"><IconParchment size={32}/><h2>{rows.length?'Chưa tìm thấy kết quả':'Chưa có nội dung'}</h2><p>{rows.length?'Thử tìm bằng từ khóa khác.':'Thêm nội dung đầu tiên để bắt đầu.'}</p><button className="admin-secondary" onClick={()=>setLoadRevision(n=>n+1)}>Tải lại danh sách</button></div>:visibleRows.map((r,i)=><article key={String(r.id??i)} className="admin-resource-row"><div>{tab==='assets'&&<Image src={String(r.url)} alt={String(r.alt)} unoptimized width={128} height={96} className="admin-asset-preview"/>}<strong>{String(r.title||r.name||r.filename||r.key||definitions[tab].label)}</strong>{r.role?<span> · {roleLabels[String(r.role)]} · {lookup.people?.find(p=>p.id===r.person_id)?.name as string}</span>:null}{r.status?<span> · {roleLabels[String(r.status)]}</span>:null}{r.visible===false||r.enabled===false?<small className="admin-badge">Đang ẩn</small>:null}</div><div className="admin-row-actions"><button className="admin-action-btn is-edit" disabled={busy||loadingRows} onClick={()=>edit(r)}>Sửa</button>{tab!=='settings'&&<button className="admin-action-btn is-delete" disabled={busy} onClick={()=>{setDeleteTarget(r);setMoveTo('');}}>Xóa</button>}</div></article>)}</div>}
    </>}
      {deleteTarget&&<DeleteDialog title={`Xóa “${String(deleteTarget.name||deleteTarget.filename||deleteTarget.title||definitions[tab].label)}”?`} description={tab==='departments'?'Nếu ban đang có thẻ hoặc nhân sự, hãy chọn ban nhận dữ liệu trước khi xóa.':tab==='categories'?'Nếu danh mục đang có bài viết, hãy chọn danh mục nhận bài viết trước khi xóa.':'Mục này sẽ bị xóa khỏi hệ thống. Các ảnh đang được sử dụng cần gỡ liên kết trước khi xóa.'} onClose={()=>setDeleteTarget(null)} onDelete={async()=>{
        setBusy(true);
        try{await api(`/api/admin/${tab}?id=${deleteTarget.id}${moveTo?'&move_to='+moveTo:''}`,{method:'DELETE'});setRows(old=>old.filter(r=>r.id!==deleteTarget.id));setNotice('Đã xóa thành công.');setLoadRevision(n=>n+1);}finally{setBusy(false);}
      }}>
        {['departments','categories'].includes(tab)&&<label> {tab==='departments'?'Chuyển thẻ và nhân sự sang ban':'Chuyển bài viết sang danh mục'}<select className={control} value={moveTo} onChange={e=>setMoveTo(e.target.value)}><option value="">Không chuyển dữ liệu</option>{rows.filter(r=>r.id!==deleteTarget.id).map(r=><option key={String(r.id)} value={String(r.id)}>{String(r.name)}</option>)}</select><small>Không cần chọn nếu mục này chưa có dữ liệu liên kết.</small></label>}
      </DeleteDialog>}
      </main>
      <footer className="admin-bottom-note">Vầng Trăng Hòa Sắc 2 · Không gian quản trị nội dung</footer>
    </div>
  </div>;
}
