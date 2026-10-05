"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { toPng } from "html-to-image";
import type { Volunteer } from "@/shared/data/homepage-data";
import { TeamAvatar } from "./team-avatar";

interface VolunteerBadgeModalProps {
  volunteer: Volunteer | null;
  onClose: () => void;
}

export function VolunteerBadgeModal({ volunteer, onClose }: VolunteerBadgeModalProps) {
  const badgeRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  if (!volunteer) return null;

  async function handleDownload() {
    if (!badgeRef.current || downloading || !volunteer) return;
    try {
      setDownloading(true);
      const dataUrl = await toPng(badgeRef.current, {
        cacheBust: true,
        pixelRatio: 2, // 2x resolution for retina quality
      });
      const link = document.createElement("a");
      link.download = `VTHS2_TheTNV_${volunteer.code}_${volunteer.name.replace(/\s+/g, "_")}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Lỗi khi tải ảnh thẻ:", err);
      alert("Chưa thể xuất ảnh thẻ. Vui lòng thử lại!");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative max-w-md w-full rounded-3xl border border-amber-300/30 bg-[#21092e] p-6 shadow-2xl my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
          aria-label="Đóng modal"
        >
          ✕
        </button>

        <div className="mb-4 text-center">
          <span className="text-xs uppercase tracking-[0.2em] text-amber-300 font-semibold">
            ✦ Thẻ Chiến Sĩ Điện Tử ✦
          </span>
          <h3 className="text-lg font-bold text-white mt-1">
            Kỷ Niệm Vầng Trăng Hòa Sắc 2
          </h3>
        </div>

        {/* ================================================= */}
        {/* KHUNG THẺ KỶ NIỆM ĐỂ XUẤT ẢNH PNG (CAPTURE TARGET) */}
        {/* ================================================= */}
        <div className="flex justify-center">
          <div
            ref={badgeRef}
            className="w-full max-w-[340px] rounded-2xl bg-gradient-to-b from-[#3a134c] via-[#240833] to-[#160421] p-5 border-2 border-amber-400/50 shadow-2xl relative overflow-hidden"
          >
            {/* Lanyard Ring Simulator */}
            <div className="mx-auto -mt-6 mb-3 flex h-5 w-14 items-center justify-center rounded-b-xl border border-t-0 border-amber-300/30 bg-purple-950">
              <div className="h-1.5 w-6 rounded-full bg-amber-400" />
            </div>

            {/* Header Badge */}
            <div className="flex items-center justify-between border-b border-amber-300/20 pb-3">
              <div className="flex items-center gap-2">
                <div className="h-9 w-9 rounded-full bg-white p-0.5 overflow-hidden">
                  <Image
                    src="/branding/Logo_VTHS.png"
                    alt="Logo VTHS"
                    width={36}
                    height={36}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-amber-200">
                    Vầng Trăng Hòa Sắc 2
                  </h4>
                  <p className="text-[9px] text-pink-200/80 font-semibold">
                    MỘT MÙA TRĂNG · MỘT HÀNH TRÌNH
                  </p>
                </div>
              </div>

              <span className="rounded-md bg-amber-400/20 px-2 py-0.5 text-[10px] font-mono font-bold text-amber-300 border border-amber-400/30">
                {volunteer.code}
              </span>
            </div>

            {/* Avatar Photo */}
            <div className="mt-4 mx-auto w-44">
              <TeamAvatar
                src={volunteer.image}
                alt={volunteer.name}
                name={volunteer.name}
                aspectRatio="card"
                badge={volunteer.badge}
              />
            </div>

            {/* Volunteer Info */}
            <div className="mt-4 text-center">
              <h3 className="text-xl font-black text-white tracking-wide">
                {volunteer.name}
              </h3>
              <p className="mt-0.5 text-xs font-bold text-amber-300 uppercase tracking-wider">
                {volunteer.department}
              </p>

              {/* Quote */}
              {volunteer.quote && (
                <div className="mt-3 rounded-xl bg-purple-950/70 p-2.5 border border-white/10 text-xs italic text-purple-100/90 leading-relaxed">
                  &ldquo;{volunteer.quote}&rdquo;
                </div>
              )}
            </div>

            {/* Official Stamp & Year */}
            <div className="mt-4 pt-3 border-t border-amber-300/20 flex items-center justify-between text-[10px] text-purple-200/80">
              <div>
                <span className="block font-bold text-amber-200">CHIẾN SĨ CHÍNH THỨC</span>
                <span className="text-[9px]">Chiến dịch Trung Thu Tình Nguyện</span>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-amber-400/40 bg-amber-400/10 text-center text-[8px] font-black uppercase text-amber-300">
                VTHS 2
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex flex-col gap-2.5">
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="festival-button w-full rounded-full py-3 text-xs font-bold text-purple-950 shadow-lg transition-transform hover:-translate-y-0.5 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {downloading ? (
              <span>⏳ Đang xử lý xuất ảnh PNG...</span>
            ) : (
              <>
                <span>📥 Tải thẻ kỷ niệm về máy (PNG)</span>
              </>
            )}
          </button>
          <p className="text-center text-[11px] text-purple-200/70">
            Ảnh xuất sắc nét chuẩn 2K, sẵn sàng chia sẻ lên Story Facebook, Zalo, Instagram!
          </p>
        </div>
      </div>
    </div>
  );
}
