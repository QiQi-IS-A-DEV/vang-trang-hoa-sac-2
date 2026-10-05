"use client";
import Link from "next/link";
import Image from 'next/image';
import { useSiteSettings } from "@/frontend/lib/hooks/use-site-settings";
import { useLandingSection } from "./landing-section";
export function HomeFooter() {
  const settings = useSiteSettings();
  const section = useLandingSection();
  return <footer className="lower-section lower-footer"><div className="lower-inner">
    <div className="footer-brand"><Image src={settings.logoUrl || '/branding/Logo_VTHS.png'} width={52} height={52} unoptimized alt="Logo chương trình"/><span>{section?.title || settings.heroTitle}<small>OU Help To Be Helped Club</small></span></div>
    <div className="lower-footer-main"><div><span className="lower-eyebrow">Cảm ơn vì đã cùng nhau</span><h2 className="festival-title">{settings.footerQuote || "Một mùa trăng,\nmuôn điều thương ở lại."}</h2><p>{section?.description || "Cảm ơn mỗi người đã góp thời gian, tâm sức và những nụ cười cho Vầng Trăng Hòa Sắc 2.\nGửi một kỷ niệm lên cây mùa trăng, để những điều đẹp đẽ còn ở lại cùng chúng mình."}</p><Link href="/memories" className="festival-button lower-cta"> Gửi một lời nhắn</Link></div>
      <nav aria-label="Điều hướng cuối trang"><strong>Gặp lại mùa trăng</strong><a href="#advisors"> Đội ngũ chương trình</a><a href="#volunteers"> Thẻ tình nguyện viên</a><Link href="/posts"> Tin tức & câu chuyện</Link><Link href="/memories"> Cây kỷ niệm</Link></nav>
    </div><div className="lower-footer-bottom"><p>© {new Date().getFullYear()} {settings.heroTitle}<br />OU Help To Be Helped Club · Trường Đại học Mở TP. Hồ Chí Minh</p><Link href="/admin"> Dành cho quản trị viên</Link></div>
  </div></footer>;
}
