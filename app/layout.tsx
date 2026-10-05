import type { Metadata } from "next";
import { MusicPlayer } from "@/components/ui/music-player";
import { ScrollToTop } from "@/components/ui/scroll-to-top";
import "./globals.css";
import "./frontend.css";
import { Be_Vietnam_Pro, Lora } from "next/font/google";

const bodyFont = Be_Vietnam_Pro({ subsets: ['latin', 'vietnamese'], weight: ['400', '500', '600', '700', '800'], variable: '--font-vietnam', display: 'swap' });
const headingFont = Lora({ subsets: ['latin', 'vietnamese'], variable: '--font-lora', display: 'swap' });

export const metadata: Metadata = {
  title: "Vầng Trăng Hòa Sắc 2",
  description: "Một mùa trăng, những kỷ niệm cùng nhau. Nơi lưu giữ khoảnh khắc và lời chúc yêu thương của chiến dịch Trung Thu Tình Nguyện.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi" className={`${bodyFont.variable} ${headingFont.variable}`}>
      <body>
        {children}
        <ScrollToTop />
        <MusicPlayer />
      </body>
    </html>
  );
}
