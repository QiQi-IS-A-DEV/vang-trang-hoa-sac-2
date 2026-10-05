"use client";
/* Hallmark · Workbench · existing purple/gold system · pre-emit critique: P4 H5 E4 S5 R4 V4 */
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { adminFetch } from '@/frontend/lib/admin-upload';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { blockSchema } from '@/shared/validation/cms';
import './post-workspace.css';
import { DeleteDialog } from './delete-dialog';

type Block=z.infer<typeof blockSchema>;
type Asset={id:string;url:string;filename:string;thumbnail_url?:string|null};
type Photo={asset_id:string;caption?:string;asset?:Asset|null;sort_order?:number};
type Category={id:string;name:string};
type Post={id:string;title:string;slug:string;excerpt:string;category_id:string;cover_asset_id:string|null;status:'draft'|'published';sort_order:number;content:Block[];post_images:Photo[];cover?:Asset|null;post_content_assets?:{asset:Asset|null}[];updated_at:string};
async function api(url:string,init?:RequestInit){
  let response=await adminFetch(url,init);
  if(response.status===401){const refresh=await fetch('/api/admin/auth',{method:'PATCH'});if(refresh.ok)response=await adminFetch(url,init);}
  const data=await response.json();if(!response.ok)throw new Error(data.error||'Không thể tải hoặc lưu bài viết.');return data;
}
async function all<T>(resource:string):Promise<T[]>{
  const items:T[]=[];let offset:number|null=0;
  while(offset!==null){const data=await api(`/api/admin/${resource}?limit=100&offset=${offset}`);items.push(...data.items);offset=data.next_offset;}
  return items;
}
const blockLabels={paragraph:'Đoạn văn',heading:'Tiêu đề phụ',list:'Danh sách',image:'Ảnh trong nội dung'};
function PhotoPreview({asset,alt}:{asset?:Asset|null;alt:string}){return asset?<Image src={asset.thumbnail_url||asset.url} alt={alt} width={1200} height={800} unoptimized className="post-photo"/>:null;}

export function PostWorkspace({view,postId,onBusyChange,onDirtyChange}:{view:'list'|'new'|'edit';postId?:string;onBusyChange:(v:boolean)=>void;onDirtyChange:(v:boolean)=>void}){
  const router=useRouter();
  const [deleteTarget,setDeleteTarget]=useState<Post|null>(null);
  const [posts,setPosts]=useState<Post[]>([]),[categories,setCategories]=useState<Category[]>([]),[assets,setAssets]=useState<Record<string,Asset>>({});
  const [loading,setLoading]=useState(true),[error,setError]=useState(''),[notice,setNotice]=useState(''),[busy,setBusy]=useState(false),[retry,setRetry]=useState(0);
  const [title,setTitle]=useState(''),[excerpt,setExcerpt]=useState(''),[category,setCategory]=useState(''),[cover,setCover]=useState<string|null>(null);
  const [blocks,setBlocks]=useState<Block[]>([{type:'paragraph',text:''}]),[album,setAlbum]=useState<Photo[]>([]),[saved,setSaved]=useState<Post|null>(null);
  const [dirty,setDirty]=useState(false),[preview,setPreview]=useState(false),[search,setSearch]=useState(''),[filter,setFilter]=useState('all');
  const dialog=useRef<HTMLDialogElement>(null);
  useEffect(()=>{if(error)window.scrollTo({top:0,behavior:'instant'});},[error]);
  useEffect(()=>{onBusyChange(busy);return()=>onBusyChange(false);},[busy,onBusyChange]);
  useEffect(()=>{onDirtyChange(dirty);return()=>onDirtyChange(false);},[dirty,onDirtyChange]);
  useEffect(()=>{if(!dirty)return;const guard=(e:BeforeUnloadEvent)=>{e.preventDefault();e.returnValue='';};window.addEventListener('beforeunload',guard);return()=>window.removeEventListener('beforeunload',guard);},[dirty]);
  useEffect(()=>{
    let active=true;
    Promise.all([all<Category>('categories'),view==='edit'?api(`/api/admin/posts?id=${postId}`).then(d=>d.items as Post[]):view==='list'?all<Post>('posts'):Promise.resolve([] as Post[])]).then(([cats,rows])=>{
      if(!active)return;setCategories(cats);setPosts(rows);
      if(view==='edit'){
        const p=rows[0];if(!p)throw new Error('Bài viết không còn tồn tại.');
        setSaved(p);setTitle(p.title);setExcerpt(p.excerpt);setCategory(p.category_id);setCover(p.cover_asset_id);setBlocks(p.content??[]);setAlbum([...p.post_images].sort((a,b)=>(a.sort_order??0)-(b.sort_order??0)));
        const images=[p.cover,...p.post_images.map(a=>a.asset),...(p.post_content_assets??[]).map(a=>a.asset)].filter((a):a is Asset=>Boolean(a));setAssets(Object.fromEntries(images.map(a=>[a.id,a])));
      }
      setError('');
    }).catch(e=>{if(active)setError(e.message);}).finally(()=>{if(active)setLoading(false);});
    return()=>{active=false;};
  },[view,postId,retry]);
  function change(){setDirty(true);setNotice('');setError('');}
  function leave(e:React.MouseEvent<HTMLAnchorElement>){if(busy||(dirty&&!confirm('Rời trang và bỏ các thay đổi chưa lưu?')))e.preventDefault();}
  function updateBlock(index:number,next:Block){change();setBlocks(old=>old.map((b,i)=>i===index?next:b));}
  function move<T>(items:T[],index:number,delta:number):T[]{const next=[...items];[next[index],next[index+delta]]=[next[index+delta],next[index]];return next;}
  async function upload(files:FileList|null,target:'cover'|'content'|'album'){
    if(!files?.length||busy)return;setBusy(true);setError('');setNotice('Đang tải và tối ưu ảnh…');
    let completed=0;
    try{
      for(const file of Array.from(files)){
        if(!['image/jpeg','image/png','image/webp'].includes(file.type)||!file.size)throw new Error(`${file.name}: chọn JPEG, PNG hoặc WebP hợp lệ.`);
        const form=new FormData();form.set('file',file);const {asset}=await api('/api/admin/upload?purpose=post',{method:'POST',body:form}) as {asset:Asset};
        setAssets(old=>({...old,[asset.id]:asset}));setDirty(true);
        if(target==='cover')setCover(asset.id);
        if(target==='content')setBlocks(old=>[...old,{type:'image',asset_id:asset.id,caption:''}]);
        if(target==='album')setAlbum(old=>[...old,{asset_id:asset.id,caption:''}]);
        completed++;
      }
      setNotice(`Đã tải ${completed} ảnh đã tối ưu. Lưu bài viết để giữ các thay đổi.`);
    }catch(e){setError(`${(e as Error).message}${completed?` Đã tải thành công ${completed} ảnh trước đó.`:''}`);setNotice('');}finally{setBusy(false);}
  }
  function uploader(target:'cover'|'content'|'album',label:string){return <label className="post-upload">{label}<input type="file" aria-label={label} accept="image/jpeg,image/png,image/webp" multiple={target!=='cover'} disabled={busy} onChange={e=>{void upload(e.target.files,target);e.target.value='';}}/></label>;}
  async function save(status:'draft'|'published'){
    if(busy)return;
    if(!title.trim()||!category){setError('Nhập tiêu đề và chọn danh mục trước khi lưu.');return;}
    if(status==='published'&&!cover){setError('Upload ảnh bìa trước khi đăng bài.');return;}
    const content=blocks.filter(b=>b.type==='image'||(b.type==='list'?b.items.some(s=>s.trim()):b.text.trim()));
    if(status==='published'&&!content.length){setError('Thêm nội dung bài viết trước khi đăng.');return;}
    setBusy(true);setError('');setNotice('');
    try{
      const payload={title,excerpt,category_id:category,cover_asset_id:cover,status,sort_order:saved?.sort_order??0,content,album:album.map((a,i)=>({asset_id:a.asset_id,caption:a.caption??'',sort_order:i}))};
      const result=await api(`/api/admin/posts${postId?'?id='+postId:''}`,{method:postId?'PUT':'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
      setDirty(false);onDirtyChange(false);
      if(!postId)router.replace(`/admin/posts/${result.id}/edit`);
      else{const next=(await api(`/api/admin/posts?id=${postId}`)).items[0] as Post;setSaved(next);setNotice(status==='published'?'Đã đăng bài. Bạn có thể mở bài trên trang công khai.':'Đã lưu bản nháp. Bài chưa hiển thị công khai.');}
    }catch(e){setError((e as Error).message);}finally{setBusy(false);}
  }
  if(loading)return <p role="status" className="admin-empty">Đang tải {view==='list'?'danh sách':'trình soạn'} bài viết…</p>;
  if(error&&(!categories.length||(view==='edit'&&!saved)))return <div role="alert" className="admin-notice">{error}<button onClick={()=>{setLoading(true);setRetry(v=>v+1);}}>Thử lại</button><Link href="/admin/posts">Về danh sách</Link></div>;
  if(view==='list'){
    const visible=posts.filter(p=>(filter==='all'||p.status===filter)&&`${p.title} ${p.excerpt}`.toLocaleLowerCase('vi').includes(search.toLocaleLowerCase('vi'))).sort((a,b)=>b.updated_at.localeCompare(a.updated_at));
    return <section className="post-workspace">
      <div className="admin-page-heading"><div><span className="admin-kicker">Nội dung mùa trăng</span><h1>Bài viết</h1><p>Viết câu chuyện mới, tiếp tục bản nháp hoặc cập nhật bài đã đăng.</p></div><Link href="/admin/posts/new" className="admin-primary">+ Viết bài mới</Link></div>
      <div className="admin-resource-toolbar"><label><input type="search" aria-label="Tìm bài viết" placeholder="Tìm theo tiêu đề hoặc mô tả…" value={search} onChange={e=>setSearch(e.target.value)}/></label><select aria-label="Trạng thái bài viết" value={filter} onChange={e=>setFilter(e.target.value)}><option value="all">Tất cả trạng thái</option><option value="draft">Bản nháp</option><option value="published">Đã đăng</option></select><span>{visible.length} bài viết</span></div>
      {error&&<p role="alert" className="admin-notice">{error}</p>}
      {!visible.length?<div className="admin-panel admin-empty"><h2>{posts.length?'Không tìm thấy bài phù hợp':'Câu chuyện đầu tiên bắt đầu từ đây'}</h2><p>{posts.length?'Thử đổi từ khóa hoặc bộ lọc.':'Nhập tiêu đề, viết nội dung và upload ảnh. Bạn có thể lưu nháp trước khi đăng.'}</p>{!posts.length&&<Link href="/admin/posts/new" className="admin-primary">Viết bài đầu tiên</Link>}</div>:<div className="post-list">{visible.map(p=><article key={p.id} className="post-list-row"><div className="post-list-photo">{p.cover?<PhotoPreview asset={p.cover} alt={p.title}/>:<span>Chưa có ảnh bìa</span>}</div><div className="post-list-details"><span className={`admin-badge ${p.status==='published'?'is-published':''}`}>{p.status==='published'?'Đã đăng':'Bản nháp'}</span><h2><Link href={`/admin/posts/${p.id}/edit`}>{p.title}</Link></h2><p>{p.excerpt||'Chưa có mô tả ngắn.'}</p><small>{categories.find(c=>c.id===p.category_id)?.name??'Danh mục'} · Cập nhật {new Date(p.updated_at).toLocaleDateString('vi-VN')}</small></div><div className="post-list-actions"><Link className="admin-secondary" href={`/admin/posts/${p.id}/edit`}>Chỉnh sửa</Link>{p.status==='published'&&<Link href={`/posts/${p.slug}`} target="_blank" className="admin-text-button">Xem bài ↗</Link>}<button className="admin-text-button post-danger" disabled={busy} onClick={()=>setDeleteTarget(p)}>Xóa bài</button></div></article>)}</div>}
      {deleteTarget&&<DeleteDialog title={`Xóa bài “${deleteTarget.title}”?`} description="Bài viết sẽ bị xóa khỏi website. Ảnh của bài vẫn được giữ trong Thư viện ảnh." onClose={()=>setDeleteTarget(null)} onDelete={async()=>{
        setBusy(true);try{await api('/api/admin/posts?id='+deleteTarget.id,{method:'DELETE'});setPosts(old=>old.filter(p=>p.id!==deleteTarget.id));}finally{setBusy(false);}
      }}/>}
    </section>;
  }
  return <section className="post-workspace">
    <Link href="/admin/posts" className="admin-text-button" onClick={leave}>← Danh sách bài viết</Link>
    <div className="admin-page-heading"><div><span className="admin-kicker">{saved?.status==='published'?'Bài đã đăng':'Bản nháp'}</span><h1>{view==='new'?'Viết bài mới':'Chỉnh sửa bài viết'}</h1><p>Viết nội dung, upload ảnh và xem trước trước khi lưu hoặc đăng bài.</p></div><div className="post-heading-actions"><a className="admin-secondary post-jump-save" href="#post-save">Lưu & đăng ↓</a><button type="button" className="admin-secondary" onClick={()=>{setPreview(true);dialog.current?.showModal();}}>Xem trước</button></div></div>
    <div aria-live="polite">{error&&<p role="alert" className="admin-notice">{error}</p>}{notice&&<p role="status" className="admin-notice">{notice}</p>}</div>
    <fieldset disabled={busy} className="post-editor-grid">
      <div className="post-editor-main">
        <section className="admin-panel post-fields"><label htmlFor="post-title">Tiêu đề bài viết <span>*</span></label><input id="post-title" className="admin-control post-title-input" maxLength={160} value={title} placeholder="Câu chuyện bạn muốn kể…" onChange={e=>{change();setTitle(e.target.value);}}/><label htmlFor="post-excerpt">Mô tả ngắn</label><textarea id="post-excerpt" className="admin-control" maxLength={2000} rows={3} value={excerpt} placeholder="Vài dòng giới thiệu giúp người đọc hình dung nội dung bài." onChange={e=>{change();setExcerpt(e.target.value);}}/></section>
        <section className="admin-panel post-content-editor"><h2>Nội dung bài viết</h2><p>Viết từng đoạn. Có thể thêm tiêu đề phụ hoặc upload ảnh xen giữa nội dung.</p>
          {blocks.map((b,i)=><div className="post-block" key={i}><div className="post-block-heading"><strong>{i+1}. {blockLabels[b.type]}</strong><div><button aria-label={`Đưa mục ${i+1} lên`} disabled={busy||i===0} onClick={()=>{change();setBlocks(move(blocks,i,-1));}}>↑</button><button aria-label={`Đưa mục ${i+1} xuống`} disabled={busy||i===blocks.length-1} onClick={()=>{change();setBlocks(move(blocks,i,1));}}>↓</button><button aria-label={`Gỡ mục ${i+1}`} className="post-danger" onClick={()=>{change();setBlocks(blocks.filter((_,j)=>i!==j));}}>Gỡ</button></div></div>
          {b.type==='image'?<><PhotoPreview asset={assets[b.asset_id]} alt={b.caption||'Ảnh trong bài'}/><input className="admin-control" aria-label={`Chú thích ảnh mục ${i+1}`} placeholder="Chú thích ảnh (không bắt buộc)" value={b.caption??''} onChange={e=>updateBlock(i,{...b,caption:e.target.value})}/></>:<textarea className="admin-control" aria-label={`${blockLabels[b.type]} ${i+1}`} rows={b.type==='heading'?2:6} placeholder={b.type==='heading'?'Tiêu đề cho phần nội dung tiếp theo':b.type==='list'?'Mỗi dòng là một mục trong danh sách':'Viết nội dung tại đây…'} value={b.type==='list'?b.items.join('\n'):b.text} onChange={e=>updateBlock(i,b.type==='list'?{...b,items:e.target.value.split('\n')}:{...b,text:e.target.value})}/>}</div>)}
          <div className="post-add-controls">{(['paragraph','heading','list'] as const).map(type=><button className="admin-secondary" key={type} onClick={()=>{change();setBlocks([...blocks,type==='list'?{type,items:[]}:{type,text:''}]);}}>+ {blockLabels[type]}</button>)}{uploader('content','+ Upload ảnh vào nội dung')}</div>
        </section>
        <section className="admin-panel post-album"><h2>Bộ ảnh cuối bài</h2><p>Không bắt buộc. Upload thêm ảnh nếu muốn lưu lại những khoảnh khắc cuối bài.</p>{uploader('album','Upload bộ ảnh cuối bài')}<div className="post-album-grid">{album.map((a,i)=><figure key={a.asset_id+'-'+i}><PhotoPreview asset={assets[a.asset_id]} alt={a.caption||`Ảnh ${i+1}`}/><input className="admin-control" aria-label={`Chú thích ảnh cuối bài ${i+1}`} placeholder="Chú thích ảnh" value={a.caption??''} onChange={e=>{change();setAlbum(album.map((old,j)=>j===i?{...old,caption:e.target.value}:old));}}/><div className="post-block-heading"><button aria-label={`Đưa ảnh cuối bài ${i+1} lên`} disabled={busy||i===0} onClick={()=>{change();setAlbum(move(album,i,-1));}}>↑</button><button aria-label={`Đưa ảnh cuối bài ${i+1} xuống`} disabled={busy||i===album.length-1} onClick={()=>{change();setAlbum(move(album,i,1));}}>↓</button><button className="post-danger" onClick={()=>{change();setAlbum(album.filter((_,j)=>j!==i));}}>Gỡ ảnh</button></div></figure>)}</div></section>
      </div>
      <aside className="post-editor-side"><section className="admin-panel post-fields"><h2>Thông tin bài</h2><label htmlFor="post-category">Danh mục <span>*</span></label><select id="post-category" className="admin-control" value={category} onChange={e=>{change();setCategory(e.target.value);}}><option value="">Chọn danh mục</option>{categories.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select>{!categories.length&&<p>Chưa có danh mục. <Link href="/admin?section=categories" onClick={leave}>Tạo danh mục trước ↗</Link></p>}<h2>Ảnh bìa</h2><p>Ảnh đại diện của bài trên trang tin tức.</p><PhotoPreview asset={cover?assets[cover]:null} alt="Ảnh bìa"/>{uploader('cover',cover?'Upload ảnh bìa khác':'Upload ảnh bìa')}{cover&&<button className="admin-text-button post-danger" onClick={()=>{change();setCover(null);}}>Gỡ ảnh bìa</button>}<small>JPEG, PNG, WebP · tự động nén và tạo thumbnail. Khi mở xem, dùng ảnh đầy đủ độ phân giải.</small></section>
      <section id="post-save" className="admin-panel post-save-panel"><h2>Lưu & đăng bài</h2><p>{dirty?'Có thay đổi chưa lưu.':saved?'Các thay đổi đã được lưu.':'Bài mới chưa được lưu.'}</p><button className="admin-secondary" onClick={()=>void save('draft')}>{busy?'Đang xử lý…':saved?.status==='published'?'Chuyển về bản nháp':'Lưu bản nháp'}</button><button className="admin-primary" onClick={()=>void save('published')}>{busy?'Đang xử lý…':saved?.status==='published'?'Cập nhật bài đã đăng':'Đăng bài'}</button><small>Bản nháp chỉ quản trị viên thấy. Đăng bài sẽ hiển thị trên website.</small>{saved?.status==='published'&&<Link href={`/posts/${saved.slug}`} target="_blank" className="admin-text-button">Mở bài công khai ↗</Link>}</section></aside>
    </fieldset>
    <dialog ref={dialog} className="post-preview-dialog" onClose={()=>setPreview(false)} onClick={e=>{if(e.target===e.currentTarget)dialog.current?.close();}}><header><strong>Xem trước · chưa đăng công khai</strong><button className="admin-secondary" onClick={()=>dialog.current?.close()}>Đóng ×</button></header>{preview&&<article><span>{categories.find(c=>c.id===category)?.name}</span><h1>{title||'Tiêu đề bài viết'}</h1><p>{excerpt}</p><PhotoPreview asset={cover?assets[cover]:null} alt="Ảnh bìa"/>{blocks.map((b,i)=>b.type==='paragraph'?<p key={i}>{b.text}</p>:b.type==='heading'?<h2 key={i}>{b.text}</h2>:b.type==='list'?<ul key={i}>{b.items.map((s,j)=><li key={j}>{s}</li>)}</ul>:<figure key={i}><PhotoPreview asset={assets[b.asset_id]} alt={b.caption||'Ảnh nội dung'}/><figcaption>{b.caption}</figcaption></figure>)}{album.length>0&&<><h2>Album ảnh</h2>{album.map((a,i)=><figure key={i}><PhotoPreview asset={assets[a.asset_id]} alt={a.caption||'Ảnh cuối bài'}/><figcaption>{a.caption}</figcaption></figure>)}</>}</article>}</dialog>
  </section>;
}
