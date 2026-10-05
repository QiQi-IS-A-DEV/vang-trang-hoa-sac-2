"use client";
import { useEffect, useRef, useState } from "react";
import { DeleteDialog } from './delete-dialog';
import Image from "next/image";
import { compareProgramCards, departmentPriority, programRoleLabels, type ProgramRole } from '@/lib/team-card-order';
type Department = { id: string; name: string; visible: boolean };
type Card = { id: string; role: ProgramRole; department_id: string | null; visible: boolean; sort_order: number; person: { name: string; asset: { id: string; url: string; filename: string } }; department: { name: string; sort_order: number } | null };
type SelectedFile = {file:File;role:ProgramRole};
async function api(url: string, init?: RequestInit) {
  let response = await fetch(url, init);
  if (response.status === 401) {
    const refresh = await fetch("/api/admin/auth", { method: "PATCH" });
    if (refresh.ok) response = await fetch(url, init);
  }
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Không thể lưu thẻ.");
  return data;
}
async function all(resource: string) {
  const items = [];
  let offset: number | null = 0;
  while (offset !== null) {
    const data = await api(`/api/admin/${resource}?limit=100&offset=${offset}`);
    items.push(...data.items); offset = data.next_offset;
  }
  return items;
}
const control = "admin-control";
export function VolunteerCardManager({onBusyChange,onManageDepartments}: {onBusyChange?: (busy: boolean) => void;onManageDepartments?: () => void}) {
  const [deleteTarget,setDeleteTarget]=useState<Card|null>(null);
  const [cards, setCards] = useState<Card[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [department, setDepartment] = useState("");
  const [files, setFiles] = useState<SelectedFile[]>([]);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");
  const [progress, setProgress] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);
  const [filter,setFilter] = useState('all');
  useEffect(()=>{onBusyChange?.(busy);return()=>{onBusyChange?.(false);};},[busy,onBusyChange]);
  async function reload() {
    const [nextCards, nextDepartments] = await Promise.all([all("cards"), all("departments")]);
    setCards(nextCards); setDepartments(nextDepartments);
  }
  useEffect(() => {
    let active = true;
    Promise.all([all("cards"), all("departments")]).then(([c,d]) => { if(active){setCards(c);setDepartments(d);} }).catch(e => { if(active)setNotice(e.message); }).finally(() => {if(active)setLoading(false);});
    return () => { active = false; };
  }, []);
  async function upload(e: React.FormEvent) {
    e.preventDefault();
    if (!department || !files.length || busy) return;
    setBusy(true); setNotice("");
    const failed: SelectedFile[] = [];
    const messages: string[] = [];
    const chosenDepartment = department;
    let uploaded = 0;
    let order = Math.max(-1, ...cards.map(c => c.sort_order)) + 1;
    for (const [index, selected] of files.entries()) {
      const {file,role} = selected;
      setProgress(`Đang tải ${index + 1}/${files.length}: ${file.name}`);
      let assetId: string | undefined;
      try {
        if (!["image/jpeg","image/png","image/webp"].includes(file.type) || file.size > 10485760 || !file.size) throw new Error("Chọn JPEG, PNG hoặc WebP, tối đa 10 MB mỗi ảnh.");
        const form = new FormData(); form.set("file", file);
        const result = await api("/api/admin/upload", { method: "POST", body: form });
        assetId = result.asset.id;
        await api("/api/admin/cards", { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify({asset_id:assetId,department_id:chosenDepartment,role,sort_order:order++}) });
        uploaded++;
      } catch (error) {
        failed.push(selected); messages.push(`${file.name}: ${(error as Error).message}`);
        if (assetId) {
          try { await api(`/api/admin/assets?id=${assetId}`, {method:"DELETE"}); }
          catch { messages.push("Ảnh chưa liên kết vẫn còn trong Thư viện ảnh; hãy kiểm tra trước khi tải lại."); }
        }
      }
    }
    setFiles(failed);
    if (!failed.length && fileInput.current) fileInput.current.value = "";
    setProgress("");
    setNotice(`Đã tải ${uploaded} thẻ.${messages.length ? " " + messages.join(" ") : " Thẻ đã được xếp vào ban đã chọn."}`);
    try { await reload(); } catch { setNotice(n => n + " Không tải lại được danh sách. Hãy bấm tải lại."); }
    setBusy(false);
  }
  async function update(card: Card, patch: {department_id?: string;visible?: boolean;sort_order?: number;role?: ProgramRole}) {
    setBusy(true); setNotice("");
    try {
      await api(`/api/admin/cards?id=${card.id}`, {method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify(patch)});
      await reload(); setNotice("Đã cập nhật thẻ.");
    } catch(e) { setNotice((e as Error).message); } finally { setBusy(false); }
  }
  const orderedDepartments = [...departments].sort((a,b)=>departmentPriority(a.name)-departmentPriority(b.name));
  const orderedCards = [...cards].sort((a,b)=>compareProgramCards({id:a.id,department:a.department?.name??'',departmentSortOrder:a.department?.sort_order,role:a.role,sortOrder:a.sort_order},{id:b.id,department:b.department?.name??'',departmentSortOrder:b.department?.sort_order,role:b.role,sortOrder:b.sort_order}));
  function fileRole(index:number,role:ProgramRole){setFiles(old=>old.map((item,i)=>i===index?{...item,role}:item));}
  return <section className="admin-card-manager space-y-6">
    <div className="cms-section-title"><h2>Tình nguyện viên chương trình</h2><span>{loading ? "Đang tải…" : `${cards.length} thẻ · dự kiến 57`}</span></div>
    <p>Chọn ban rồi tải ảnh thẻ. Mọi thông tin đã nằm trong ảnh, không cần nhập lại. Ảnh giữ nguyên chất lượng gốc.</p>
    <form onSubmit={upload} className="admin-card-upload space-y-4">
      <h3>Tải bộ thẻ lên</h3>
      <label className="block">Ban nhận thẻ<select className={control} required disabled={busy || loading} value={department} onChange={e=>setDepartment(e.target.value)}><option value="">Chọn ban</option>{orderedDepartments.map(d=><option key={d.id} value={d.id}>{d.name}{d.visible ? "" : " (đang ẩn)"}</option>)}</select></label>
      <p className="text-sm">Chưa có ban phù hợp? <button type="button" className="admin-text-button" disabled={busy} onClick={onManageDepartments}>Quản lý các ban ↗</button></p>
      <label className="block">Ảnh thẻ (chọn nhiều ảnh cùng ban)<input ref={fileInput} className={control} type="file" multiple accept="image/jpeg,image/png,image/webp" disabled={busy || loading} onChange={e=>setFiles(Array.from(e.target.files ?? []).map(file=>({file,role:'volunteer'})))}/></label>
      {files.length>0&&<div className="admin-upload-roles"><p>Đánh dấu từng ảnh nếu là trưởng hoặc phó BTC / ban. Không đánh dấu thì là thành viên.</p>{files.map(({file,role},index)=><fieldset key={index} disabled={busy}><legend>{file.name}</legend><label><input type="checkbox" checked={role==='lead'} onChange={e=>fileRole(index,e.target.checked?'lead':'volunteer')}/>Trưởng BTC / ban</label><label><input type="checkbox" checked={role==='deputy'} onChange={e=>fileRole(index,e.target.checked?'deputy':'volunteer')}/>Phó BTC / ban</label></fieldset>)}</div>}
      {files.length > 0 && <p>{files.length} ảnh sẵn sàng tải lên</p>}
      <button className="festival-button rounded-lg p-3 text-purple-950" disabled={busy || loading || !department || !files.length}>{busy ? "Đang tải…" : `Upload ${files.length || ""} thẻ`}</button>
    </form>
    {(progress||notice)&&<p role="status" className="admin-notice whitespace-pre-wrap">{progress || notice}</p>}
    <div className="admin-resource-toolbar">
      <label>Lọc theo ban<select className={control} value={filter} onChange={e=>setFilter(e.target.value)}><option value="all">Tất cả các ban</option>{departments.map(d=><option key={d.id} value={d.id}>{d.name}</option>)}</select></label>
      <button className="admin-secondary ml-auto" disabled={busy} onClick={async()=>{setLoading(true);try{await reload();setNotice("");}catch(e){setNotice((e as Error).message);}finally{setLoading(false);}}}>Tải lại danh sách</button>
      <span>{cards.filter(c=>filter==='all'||c.department_id===filter).length} thẻ</span>
    </div>
    {!loading && !cards.length && <p className="admin-empty">Chưa có ảnh thẻ. Chọn ban và tải bộ ảnh đầu tiên lên.</p>}
    {!loading && cards.length > 0 && !cards.some(c=>filter==='all'||c.department_id===filter) && <p className="admin-empty">Ban này chưa có ảnh thẻ. Chọn ban khác để xem, hoặc tải bộ thẻ của ban lên.</p>}
    <p className="text-sm">Thứ tự công khai: Ban tổ chức → Ban cố vấn → các ban khác. Trong mỗi ban: trưởng → phó → thành viên.</p>
    <div className="admin-card-library grid gap-6 md:grid-cols-2">{orderedCards.filter(c=>filter==='all'||c.department_id===filter).map(card=><article key={card.id} className="space-y-4 rounded-2xl border border-amber-400/20 bg-[#1c082c]/80 p-5 shadow-xl backdrop-blur-md transition-all hover:border-amber-400/40">
      <Image src={card.person.asset.url} alt={card.person.asset.filename} unoptimized width={1063} height={650} className="h-auto w-full object-contain" />
      <p className="break-all text-sm">{card.person.asset.filename}</p>
      <span className="admin-badge">{programRoleLabels[card.role]??'Thành viên'}</span>
      <label className="block">Ban<select className={control} disabled={busy} value={card.department_id || ""} onChange={e=>void update(card,{department_id:e.target.value})}><option value="" disabled>Chọn ban</option>{departments.map(d=><option key={d.id} value={d.id}>{d.name}</option>)}</select></label>
      <div className="admin-card-role-options"><label><input type="checkbox" checked={card.role==='lead'} disabled={busy} onChange={e=>void update(card,{role:e.target.checked?'lead':'volunteer'})}/>Trưởng BTC / ban</label><label><input type="checkbox" checked={card.role==='deputy'} disabled={busy} onChange={e=>void update(card,{role:e.target.checked?'deputy':'volunteer'})}/>Phó BTC / ban</label></div>
      <label className="block">Thứ tự<input key={card.id+"-"+card.sort_order} className={control} type="number" min={0} max={100000} defaultValue={card.sort_order} disabled={busy} onBlur={e=>{const value=Number(e.target.value);if(Number.isInteger(value)&&value>=0&&value<=100000&&value!==card.sort_order)void update(card,{sort_order:value});}} /></label>
      <label className="flex min-h-11 items-center gap-3"><input type="checkbox" checked={card.visible} disabled={busy} onChange={e=>void update(card,{visible:e.target.checked})} />Hiện thẻ trên trang chủ</label>
      <button className="admin-action-btn is-delete" disabled={busy||loading} onClick={()=>setDeleteTarget(card)}>Xóa thẻ</button>
    </article>)}</div>
    {deleteTarget&&<DeleteDialog title="Xóa thẻ tình nguyện viên?" description={`Thẻ “${deleteTarget.person.asset.filename}” sẽ được gỡ khỏi chương trình. Ảnh vẫn được giữ trong Thư viện ảnh.`} onClose={()=>setDeleteTarget(null)} onDelete={async()=>{
      setBusy(true);
      try{await api(`/api/admin/cards?id=${deleteTarget.id}`,{method:'DELETE'});setCards(old=>old.filter(c=>c.id!==deleteTarget.id));setNotice('Đã xóa thẻ khỏi chương trình.');}finally{setBusy(false);}
    }}/>}
  </section>;
}
