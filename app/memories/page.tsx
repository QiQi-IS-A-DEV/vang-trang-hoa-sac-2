"use client";

import Image from "next/image";
import Link from "next/link";
import { MessageBoard } from "@/components/memory-tree/message-board";
import { useSiteSettings } from "@/lib/hooks/use-site-settings";

export default function MemoriesPage() {
  const settings = useSiteSettings();

  return (
    <div className="memory-page relative isolate min-h-screen">
      <div className="pointer-events-none fixed inset-0 -z-20">
        <Image src={settings.backgroundUrl||'/branding/background_khongten_logo.png'} alt="" fill unoptimized priority sizes="100vw" className="object-cover object-center" />
      </div>
      <div className="pointer-events-none fixed inset-0 -z-10 bg-gradient-to-b from-purple-950/65 via-purple-950/45 to-purple-950/90" />
      <main className="mx-auto max-w-6xl px-4 pb-16 pt-6 md:px-8">
        <nav className="memory-masthead flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3 text-sm font-semibold text-white">
            <Image src={settings.logoUrl||'/branding/Logo_VTHS.png'} alt="" width={48} height={48} unoptimized className="h-11 w-11 shrink-0 rounded-full bg-white object-contain" />
            <span>{settings.heroTitle}</span>
          </Link>
          <Link href="/" className="rounded-full border border-white/30 px-4 py-2 text-sm text-amber-100 hover:bg-white/10">← Trang chủ</Link>
        </nav>
        {settings.memoriesIntroVisible!==false&&<header className="mx-auto mt-10 max-w-2xl text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-amber-100">
            {settings.memoriesSubtitle || "Một mùa trăng · Ngàn điều muốn nói"}
          </p>
          <h1 className="festival-title mt-4 text-4xl font-black leading-tight md:text-6xl">
            {settings.memoriesTitle || "Cây kỷ niệm"}
          </h1>
          <p className="mx-auto mt-4 max-w-lg whitespace-pre-line text-sm leading-7 text-white md:text-base">
            {settings.memoriesDescription || "Một lời nhắn nhỏ, một kỷ niệm ở lại. Cùng treo những điều thương mến lên cây mùa trăng của chúng ta."}
          </p>
        </header>}
        {settings.memoriesGuideVisible!==false&&<section aria-labelledby="memory-guide-heading" className="memory-landing-guide">
          <div><h2 id="memory-guide-heading">{settings.memoriesGuideTitle}</h2><p>{settings.memoriesGuideDescription}</p></div>
          <nav aria-label="Khám phá cây kỷ niệm"><a href="#leave-message">Gửi lời nhắn</a><a href="#messages-heading">Đọc lời nhắn</a></nav>
        </section>}
        <MessageBoard allowSubmissions={settings.allowSubmissions} />
        {settings.memoriesFooterVisible!==false&&settings.memoriesFooterText&&<footer className="memory-landing-footer"><p>{settings.memoriesFooterText}</p><Link href="/">Về trang chủ</Link></footer>}
      </main>
    </div>
  );
}
