"use client";
import Link from "next/link";
import { useSiteSettings } from "@/lib/hooks/use-site-settings";
import { useLandingSection } from "./landing-section";
export function HomeFooter() {
  const settings = useSiteSettings();
  const section = useLandingSection();
  return <footer className="lower-section lower-footer"><div className="lower-inner">
    <div className="lower-footer-main"><div><span className="lower-eyebrow">Cảm ơn vì đã cùng nhau</span><h2 className="festival-title">{settings.footerQuote || "Trăng rồi sẽ khuyết. Điều thương còn đầy."}</h2><p>{section?.description || "Cảm ơn từng tình nguyện viên, người đồng hành và những tấm lòng đã góp nên Vầng Trăng Hòa Sắc 2. Nếu có một kỷ niệm muốn giữ lại, hãy gửi lời nhắn lên cây mùa trăng của chúng mình."}</p><Link href="/memories" className="festival-button lower-cta">Gửi lời nhắn mùa trăng ↗</Link></div>
      <nav aria-label="Điều hướng cuối trang"><strong>Cùng nhìn lại</strong><a href="#advisors">Ban cố vấn</a><a href="#organizers">Ban tổ chức</a><a href="#department-leads">Các ban của chiến dịch</a><a href="#volunteers">Thẻ tình nguyện viên</a><Link href="/posts">Tin tức & bài viết</Link></nav>
    </div><div className="lower-footer-bottom"><p>© {new Date().getFullYear()} {section?.title || settings.heroTitle}<br />OU Help To Be Helped Club - Câu Lạc Bộ Hỗ Trợ Người Học Nước Ngoài Học Tập Tại Trường Đại Học Mở Thành Phố Hồ Chí Minh</p><Link href="/admin">Đăng nhập quản trị ↗</Link></div>
  </div></footer>;
}
