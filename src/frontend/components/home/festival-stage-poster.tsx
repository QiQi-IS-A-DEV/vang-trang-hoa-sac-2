"use client";

import { useState } from "react";
import Image from "next/image";

export interface StageMember {
  id: string;
  name: string;
  role: string;
  image?: string;
  quote?: string;
  title?: string;
}

interface FestivalStagePosterProps {
  id?: string;
  title: string;
  posterImage?: string;
  members: StageMember[];
  subtitle?: string;
  allowDownload?: boolean;
}

export function FestivalStagePoster({
  id,
  title,
  posterImage,
  members,
  subtitle,
  allowDownload = true,
}: FestivalStagePosterProps) {
  const [showLightbox, setShowLightbox] = useState(false);
  const [activeMemberModal, setActiveMemberModal] = useState<StageMember | null>(null);

  // Take top 3 members for 3-frame layout
  const displayMembers = members.slice(0, 3);

  // Download handler
  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!posterImage) return;
    const a = document.createElement("a");
    a.href = posterImage;
    a.download = `${title.toLowerCase().replace(/\s+/g, "-")}-vths2.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div id={id} className="relative w-full max-w-5xl mx-auto my-6 group/poster">
      {/* Vầng hào quang nhẹ sau khung poster */}
      <div className="pointer-events-none absolute inset-0 -z-10 rounded-[40px] bg-amber-400/10 blur-2xl opacity-60 group-hover/poster:opacity-90 transition-opacity duration-500" />

      {/* KHUNG POSTER CHÍNH TỶ LỆ 3:2 (1024 x 682) */}
      <div
        className="stage-poster-card hologram-shine relative w-full aspect-[1024/682] rounded-2xl sm:rounded-3xl md:rounded-[36px] overflow-hidden border-2 border-amber-300/70 shadow-[0_15px_45px_rgba(20,5,35,0.85)] ring-1 ring-amber-400/40 bg-[#250d3d]"
      >
        {posterImage ? (
          /* ============================================================== */
          /* CHẾ ĐỘ 1: RENDER TRỰC TIẾP POSTER GỐC HOÀN CHỈNH (ẢNH CANVA)   */
          /* ============================================================== */
          <div
            className="relative w-full h-full cursor-pointer select-none"
            onClick={() => setShowLightbox(true)}
          >
            <Image
              src={posterImage}
              alt={title}
              fill
              sizes="(max-width: 1024px) 100vw, 1024px"
              priority
              className="object-cover object-center transition-transform duration-700 ease-out group-hover/poster:scale-[1.012]"
            />

            {/* Hotspots tương tác lên 3 người trên poster */}
            <div className="absolute inset-x-0 top-[26%] bottom-[12%] grid grid-cols-3 px-[7%] pointer-events-auto">
              {displayMembers.map((member, idx) => (
                <div
                  key={member.id || idx}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveMemberModal(member);
                  }}
                  className="relative h-full flex flex-col justify-end items-center group/member cursor-pointer rounded-2xl hover:bg-amber-300/[0.06] transition-all"
                  title={`Bấm để xem thông tin: ${member.name}`}
                >
                  {/* Subtle hover indicator */}
                  <div className="opacity-0 group-hover/member:opacity-100 transition-all duration-300 transform translate-y-2 group-hover/member:translate-y-0 mb-3 px-3 py-1 rounded-full bg-[#1e0730]/90 border border-amber-300/80 text-[10px] sm:text-[11px] font-bold text-amber-200 shadow-xl backdrop-blur-md flex items-center gap-1.5">
                    <span className="text-amber-400">★</span>
                    <span>Xem thông tin</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Floating Quick Action Buttons */}
            <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 flex items-center gap-2 opacity-90 group-hover/poster:opacity-100 transition-opacity z-20">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowLightbox(true);
                }}
                className="px-3.5 py-1.5 rounded-full bg-[#1e0730]/85 hover:bg-[#2e0b4a] border border-amber-300/70 text-amber-200 text-xs font-bold shadow-lg backdrop-blur-md flex items-center gap-1.5 transition-all hover:scale-105"
                title="Phóng to poster"
              >
                <span>🔍</span>
                <span className="hidden sm:inline">Phóng to</span>
              </button>
              {allowDownload && (
                <button
                  onClick={handleDownload}
                  className="festival-button px-3.5 py-1.5 rounded-full text-purple-950 text-xs font-black shadow-lg flex items-center gap-1.5 transition-all hover:scale-105"
                  title="Tải ảnh poster về máy"
                >
                  <span>⬇</span>
                  <span className="hidden sm:inline">Tải poster</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          /* ============================================================== */
          /* CHẾ ĐỘ 2: DỰNG KHUNG ĐỘNG Y CHANG POSTER TRÊN BACKGROUND CHUẨN */
          /* ============================================================== */
          <div className="relative w-full h-full flex flex-col items-center justify-between p-3 sm:p-5 md:p-6 overflow-hidden select-none">
            {/* 1. LỚP BACKGROUND CHƯƠNG TRÌNH */}
            <div className="absolute inset-0 -z-10">
              <Image
                src="/branding/background_khongten_logo.png"
                alt="Background Vầng Trăng Hòa Sắc"
                fill
                sizes="1024px"
                className="object-cover object-center"
                priority
              />
            </div>

            {/* 2. CAPSULE LOGO ĐƠN VỊ TỔ CHỨC Ở ĐỈNH */}
            <div className="relative z-10 shrink-0">
              <div className="inline-flex items-center gap-2 bg-white px-3.5 py-1 sm:px-5 sm:py-1.5 rounded-full shadow-md border border-amber-300/60">
                <Image
                  src="/branding/poster-logo-capsule.png"
                  alt="OU · CLB H2BH"
                  width={110}
                  height={38}
                  className="h-5 sm:h-7 w-auto object-contain"
                />
              </div>
            </div>

            {/* 3. TIÊU ĐỀ 3D VÀNG HOÀNG GIA CHUẨN CANVA */}
            <div className="relative z-10 text-center my-0.5 sm:my-1 shrink-0">
              <h2 className="festival-title text-xl sm:text-3xl md:text-5xl font-black uppercase tracking-wide">
                {title}
              </h2>
              {subtitle && (
                <p className="text-[10px] sm:text-xs text-amber-100/90 font-medium drop-shadow-sm mt-0.5 max-w-lg mx-auto line-clamp-1">
                  {subtitle}
                </p>
              )}
            </div>

            {/* 4. BA KHUNG DỌC CHUẨN KHUÔN HÌNH CANVA */}
            <div className="relative z-10 w-full max-w-4xl flex items-end justify-center gap-2.5 sm:gap-6 md:gap-8 flex-1 my-1 sm:my-2 px-2">
              {displayMembers.map((member, idx) => {
                const isCenter = idx === 1;

                return (
                  <div
                    key={member.id || idx}
                    onClick={() => setActiveMemberModal(member)}
                    className={`relative rounded-xl sm:rounded-2xl md:rounded-[26px] border-2 cursor-pointer transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-2xl group/card ${
                      isCenter
                        ? "w-[34%] max-w-[270px] h-[98%] border-amber-300 ring-2 ring-amber-400/60 bg-[#5c246f]/90 shadow-amber-500/30 z-20 hover:scale-[1.02]"
                        : "w-[30%] max-w-[245px] h-[89%] border-amber-300/80 bg-[#4a1860]/85 shadow-purple-950/70 hover:border-amber-300 z-10 hover:scale-[1.02]"
                    }`}
                  >
                    {/* Ảnh chân dung bên trong khung */}
                    <div className="relative w-full flex-1 overflow-hidden bg-purple-950/30 flex items-center justify-center">
                      {member.image ? (
                        <Image
                          src={member.image}
                          alt={member.name}
                          fill
                          sizes="(max-width: 768px) 33vw, 260px"
                          className="object-cover object-top group-hover/card:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs font-bold text-amber-200/50">
                          {member.name}
                        </div>
                      )}
                    </div>

                    {/* Cụm Huy Hiệu Chức Vụ & Họ Tên chuẩn y chang ảnh */}
                    <div className="p-1 sm:p-2 md:p-2.5 bg-gradient-to-t from-[#1b082c] via-[#240b3b]/95 to-transparent flex flex-col items-center gap-0.5 sm:gap-1 shrink-0">
                      {/* Pill chức vụ */}
                      <div className="rounded-full bg-[#24083a] border border-purple-400/40 px-2 sm:px-3 py-0.5 text-[8px] sm:text-[10px] md:text-[11px] font-black uppercase tracking-wider text-white shadow-md text-center truncate max-w-full">
                        {member.role || "CỐ VẤN"}
                      </div>

                      {/* Tên chữ vàng 3D */}
                      <div className="text-center w-full px-1">
                        <span className="text-[10px] sm:text-xs md:text-sm lg:text-base font-black uppercase text-[#ffe46b] tracking-tight drop-shadow-[0_2px_0_#63285d] truncate block">
                          {member.name}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 5. CHÂN POSTER: CHÚ THỎ ÔM ĐÈN VÀ DẢI RIBBON VÀNG */}
            <div className="relative z-10 w-full flex items-center justify-between px-2 sm:px-6 pt-1 shrink-0">
              {/* Chú thỏ góc trái */}
              <div className="relative w-10 h-10 sm:w-14 sm:h-14 md:w-16 md:h-16 shrink-0 -mb-1">
                <Image
                  src="/branding/con_tho.png"
                  alt="Thỏ ngọc ôm đèn"
                  fill
                  className="object-contain"
                />
              </div>

              {/* Dải ribbon khẩu hiệu vàng */}
              <div className="rounded-full bg-[#fef3c7] border border-amber-300 text-[#4a044e] px-3 sm:px-6 py-1 sm:py-1.5 text-[8px] sm:text-[11px] md:text-xs font-black uppercase tracking-wider shadow-lg flex items-center gap-1.5 text-center">
                <span className="text-amber-500">★</span>
                <span>CÙNG CHỜ ĐÓN NHỮNG ĐIỀU BẤT NGỜ TỪ VẦNG TRĂNG HÒA SẮC 2 NHÉ!</span>
                <span className="text-amber-500">★</span>
              </div>

              {/* Chỗ trống cân bằng */}
              <div className="w-10 sm:w-14 md:w-16 shrink-0" />
            </div>
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* LIGHTBOX PHÓNG TO POSTER TOÀN MÀN HÌNH                          */}
      {/* ============================================================== */}
      {showLightbox && posterImage && (
        <div
          onClick={() => setShowLightbox(false)}
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 cursor-pointer animate-in fade-in duration-200"
        >
          <div
            className="relative max-w-5xl max-h-[92vh] w-full rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border-2 border-amber-300/70"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative w-full aspect-[1024/682]">
              <Image
                src={posterImage}
                alt={title}
                fill
                sizes="(max-width: 1280px) 100vw, 1280px"
                className="object-contain"
              />
            </div>

            {/* Top Toolbar */}
            <div className="absolute top-3 right-3 flex items-center gap-2">
              <button
                onClick={handleDownload}
                className="festival-button px-3.5 py-1.5 rounded-full text-purple-950 font-black text-xs shadow-lg flex items-center gap-1.5 transition-all"
              >
                <span>⬇</span>
                <span>Tải về</span>
              </button>
              <button
                onClick={() => setShowLightbox(false)}
                className="w-8 h-8 rounded-full bg-black/70 hover:bg-red-500 text-white font-bold flex items-center justify-center transition-all text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL CHI TIẾT THÀNH VIÊN KHI CLICK VÀO KHUNG                   */}
      {/* ============================================================== */}
      {activeMemberModal && (
        <div
          onClick={() => setActiveMemberModal(null)}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-md w-full rounded-3xl bg-gradient-to-b from-[#2e0e47] to-[#1a072b] border-2 border-amber-300/80 p-6 shadow-2xl text-center space-y-4"
          >
            <button
              onClick={() => setActiveMemberModal(null)}
              className="absolute top-4 right-4 w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center justify-center cursor-pointer transition-colors"
            >
              ✕
            </button>

            {/* Avatar / Portrait */}
            {activeMemberModal.image && (
              <div className="relative w-28 h-36 mx-auto rounded-2xl overflow-hidden border-2 border-amber-300/80 shadow-lg bg-purple-950/50">
                <Image
                  src={activeMemberModal.image}
                  alt={activeMemberModal.name}
                  fill
                  className="object-cover object-top"
                />
              </div>
            )}

            <div>
              <span className="inline-block rounded-full bg-purple-950 px-3 py-1 text-xs font-mono font-bold text-amber-300 border border-amber-400/40 uppercase">
                {activeMemberModal.role}
              </span>
              <h3 className="text-xl font-black uppercase text-amber-300 tracking-tight mt-2">
                {activeMemberModal.name}
              </h3>
              {activeMemberModal.title && (
                <p className="text-xs text-purple-200/80 font-mono mt-1">
                  {activeMemberModal.title}
                </p>
              )}
            </div>

            {activeMemberModal.quote && (
              <div className="rounded-2xl bg-white/[0.04] border border-amber-300/20 p-3.5 text-xs text-amber-100/90 italic">
                &ldquo;{activeMemberModal.quote}&rdquo;
              </div>
            )}

            <button
              onClick={() => setActiveMemberModal(null)}
              className="festival-button w-full rounded-xl text-purple-950 font-bold py-2 text-xs transition-colors cursor-pointer"
            >
              ĐÓNG
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
