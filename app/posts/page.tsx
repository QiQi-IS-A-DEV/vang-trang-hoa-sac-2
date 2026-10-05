import Link from 'next/link';
import { PostGallery } from '@/components/home/post-gallery';
export const metadata = { title: 'Tin tức | Vầng Trăng Hòa Sắc 2' };
export default function PostsPage() { return <main className="site-shell news-page"><div className="section-inner"><Link href="/" className="text-link">← Trang chủ</Link><header className="section-heading"><h1>Tin tức & dấu ấn mùa trăng</h1><p>Những câu chuyện, hoạt động và khoảnh khắc của chương trình.</p></header><PostGallery /></div></main>; }
