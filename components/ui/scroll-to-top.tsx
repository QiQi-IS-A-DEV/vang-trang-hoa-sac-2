"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";

export function ScrollToTop() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  // Cho phép chuyển đổi giữa Logo chương trình và Hình ông sao Trung Thu
  const [displayMode, setDisplayMode] = useState<"logo" | "star">("logo");

  const isAdmin = pathname?.startsWith("/admin");

  useEffect(() => {
    function handleScroll() {
      const scrollY = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;

      // Hiển thị nút khi cuộn xuống hơn 280px
      setVisible(scrollY > 280);

      // Tính phần trăm tiến độ cuộn trang (0 - 100%)
      if (docHeight > 0) {
        const progress = Math.min(100, Math.max(0, (scrollY / docHeight) * 100));
        setScrollProgress(progress);
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  function scrollToTop() {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });
  }

  // Ẩn trên trang quản trị admin
  if (isAdmin) return null;

  // Tính chu vi vòng tròn tiến độ ở viền ngoài cùng (R = 26 => C ≈ 163.36)
  const radius = 26;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (scrollProgress / 100) * circumference;

  return (
    <div
      className={`scroll-to-top fixed z-40 transition-all duration-300 ease-out ${
        visible
          ? "opacity-100 translate-y-0 pointer-events-auto"
          : "opacity-0 translate-y-4 pointer-events-none"
      }`}
    >
      <div className="group relative flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16">
        {/* VÒNG TRÒN TIẾN ĐỘ CUỘN TRANG NẰM Ở NGOÀI CÙNG (Outer Progress Ring) */}
        <svg
          className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none"
          viewBox="0 0 60 60"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="vths-progress-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fff59d" />
              <stop offset="35%" stopColor="#ffe853" />
              <stop offset="70%" stopColor="#ffb000" />
              <stop offset="100%" stopColor="#ff8f00" />
            </linearGradient>
            <filter id="vths-progress-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Vòng ray nền ngoài cùng */}
          <circle
            cx="30"
            cy="30"
            r={radius}
            stroke="rgba(255, 215, 0, 0.16)"
            strokeWidth="3"
            fill="none"
          />

          {/* Vòng tiến độ vàng kim hiển thị % cuộn trang */}
          <circle
            cx="30"
            cy="30"
            r={radius}
            stroke="url(#vths-progress-gradient)"
            strokeWidth="3.2"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="none"
            filter="url(#vths-progress-glow)"
            className="transition-[stroke-dashoffset] duration-150 ease-out"
          />
        </svg>

        {/* NÚT BẤM TRÒN BÊN TRONG (Tách biệt với vòng ngoài) */}
        <button
          type="button"
          onClick={scrollToTop}
          aria-label={`Cuộn lên đầu trang (Đã cuộn ${Math.round(scrollProgress)}%)`}
          title={`Cuộn lên đầu trang (${Math.round(scrollProgress)}%)`}
          className="relative z-10 flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-full border border-amber-300/40 bg-[#1e0730]/90 backdrop-blur-md shadow-xl transition-all duration-300 hover:scale-105 hover:border-amber-300 hover:bg-[#2c0b47] active:scale-95"
        >
          {displayMode === "logo" ? (
            /* LỰA CHỌN 1: LOGO CHƯƠNG TRÌNH VẦNG TRĂNG HÒA SẮC 2 (Thỏ ngọc & Vầng trăng) */
            <div className="relative flex items-center justify-center w-full h-full">
              <Image
                src="/branding/Logo_VTHS.png"
                alt="Logo Vầng Trăng Hòa Sắc 2"
                width={40}
                height={40}
                unoptimized
                className="w-8 h-8 sm:w-9 sm:h-9 object-contain scale-125 drop-shadow-[0_2px_8px_rgba(255,176,0,0.5)] transition-transform duration-300 group-hover:scale-135 group-hover:-translate-y-0.5"
              />
              {/* Mũi tên hướng lên nhỏ lướt nhẹ khi hover */}
              <span
                className="absolute -top-1.5 right-1 text-[10px] font-black text-amber-300 opacity-0 group-hover:opacity-100 group-hover:-translate-y-1 transition-all duration-300"
                aria-hidden="true"
              >
                ▲
              </span>
            </div>
          ) : (
            /* LỰA CHỌN 2: HÌNH ÔNG SAO TRUNG THU (Ngôi sao 5 cánh tỏa sáng) */
            <div className="relative flex items-center justify-center w-full h-full">
              <svg
                viewBox="0 0 24 24"
                className="w-6 h-6 sm:w-7 sm:h-7 drop-shadow-[0_0_10px_rgba(255,176,0,0.85)] transition-transform duration-300 group-hover:scale-115 group-hover:rotate-12 group-hover:-translate-y-0.5"
                aria-hidden="true"
              >
                <defs>
                  <linearGradient id="star-gold-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ffffff" />
                    <stop offset="30%" stopColor="#ffe853" />
                    <stop offset="70%" stopColor="#ffb000" />
                    <stop offset="100%" stopColor="#ff7b00" />
                  </linearGradient>
                </defs>
                <path
                  d="M12 1.8l3.1 6.55 7.15 1.05-5.2 5.08 1.25 7.12L12 18.25l-6.3 3.35 1.25-7.12-5.2-5.08 7.15-1.05L12 1.8z"
                  fill="url(#star-gold-grad)"
                  stroke="#ffe853"
                  strokeWidth="0.5"
                />
              </svg>
              {/* Mũi tên hướng lên nhỏ */}
              <span
                className="absolute -top-1.5 right-1 text-[10px] font-black text-amber-300 opacity-0 group-hover:opacity-100 group-hover:-translate-y-1 transition-all duration-300"
                aria-hidden="true"
              >
                ▲
              </span>
            </div>
          )}
        </button>

        {/* Nút chuyển đổi nhanh chế độ hiển thị (Logo ⇄ Ông sao) */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setDisplayMode((m) => (m === "logo" ? "star" : "logo"));
          }}
          title={
            displayMode === "logo"
              ? "Bấm để đổi sang hình Ông sao Trung Thu ★"
              : "Bấm để đổi sang Logo chương trình 🌙"
          }
          className="absolute -top-1 -right-1 z-20 w-5 h-5 rounded-full bg-purple-950/90 border border-amber-300/60 text-[9px] flex items-center justify-center text-amber-200 shadow-md hover:scale-125 hover:border-amber-300 hover:text-white transition-transform"
        >
          {displayMode === "logo" ? "★" : "🌙"}
        </button>
      </div>
    </div>
  );
}
