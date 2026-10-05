"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  IconGlobe,
  IconCalibrationSync,
  IconEye,
  IconEyeOff,
  IconParchment,
  IconCompassStar,
  IconPlusNode,
  IconVaultTrash,
  IconDismiss,
} from "./admin-icons";

export interface LandingSectionRow {
  id: string;
  key: "hero" | "advisors" | "organizers" | "departments" | "volunteers" | "recap" | "footer";
  title: string;
  description: string;
  enabled: boolean;
  sort_order: number;
  asset_id: string | null;
  content: {
    stats?: Array<{ label: string; value: string; subtext?: string; icon?: string }>;
    journey?: Array<{ phase: string; title: string; date?: string; description: string; highlight?: string }>;
  } | null;
  updated_at?: string;
}

interface SectionMeta {
  name: string;
  badge: string;
  badgeType: "main" | "slideshow";
  location: string;
  description: string;
  icon: string;
}

const SECTION_METAS: Record<string, SectionMeta> = {
  hero: {
    name: "Phần mở đầu (Hero Banner)",
    badge: "Khối chính trên trang",
    badgeType: "main",
    location: "Đỉnh trang chủ",
    description: "Màn hình chào đón đầu tiên với tiêu đề 3D 'Vầng Trăng Hòa Sắc 2', logo, câu slogan và thanh điều hướng chính.",
    icon: "🌟",
  },
  advisors: {
    name: "Poster: Ban Cố Vấn",
    badge: "Slide trong Slideshow Đội ngũ",
    badgeType: "slideshow",
    location: "Slideshow Đội ngũ",
    description: "Slide poster giới thiệu Thầy/Cô và các anh chị trong Ban Cố Vấn của chiến dịch.",
    icon: "🎓",
  },
  organizers: {
    name: "Poster: Ban Tổ Chức",
    badge: "Slide trong Slideshow Đội ngũ",
    badgeType: "slideshow",
    location: "Slideshow Đội ngũ",
    description: "Slide poster chân dung Trưởng ban và các Phó ban tổ chức chiến dịch.",
    icon: "👑",
  },
  departments: {
    name: "Poster: Các Ban Chuyên Môn",
    badge: "Slide trong Slideshow Đội ngũ",
    badgeType: "slideshow",
    location: "Slideshow Đội ngũ",
    description: "Các slide poster của 4 ban: Nội dung – Truyền thông, Văn nghệ, Trang trí – Sự kiện, Hậu cần.",
    icon: "🏢",
  },
  volunteers: {
    name: "Thẻ tình nguyện viên",
    badge: "Khối chính trên trang",
    badgeType: "main",
    location: "Thân trang chủ",
    description: "Bộ sưu tập ảnh thẻ của từng chiến sĩ tình nguyện, có bộ lọc theo từng ban và hiệu ứng ánh sáng lấp lánh.",
    icon: "🪪",
  },
  recap: {
    name: "Dấu ấn mùa trăng (Hành trình & Số liệu)",
    badge: "Khối chính trên trang",
    badgeType: "main",
    location: "Thân trang chủ",
    description: "Khu vực gồm 4 thẻ số liệu kết quả nổi bật, dòng thời gian 'Nhìn lại hành trình' và thư viện tin tức.",
    icon: "🌕",
  },
  footer: {
    name: "Chân trang (Footer)",
    badge: "Khối chính trên trang",
    badgeType: "main",
    location: "Đáy trang chủ",
    description: "Đoạn văn cảm ơn, nút dẫn lên Cây Kỷ Niệm, thông tin bản quyền OU Help To Be Helped Club và liên kết điều hướng.",
    icon: "🏮",
  },
};

const DEFAULT_STATS = [
  { label: "Phần quà Trung Thu", value: "350+", subtext: "", icon: "" },
  { label: "Học bổng vượt khó", value: "20+", subtext: "", icon: "" },
  { label: "Chiến sĩ tình nguyện", value: "60+", subtext: "", icon: "" },
  { label: "Lồng đèn thắp sáng", value: "500+", subtext: "", icon: "" },
];

const DEFAULT_JOURNEY = [
  {
    phase: "Góp sức",
    title: "Gieo những điều thương",
    date: "",
    highlight: "Mỗi đóng góp đều là một phần của hành trình.",
    description:
      "Những buổi bán bánh gây quỹ, chuẩn bị nguyên vật liệu và cùng làm lồng đèn là cách mùa trăng bắt đầu — từ những việc nhỏ, bằng sự chung tay.",
  },
  {
    phase: "Chuẩn bị",
    title: "Gói ghém một mùa trăng",
    date: "",
    highlight: "Phía sau đêm hội là tâm sức của cả tập thể.",
    description:
      "Từng phần quà được phân loại, từng chiếc bánh được đóng gói. Hậu cần, sân khấu và nội dung cùng được chuẩn bị để đêm hội đến với các em thật trọn vẹn.",
  },
  {
    phase: "Sẻ chia",
    title: "Mang niềm vui đến gần",
    date: "",
    highlight: "Một mùa trăng đi qua, những điều thương ở lại.",
    description:
      "Trò chơi dân gian, rước đèn và phá cỗ nối mọi người lại trong không khí Trung Thu. Điều ở lại sau hành trình là những nụ cười và kỷ niệm cùng nhau.",
  },
];

async function api(url: string, init?: RequestInit) {
  let response = await fetch(url, init);
  if (response.status === 401) {
    const refresh = await fetch("/api/admin/auth", { method: "PATCH" });
    if (refresh.ok) response = await fetch(url, init);
  }
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Có lỗi xảy ra khi gọi API.");
  return data;
}

export function LandingSectionsManager({
  onBusyChange,
  onNavigateTab,
}: {
  onBusyChange?: (busy: boolean) => void;
  onNavigateTab?: (key: string) => void;
}) {
  const [sections, setSections] = useState<LandingSectionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string>("");
  const [editing, setEditing] = useState<LandingSectionRow | null>(null);

  // State cho form chỉnh sửa
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formStats, setFormStats] = useState(DEFAULT_STATS);
  const [formJourney, setFormJourney] = useState(DEFAULT_JOURNEY);
  const [activeTab, setActiveTab] = useState<"general" | "stats" | "journey">("general");

  useEffect(() => {
    onBusyChange?.(busy);
    return () => onBusyChange?.(false);
  }, [busy, onBusyChange]);

  useEffect(() => {
    let active = true;
    api("/api/admin/landing-sections?limit=100&offset=0")
      .then((res) => {
        if (!active) return;
        const items: LandingSectionRow[] = res.items || [];
        items.sort((a, b) => a.sort_order - b.sort_order);
        setSections(items);
      })
      .catch((err) => {
        if (active) setNotice((err as Error).message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const res = await api("/api/admin/landing-sections?limit=100&offset=0");
      const items: LandingSectionRow[] = res.items || [];
      items.sort((a, b) => a.sort_order - b.sort_order);
      setSections(items);
    } catch (err) {
      setNotice((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  // Chuyển thứ tự Lên / Xuống
  async function moveOrder(index: number, direction: -1 | 1) {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= sections.length || busy) return;

    setBusy(true);
    setNotice("");

    const current = sections[index];
    const target = sections[targetIndex];

    const currentOrder = current.sort_order;
    const targetOrder = target.sort_order;

    // Đổi vị trí trong state local ngay để UI phản hồi mượt
    const updated = [...sections];
    updated[index] = { ...target, sort_order: currentOrder };
    updated[targetIndex] = { ...current, sort_order: targetOrder };
    setSections(updated);

    try {
      await Promise.all([
        api(`/api/admin/landing-sections?id=${current.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sort_order: targetOrder }),
        }),
        api(`/api/admin/landing-sections?id=${target.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sort_order: currentOrder }),
        }),
      ]);
      setNotice(`Đã chuyển khu vực "${SECTION_METAS[current.key]?.name || current.key}" đến vị trí mới.`);
    } catch (err) {
      setNotice("Không thể lưu thứ tự: " + (err as Error).message);
      await loadData();
    } finally {
      setBusy(false);
    }
  }

  // Bật / Tắt trạng thái hiển thị
  async function toggleEnabled(section: LandingSectionRow) {
    if (busy) return;
    setBusy(true);
    setNotice("");

    const nextState = !section.enabled;
    const updated = sections.map((s) => (s.id === section.id ? { ...s, enabled: nextState } : s));
    setSections(updated);

    try {
      await api(`/api/admin/landing-sections?id=${section.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: nextState }),
      });
      setNotice(
        nextState
          ? `Đã bật hiển thị khu vực "${SECTION_METAS[section.key]?.name || section.key}".`
          : `Đã tạm ẩn khu vực "${SECTION_METAS[section.key]?.name || section.key}".`
      );
    } catch (err) {
      setNotice("Không thể thay đổi trạng thái: " + (err as Error).message);
      await loadData();
    } finally {
      setBusy(false);
    }
  }

  // Mở form chỉnh sửa chi tiết
  function openEdit(section: LandingSectionRow) {
    setEditing(section);
    setFormTitle(section.title || "");
    setFormDescription(section.description || "");

    const content = section.content || {};
    const stats = (content.stats && content.stats.length > 0 ? content.stats : DEFAULT_STATS).map((s) => ({
      label: s.label || "",
      value: s.value || "",
      subtext: s.subtext || "",
      icon: s.icon || "",
    }));
    setFormStats(stats);

    const journey = (content.journey && content.journey.length > 0 ? content.journey : DEFAULT_JOURNEY).map((j) => ({
      phase: j.phase || "",
      title: j.title || "",
      date: j.date || "",
      highlight: j.highlight || "",
      description: j.description || "",
    }));
    setFormJourney(journey);

    setActiveTab(section.key === "recap" ? "stats" : "general");
  }

  // Lưu chỉnh sửa
  async function saveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editing || busy) return;

    setBusy(true);
    setNotice("");

    try {
      const payload: Record<string, unknown> = {
        title: formTitle.trim(),
        description: formDescription.trim(),
      };

      if (editing.key === "recap") {
        payload.content = {
          stats: formStats.map((s) => ({
            label: s.label.trim() || "Chỉ số",
            value: s.value.trim() || "0",
            subtext: s.subtext?.trim() || "",
            icon: s.icon?.trim() || "",
          })),
          journey: formJourney.map((j) => ({
            phase: j.phase.trim() || "Chặng",
            title: j.title.trim() || "Hành trình",
            date: j.date?.trim() || "",
            description: j.description?.trim() || "",
            highlight: j.highlight?.trim() || "",
          })),
        };
      }

      await api(`/api/admin/landing-sections?id=${editing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      setNotice(`Đã lưu thành công khu vực "${SECTION_METAS[editing.key]?.name || editing.key}".`);
      setEditing(null);
      await loadData();
    } catch (err) {
      setNotice("Không thể lưu: " + (err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* HEADER KHU VỰC TRANG CHỦ */}
      <div className="admin-page-heading">
        <div>
          <span className="admin-kicker">Quản lý giao diện</span>
          <h1>Khu vực trang chủ</h1>
          <p>
            Trực quan hóa cấu trúc trang chủ: Sắp xếp thứ tự xuất hiện, bật/tắt hiển thị từng khối và chỉnh sửa chi tiết số liệu, hành trình.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Link
            href="/"
            target="_blank"
            className="admin-secondary inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl"
            title="Mở trang chủ công khai trong tab mới"
          >
            <IconGlobe size={16} />
            <span>Xem trang chủ ↗</span>
          </Link>
          <button
            type="button"
            onClick={loadData}
            disabled={loading || busy}
            className="admin-secondary inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl"
            title="Làm mới danh sách"
          >
            <IconCalibrationSync size={16} />
            <span>Làm mới</span>
          </button>
        </div>
      </div>

      {notice && (
        <div
          role="status"
          className="p-3.5 rounded-xl border border-amber-400/30 bg-amber-500/10 text-amber-200 text-sm flex items-center justify-between"
        >
          <span>{notice}</span>
          <button type="button" onClick={() => setNotice("")} className="text-amber-400 hover:underline text-xs">
            Đóng
          </button>
        </div>
      )}

      {/* HỘP HƯỚNG DẪN TRỰC QUAN */}
      <div className="rounded-2xl border border-amber-400/20 bg-gradient-to-r from-purple-950/60 via-[#26083b]/60 to-purple-950/60 p-4 text-xs text-purple-200/90 leading-relaxed space-y-1.5 shadow-md">
        <div className="flex items-center gap-2 font-bold text-amber-300">
          <IconCompassStar size={16} />
          <span>Cách các khu vực hoạt động trên trang chủ:</span>
        </div>
        <p>
          • <strong>Khối chính trên trang:</strong> Xuất hiện lần lượt từ trên xuống dưới theo thứ tự đã sắp xếp (Phần mở đầu → Thẻ tình nguyện viên → Dấu ấn mùa trăng → Chân trang).
        </p>
        <p>
          • <strong>Poster trong Slideshow:</strong> Ba mục Ban Cố Vấn, Ban Tổ Chức và Các Ban được gom tự động vào <strong>Khung trình chiếu tranh (Slideshow)</strong> ở đầu trang. Bạn có thể bật/tắt từng poster nếu không muốn hiển thị.
        </p>
      </div>

      {/* DANH SÁCH CÁC KHU VỰC TRỰC QUAN */}
      {loading ? (
        <div className="py-20 text-center font-mono text-sm text-purple-300/60">
          Đang tải danh sách các khu vực trang chủ…
        </div>
      ) : sections.length === 0 ? (
        <div className="admin-empty">
          <IconParchment size={32} />
          <h2>Chưa tìm thấy dữ liệu khu vực</h2>
          <p>Nhấn làm mới để tải lại dữ liệu từ hệ thống.</p>
          <button className="admin-secondary" onClick={loadData}>
            Tải lại danh sách
          </button>
        </div>
      ) : (
        <div className="space-y-3.5">
          {sections.map((section, index) => {
            const meta = SECTION_METAS[section.key] || {
              name: section.title || section.key,
              badge: "Khu vực trang",
              badgeType: "main",
              location: "Trang chủ",
              description: section.description || "Khu vực nội dung",
              icon: "📄",
            };

            const isRecap = section.key === "recap";
            const isVolunteers = section.key === "volunteers";

            return (
              <article
                key={section.id}
                className={`group relative rounded-2xl border transition-all duration-200 p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  section.enabled
                    ? "border-amber-400/25 bg-[#1a082a]/85 hover:border-amber-400/50 hover:bg-[#220b36]/90 shadow-lg"
                    : "border-white/10 bg-[#12041c]/50 opacity-60 hover:opacity-90"
                }`}
              >
                {/* BÊN TRÁI: THỨ TỰ & THÔNG TIN KHU VỰC */}
                <div className="flex items-start sm:items-center gap-3.5 sm:gap-4 flex-1 min-w-0">
                  {/* Cụm điều chỉnh thứ tự */}
                  <div className="flex flex-col items-center justify-center gap-1 rounded-xl bg-black/40 border border-white/5 p-1.5 flex-shrink-0 min-w-[44px]">
                    <button
                      type="button"
                      disabled={index === 0 || busy}
                      onClick={() => moveOrder(index, -1)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-purple-300 hover:text-amber-300 hover:bg-white/10 disabled:opacity-20 disabled:pointer-events-none transition-colors"
                      title="Di chuyển lên trên"
                    >
                      ▲
                    </button>
                    <span className="text-xs font-bold font-mono text-amber-200" title={`Thứ tự hiện tại: ${index + 1}`}>
                      #{index + 1}
                    </span>
                    <button
                      type="button"
                      disabled={index === sections.length - 1 || busy}
                      onClick={() => moveOrder(index, 1)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-purple-300 hover:text-amber-300 hover:bg-white/10 disabled:opacity-20 disabled:pointer-events-none transition-colors"
                      title="Di chuyển xuống dưới"
                    >
                      ▼
                    </button>
                  </div>

                  {/* Icon & Tên hiển thị */}
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-2xl" role="img" aria-label={meta.name}>
                        {meta.icon}
                      </span>
                      <h3 className="font-extrabold text-base sm:text-lg text-white tracking-wide">
                        {meta.name}
                      </h3>
                      {/* Badge loại khu vực */}
                      <span
                        className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                          meta.badgeType === "slideshow"
                            ? "bg-fuchsia-950/60 text-fuchsia-300 border-fuchsia-500/30"
                            : "bg-amber-950/60 text-amber-300 border-amber-500/30"
                        }`}
                      >
                        {meta.badge}
                      </span>
                      {/* Trạng thái Bật/Tắt */}
                      {section.enabled ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-950/60 text-emerald-300 border border-emerald-500/30">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          Đang hiển thị
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-zinc-900 text-zinc-400 border border-zinc-700">
                          Tạm ẩn
                        </span>
                      )}
                    </div>

                    <p className="text-xs sm:text-sm text-purple-200/70 line-clamp-2 leading-relaxed">
                      {section.description || meta.description}
                    </p>

                    {/* Ghi chú phụ trợ cho recap và volunteers */}
                    {isRecap && (
                      <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-amber-300/80">
                        <span>✨ Bao gồm: 4 con số thống kê kết quả</span>
                        <span>•</span>
                        <span>Dòng thời gian 3 chặng hành trình</span>
                        <span>•</span>
                        <span>Tin tức mùa trăng</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* BÊN PHẢI: CÔNG TẮC BẬT/TẮT & NÚT SỬA */}
                <div className="flex items-center justify-end gap-3 flex-shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-white/5">
                  {/* Nút bật/tắt nhanh */}
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => toggleEnabled(section)}
                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                      section.enabled
                        ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/50"
                        : "bg-zinc-900 border-zinc-700 text-zinc-400 hover:bg-zinc-800"
                    }`}
                    title={section.enabled ? "Nhấn để tạm ẩn khu vực này trên web" : "Nhấn để bật hiển thị khu vực này trên web"}
                  >
                    {section.enabled ? <IconEye size={15} /> : <IconEyeOff size={15} />}
                    <span>{section.enabled ? "Hiển thị" : "Đang ẩn"}</span>
                  </button>

                  {/* Nút chỉnh sửa chi tiết */}
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => openEdit(section)}
                    className="admin-primary inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl shadow-md"
                  >
                    <span>Sửa nội dung</span>
                    <span>✏️</span>
                  </button>

                  {/* Lối tắt quản lý thẻ tình nguyện viên nếu là khối volunteers */}
                  {isVolunteers && onNavigateTab && (
                    <button
                      type="button"
                      onClick={() => onNavigateTab("cards")}
                      className="admin-secondary text-xs px-2.5 py-1.5 rounded-xl font-semibold text-amber-200"
                      title="Chuyển sang màn hình Tình nguyện viên chương trình"
                    >
                      Quản lý ảnh thẻ ↗
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* MODAL CHỈNH SỬA CHI TIẾT */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-4xl my-8 rounded-3xl border border-amber-400/30 bg-[#190628] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header Modal */}
            <header className="px-6 py-5 border-b border-amber-400/20 bg-gradient-to-r from-purple-950/80 via-[#220738] to-purple-950/80 flex items-center justify-between gap-4 flex-shrink-0">
              <div className="flex items-center gap-3">
                <span className="text-3xl" role="img" aria-hidden="true">
                  {SECTION_METAS[editing.key]?.icon || "📄"}
                </span>
                <div>
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-widest block">
                    {SECTION_METAS[editing.key]?.badge || "Chỉnh sửa khu vực"}
                  </span>
                  <h2 className="text-xl font-extrabold text-white">
                    {SECTION_METAS[editing.key]?.name || editing.key}
                  </h2>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="w-9 h-9 rounded-full flex items-center justify-center text-purple-300 hover:text-white hover:bg-white/10 transition-colors"
                title="Đóng cửa sổ"
              >
                <IconDismiss size={20} />
              </button>
            </header>

            {/* Thanh Tab điều hướng bên trong nếu là Dấu ấn mùa trăng (Recap) */}
            {editing.key === "recap" && (
              <div className="flex items-center gap-2 px-6 pt-4 border-b border-white/10 bg-black/20 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setActiveTab("stats")}
                  className={`px-4 py-2 text-xs font-bold border-b-2 transition-all ${
                    activeTab === "stats"
                      ? "border-amber-400 text-amber-300 bg-amber-400/10 rounded-t-lg"
                      : "border-transparent text-purple-300 hover:text-white"
                  }`}
                >
                  📊 4 Thẻ số liệu kết quả (Ảnh 1)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("journey")}
                  className={`px-4 py-2 text-xs font-bold border-b-2 transition-all ${
                    activeTab === "journey"
                      ? "border-amber-400 text-amber-300 bg-amber-400/10 rounded-t-lg"
                      : "border-transparent text-purple-300 hover:text-white"
                  }`}
                >
                  🚀 Nhìn lại hành trình (Dòng thời gian)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("general")}
                  className={`px-4 py-2 text-xs font-bold border-b-2 transition-all ${
                    activeTab === "general"
                      ? "border-amber-400 text-amber-300 bg-amber-400/10 rounded-t-lg"
                      : "border-transparent text-purple-300 hover:text-white"
                  }`}
                >
                  📝 Tiêu đề & Giới thiệu
                </button>
              </div>
            )}

            {/* Nội dung form chỉnh sửa có cuộn */}
            <form onSubmit={saveEdit} className="p-6 overflow-y-auto space-y-6 flex-1">
              {/* PHẦN 1: TAB THÔNG TIN CHUNG (Hoặc áp dụng cho tất cả khu vực khác) */}
              {(editing.key !== "recap" || activeTab === "general") && (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-amber-200 uppercase tracking-wider">
                      Tiêu đề hiển thị của khu vực
                    </label>
                    <input
                      type="text"
                      className="admin-control w-full"
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      placeholder={
                        editing.key === "recap"
                          ? "Dấu ấn mùa trăng"
                          : editing.key === "volunteers"
                          ? "Thẻ tình nguyện viên"
                          : "Nhập tiêu đề hiển thị…"
                      }
                    />
                    <small className="text-purple-300/70 text-xs block">
                      {editing.key === "recap"
                        ? "Tiêu đề lớn màu vàng ánh kim hiển thị trên trang chủ (vd: 'Dấu ấn mùa trăng')."
                        : "Tiêu đề lớn xuất hiện ở đầu khu vực này trên website."}
                    </small>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-amber-200 uppercase tracking-wider">
                      Đoạn văn giới thiệu / Lời dẫn
                    </label>
                    <textarea
                      rows={3}
                      className="admin-control w-full"
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                      placeholder="Nhập lời dẫn giới thiệu cho khu vực này…"
                    />
                    <small className="text-purple-300/70 text-xs block">
                      Đoạn văn ngắn nằm ngay dưới tiêu đề để giải thích ý nghĩa của khu vực.
                    </small>
                  </div>

                  {editing.key === "hero" && (
                    <div className="rounded-xl border border-amber-400/20 bg-amber-500/10 p-3.5 text-xs text-amber-200 leading-relaxed">
                      💡 <strong>Mẹo:</strong> Khẩu hiệu, tiêu đề phụ và ảnh nền của Phần mở đầu được quản lý tập trung ở mục <strong>Cài đặt nội dung</strong> trong menu bên trái.
                    </div>
                  )}

                  {editing.key === "volunteers" && (
                    <div className="rounded-xl border border-amber-400/20 bg-amber-500/10 p-3.5 text-xs text-amber-200 leading-relaxed">
                      💡 <strong>Mẹo:</strong> Để thêm ảnh thẻ mới, đổi tên hoặc xếp thẻ theo từng ban, bạn có thể chuyển sang mục <strong>Tình nguyện viên chương trình</strong> trong thanh điều hướng bên trái.
                    </div>
                  )}
                </div>
              )}

              {/* PHẦN 2: CHỈNH SỬA 4 CON SỐ THỐNG KÊ (RECAP STATS - Ảnh 1) */}
              {editing.key === "recap" && activeTab === "stats" && (
                <div className="space-y-5">
                  <div className="rounded-xl border border-amber-400/20 bg-amber-400/5 p-4 text-xs text-amber-200 leading-relaxed">
                    🌟 <strong>4 Thẻ số liệu kết quả hành trình (như trong Ảnh 1 bạn gửi):</strong>
                    <br />
                    Mỗi ô hiển thị con số lớn màu vàng ở trên và tên số liệu ở dưới. Thay đổi số liệu dưới đây sẽ cập nhật trực tiếp lên trang chủ.
                  </div>

                  {/* LIVE PREVIEW 4 THẺ SỐ LIỆU */}
                  <div className="rounded-2xl border border-amber-400/30 bg-purple-950/60 p-4 space-y-2">
                    <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider block">
                      👁️ Xem trước giao diện hiển thị trên trang chủ:
                    </span>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {formStats.map((s, idx) => (
                        <div
                          key={idx}
                          className="p-3.5 rounded-xl border border-white/10 bg-white/[0.04] backdrop-blur-md text-center space-y-1 shadow-sm"
                        >
                          <strong className="block text-xl sm:text-2xl font-extrabold text-amber-300 drop-shadow-[0_2px_8px_rgba(255,176,0,0.4)]">
                            {s.value || "0"}
                          </strong>
                          <span className="block text-xs font-medium text-purple-200">
                            {s.label || "Chỉ số"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* FORM NHẬP 4 THẺ SỐ LIỆU */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {formStats.map((s, idx) => (
                      <div
                        key={idx}
                        className="rounded-xl border border-white/10 bg-black/30 p-4 space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-amber-300">
                            Thẻ số liệu #{idx + 1}
                          </span>
                          {idx === 0 && <span className="text-xs text-purple-300/60">🎁 Quà tặng</span>}
                          {idx === 1 && <span className="text-xs text-purple-300/60">🎓 Học bổng</span>}
                          {idx === 2 && <span className="text-xs text-purple-300/60">🤝 Tình nguyện</span>}
                          {idx === 3 && <span className="text-xs text-purple-300/60">🏮 Lồng đèn</span>}
                        </div>

                        <div className="space-y-1">
                          <label className="block text-[11px] font-semibold text-purple-200">
                            Giá trị con số (vd: 350+, 20+, 60+, 500+)
                          </label>
                          <input
                            type="text"
                            className="admin-control w-full font-bold text-amber-300"
                            value={s.value}
                            onChange={(e) => {
                              const val = e.target.value;
                              setFormStats((old) => old.map((item, i) => (i === idx ? { ...item, value: val } : item)));
                            }}
                            placeholder="350+"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="block text-[11px] font-semibold text-purple-200">
                            Tên nhãn số liệu (vd: Phần quà Trung Thu, Học bổng vượt khó…)
                          </label>
                          <input
                            type="text"
                            className="admin-control w-full"
                            value={s.label}
                            onChange={(e) => {
                              const val = e.target.value;
                              setFormStats((old) => old.map((item, i) => (i === idx ? { ...item, label: val } : item)));
                            }}
                            placeholder="Phần quà Trung Thu"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* PHẦN 3: CHỈNH SỬA CÁC CHẶNG HÀNH TRÌNH (RECAP JOURNEY - Ảnh 1) */}
              {editing.key === "recap" && activeTab === "journey" && (
                <div className="space-y-5">
                  <div className="rounded-xl border border-amber-400/20 bg-amber-400/5 p-4 text-xs text-amber-200 leading-relaxed">
                    🚀 <strong>Các mốc &ldquo;Nhìn lại hành trình&rdquo; (như 01 Góp sức, 02 Chuẩn bị trong Ảnh 1):</strong>
                    <br />
                    Mỗi chặng gồm Tên giai đoạn (vd: <em>Góp sức</em>), Tiêu đề chặng (vd: <em>Gieo những điều thương</em>), Điểm nhấn in đậm và Đoạn văn kể chuyện.
                  </div>

                  <div className="space-y-4">
                    {formJourney.map((j, idx) => (
                      <div
                        key={idx}
                        className="rounded-2xl border border-amber-400/20 bg-black/40 p-4 sm:p-5 space-y-4 relative"
                      >
                        <div className="flex items-center justify-between pb-2 border-b border-white/10">
                          <div className="flex items-center gap-2">
                            <span className="w-7 h-7 rounded-lg bg-amber-400/20 text-amber-300 font-extrabold text-sm flex items-center justify-center font-mono">
                              {String(idx + 1).padStart(2, "0")}
                            </span>
                            <span className="text-sm font-bold text-white">
                              Chặng {idx + 1}: {j.phase || "Giai đoạn"} — {j.title || "Tiêu đề chặng"}
                            </span>
                          </div>
                          {formJourney.length > 1 && (
                            <button
                              type="button"
                              onClick={() => setFormJourney((old) => old.filter((_, i) => i !== idx))}
                              className="text-xs text-rose-400 hover:text-rose-300 hover:underline inline-flex items-center gap-1"
                            >
                              <IconVaultTrash size={14} />
                              <span>Gỡ chặng này</span>
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="block text-[11px] font-semibold text-purple-200">
                              Tên giai đoạn (vd: Góp sức, Chuẩn bị, Sẻ chia)
                            </label>
                            <input
                              type="text"
                              className="admin-control w-full"
                              value={j.phase}
                              onChange={(e) => {
                                const val = e.target.value;
                                setFormJourney((old) => old.map((item, i) => (i === idx ? { ...item, phase: val } : item)));
                              }}
                              placeholder="Góp sức"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="block text-[11px] font-semibold text-purple-200">
                              Tiêu đề chặng (vd: Gieo những điều thương)
                            </label>
                            <input
                              type="text"
                              className="admin-control w-full font-bold text-white"
                              value={j.title}
                              onChange={(e) => {
                                const val = e.target.value;
                                setFormJourney((old) => old.map((item, i) => (i === idx ? { ...item, title: val } : item)));
                              }}
                              placeholder="Gieo những điều thương"
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="block text-[11px] font-semibold text-purple-200">
                            Điểm nhấn đúc kết (In màu vàng trên website)
                          </label>
                          <input
                            type="text"
                            className="admin-control w-full text-amber-200"
                            value={j.highlight || ""}
                            onChange={(e) => {
                              const val = e.target.value;
                              setFormJourney((old) => old.map((item, i) => (i === idx ? { ...item, highlight: val } : item)));
                            }}
                            placeholder="Mỗi đóng góp đều là một phần của hành trình."
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="block text-[11px] font-semibold text-purple-200">
                            Đoạn văn kể chuyện chi tiết
                          </label>
                          <textarea
                            rows={3}
                            className="admin-control w-full text-sm leading-relaxed"
                            value={j.description}
                            onChange={(e) => {
                              const val = e.target.value;
                              setFormJourney((old) => old.map((item, i) => (i === idx ? { ...item, description: val } : item)));
                            }}
                            placeholder="Những buổi bán bánh gây quỹ, chuẩn bị nguyên vật liệu và cùng làm lồng đèn là cách mùa trăng bắt đầu…"
                          />
                        </div>
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={() =>
                        setFormJourney((old) => [
                          ...old,
                          {
                            phase: `Chặng ${old.length + 1}`,
                            title: "Tên chặng mới",
                            date: "",
                            highlight: "Điểm nhấn đáng nhớ.",
                            description: "Nội dung hoạt động của chặng hành trình này.",
                          },
                        ])
                      }
                      className="admin-secondary w-full py-3 rounded-xl text-xs font-bold inline-flex items-center justify-center gap-1.5 border border-dashed border-amber-400/40 text-amber-300 hover:bg-amber-400/10"
                    >
                      <IconPlusNode size={16} />
                      <span>+ Thêm chặng hành trình mới</span>
                    </button>
                  </div>
                </div>
              )}

              {/* FOOTER NÚT BẤM LƯU */}
              <div className="pt-4 border-t border-amber-400/20 flex items-center justify-end gap-3 flex-shrink-0">
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => setEditing(null)}
                  className="admin-secondary px-5 py-2 text-xs font-semibold rounded-xl"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={busy}
                  className="admin-primary px-6 py-2 text-xs font-bold rounded-xl shadow-lg"
                >
                  {busy ? "Đang lưu thay đổi…" : "Lưu thay đổi"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
