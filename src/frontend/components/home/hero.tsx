"use client";

import Image from "next/image";
import Link from "next/link";
import { useSiteSettings } from "@/frontend/lib/hooks/use-site-settings";
import { useLandingSection } from "./landing-section";

export function Hero() {
  const settings = useSiteSettings();
  const section = useLandingSection();

  return (
    <section className="festival-hero relative isolate flex min-h-svh flex-col overflow-hidden justify-between">
      {/* Background chương trình với lớp overlay và vầng sáng mặt trăng */}
      <Image
        src={settings.backgroundUrl || "/branding/background_khongten_logo.png"}
        alt=""
        fill
        unoptimized
        priority
        sizes="100vw"
        className="-z-20 object-cover object-center scale-105 transition-transform duration-1000 ease-out"
      />

      {/* Lớp màu tím hoàng hôn sân khấu */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-[#1b082c]/75 via-[#280c42]/60 to-[#321547]/95" />

      {/* Vầng hào quang trăng vàng dịu */}
      <div className="pointer-events-none absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full moon-ambient-glow -z-10 blur-3xl opacity-70" />

      {/* Các ngôi sao lấp lánh trang trí nền (Pure CSS, GPU accelerated) */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <span className="star-twinkle absolute top-[15%] left-[10%] text-amber-200 text-sm">★</span>
        <span className="star-twinkle absolute top-[22%] right-[15%] text-amber-300 text-xs" style={{ animationDelay: "1s" }}>★</span>
        <span className="star-twinkle absolute top-[40%] left-[20%] text-amber-100 text-xs" style={{ animationDelay: "2s" }}>★</span>
        <span className="star-twinkle absolute top-[35%] right-[25%] text-amber-200 text-base" style={{ animationDelay: "1.5s" }}>★</span>
      </div>

      {/* Header follows the memory page's circular logo and outlined links. */}
      <header className="festival-masthead">
        <Link
          href="/"
          aria-label="Vầng Trăng Hòa Sắc 2 — Trang chủ"
          className="festival-brand"
        >
          <Image
            src={settings.logoUrl || "/branding/Logo_VTHS.png"}
            alt="Logo Vầng Trăng Hòa Sắc"
            unoptimized
            width={48}
            height={48}
            className="festival-brand-logo"
          />
          <span className="festival-brand-name">
            {settings.heroTitle}
          </span>
        </Link>

        {/* Navigation links */}
        <nav
          id="festival-main-nav"
          aria-label="Điều hướng chính"
          className="festival-main-nav"
        >
          <a
            href="#advisors"
            className="festival-header-link"
          >
            Đội ngũ
          </a>
          <a
            href="#volunteers"
            className="festival-header-link"
          >
            Thẻ TNV
          </a>
          <Link
            href="/posts"
            className="festival-header-link"
          >
            Tin tức
          </Link>
          <Link
            href="/memories"
            className="festival-header-link"
          >
             Cây kỷ niệm
          </Link>
        </nav>
      </header>

      {/* HERO MAIN CONTENT */}
      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col items-center justify-center px-4 py-8 sm:py-12 text-center z-10 my-auto">
        {/* Subtitle tag */}
        <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/40 bg-purple-950/70 px-4 py-1 text-xs font-bold uppercase tracking-widest text-amber-200 shadow-md backdrop-blur-sm mb-4">
          <span>★</span>
          <span>{settings.heroSubtitle}</span>
          <span>★</span>
        </div>

        {/* Grand 3D Festival Title */}
        <h1 className="festival-title festival-hero-title w-full max-w-7xl pt-4 pb-2 font-black uppercase tracking-tight text-center leading-[1.35] overflow-visible md:whitespace-nowrap">
          {(() => {
            const rawTitle = section?.title || settings.heroTitle || "Vầng Trăng Hòa Sắc 2";
            if (rawTitle.toUpperCase().trim() === "VẦNG TRĂNG HÒA SẮC 2") {
              return (
                <span className="inline-block md:whitespace-nowrap">
                  <span className="festival-title-first">VẦNG TRĂNG</span>{' '}
                  <span className="festival-title-second">HÒA SẮC 2</span>
                </span>
              );
            }
            return rawTitle;
          })()}
        </h1>

        {/* Description */}
        <p className="mt-6 max-w-2xl text-sm sm:text-base md:text-lg leading-relaxed text-purple-100 font-medium drop-shadow-sm px-4">
          {section?.description || settings.heroDescription}
        </p>

        {/* Call to action buttons */}
        <div className="hero-festival-actions mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
          <Link
            href="/memories"
            className="festival-button rounded-full px-7 sm:px-9 py-3 text-xs sm:text-sm font-black text-purple-950 shadow-xl shadow-amber-500/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
          >
            <span>{settings.primaryButton || "Đến cây kỷ niệm"}</span>

          </Link>
          <a
            href="#recap"
            className="rounded-full border border-amber-300/60 bg-[#250d3d]/70 hover:bg-[#341154] px-6 sm:px-8 py-3 text-xs sm:text-sm font-bold text-amber-200 shadow-lg backdrop-blur-sm hover:border-amber-300 transition-all flex items-center gap-2 cursor-pointer"
          >
            <span>{settings.secondaryButton || "Xem dấu ấn chương trình"}</span>

          </a>
        </div>
      </div>

      {/* BOTTOM SCROLL INDICATOR */}
      <div className="pb-6 flex justify-center z-10">
        <a
          href="#advisors"
          className="inline-flex items-center gap-2 rounded-full bg-purple-950/50 hover:bg-purple-900/70 border border-purple-400/20 px-4 py-1.5 text-xs font-semibold text-purple-200 hover:text-amber-200 backdrop-blur-sm transition-all"
        >
          <span>Khám phá mùa trăng</span>

        </a>
      </div>
    </section>
  );
}
