"use client";
import { useEffect, useState } from "react";
import { IconTalisman, IconStylus, IconAperture, IconStreamUpload, IconDashboard } from "./admin-icons";
type Row = Record<string, unknown>;
export function AdminOverview({ load, navigate }: {load: (resource: string) => Promise<Row[]>; navigate: (key: string, create?: boolean) => void}) {
  const [data,setData] = useState<Record<string,Row[]>>({});
  const [loading,setLoading] = useState(true);
  const [error,setError] = useState("");
  const [retry,setRetry] = useState(0);
  useEffect(()=>{
    let active=true;
    Promise.all(["cards","posts","assets","departments"].map(load)).then(results=>{
      if(active){setData(Object.fromEntries(["cards","posts","assets","departments"].map((key,i)=>[key,results[i]])));setError("");}
    }).catch(e=>{if(active)setError(e.message);}).finally(()=>{if(active)setLoading(false);});
    return()=>{active=false;};
  },[load,retry]);
  const cards = [...new Map((data.cards ?? []).map(c=>[(c.person as {asset:{id:string}}).asset.id,c])).values()];
  const published=(data.posts??[]).filter(p=>p.status==="published").length;
  const recent=[...(data.posts??[])].sort((a,b)=>String(b.updated_at??b.created_at).localeCompare(String(a.updated_at??a.created_at))).slice(0,5);
  return <section className="admin-overview">
    <div className="admin-page-heading"><div><span className="admin-kicker">Không gian quản trị</span><h1>Tổng quan</h1><p>Một nơi để chăm chút bộ thẻ, những câu chuyện và mùa trăng của chúng mình.</p></div><button className="admin-primary" onClick={()=>navigate("posts",true)}><IconStylus size={18}/>Viết bài mới</button></div>
    {error && <div className="admin-notice" role="alert">{error}<button onClick={()=>{setLoading(true);setRetry(n=>n+1);}}>Thử lại</button></div>}
    <div className="admin-metrics">
      {[
        { label: "Thẻ tình nguyện viên", value: cards.length, detail: "Dự kiến 57 thẻ trong bộ ảnh", badge: `${Math.round(cards.length / 57 * 100)}%`, key: "cards", Icon: IconTalisman },
        { label: "Bài viết đã đăng", value: published, detail: `${(data.posts ?? []).filter(p => p.status === "draft").length} bài đang ở bản nháp`, badge: `${published}/${(data.posts ?? []).length} bài`, key: "posts", Icon: IconStylus },
        { label: "Thư viện ảnh", value: data.assets?.length ?? 0, detail: "Lưu trữ file ảnh nguyên bản", badge: "Media CDN", key: "assets", Icon: IconAperture },
      ].map(({ label, value, detail, badge, key, Icon }) => (
        <button key={key} className="admin-metric group" onClick={() => navigate(key)}>
          <div>
            <span>{label}</span>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-300 border border-amber-400/20">{badge}</span>
              <Icon size={22} />
            </div>
          </div>
          <strong>{loading || error ? "—" : value}</strong>
          <small>{loading ? "Đang tải dữ liệu…" : error ? "Chưa tải được dữ liệu" : detail}</small>
        </button>
      ))}
    </div>
    <div className="admin-overview-columns">
      <section className="admin-panel"><div className="admin-panel-heading"><div><span className="admin-kicker">Nội dung</span><h2>Bài viết gần đây</h2></div><button className="admin-text-button" onClick={()=>navigate("posts")}>Xem tất cả ↗</button></div>
        {loading?<p className="admin-empty">Đang tải bài viết…</p>:recent.length?recent.map(p=><div key={String(p.id)} className="admin-post-row"><span className="admin-row-icon"><IconStylus size={20}/></span><div><strong>{String(p.title)}</strong><small>{p.updated_at || p.created_at ? new Date(String(p.updated_at??p.created_at)).toLocaleDateString("vi-VN",{timeZone:"Asia/Ho_Chi_Minh"}) : "Chưa có ngày cập nhật"}</small></div><span className={`admin-badge ${p.status==="published"?"is-published":""}`}>{p.status==="published"?"Đã đăng":"Bản nháp"}</span></div>):<div className="admin-empty"><IconStylus size={32}/><h3>Câu chuyện đầu tiên đang chờ bạn</h3><p>Viết một bài, thêm ảnh và lưu nháp trước khi đăng.</p><button className="admin-secondary" onClick={()=>navigate("posts",true)}>Tạo bài viết</button></div>}
      </section>
      <section className="admin-panel admin-card-progress"><div className="admin-panel-heading"><div><span className="admin-kicker">Bộ ảnh mùa trăng</span><h2>Hoàn thiện 57 thẻ</h2></div><IconStreamUpload size={24}/></div><p>Chọn ban, tải ảnh và kiểm tra thẻ. Toàn bộ thông tin được giữ trong ảnh gốc.</p><div className="admin-progress-caption"><strong>{loading || error?"—":cards.length} <span>/ 57 thẻ</span></strong><span>{loading || error?"":Math.round(cards.length/57*100)+"%"}</span></div><progress value={loading||error?0:cards.length} max={57} aria-label="Số thẻ đã tải lên trên tổng số 57" />
        <div className="admin-department-summary">{loading?<p>Đang tải các ban…</p>:(data.departments??[]).filter(d=>cards.some(c=>c.department_id===d.id)).map(d=><div key={String(d.id)}><span>{String(d.name)}</span><strong>{cards.filter(c=>c.department_id===d.id).length}</strong></div>)}</div><button className="admin-primary" onClick={()=>navigate("cards")}><IconStreamUpload size={18}/>Quản lý thẻ</button>
      </section>
    </div>
    <section className="admin-panel admin-quick-links"><div><IconDashboard size={24}/><h2>Chăm chút trang công khai</h2><p>Cập nhật lời giới thiệu, các khu vực nội dung và hình ảnh chương trình.</p></div><button className="admin-secondary" onClick={()=>navigate("landing-sections")}>Quản lý trang chủ ↗</button><button className="admin-secondary" onClick={()=>navigate("settings")}>Logo & ảnh nền ↗</button></section>
  </section>;
}
