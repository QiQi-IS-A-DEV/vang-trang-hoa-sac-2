"use client";
import Link from "next/link";
import { useLandingSection } from "./landing-section";
import { PostGallery } from "./post-gallery";
import { recapStoriesData } from "@/data/homepage-data";
import { useSiteSettings } from "@/lib/hooks/use-site-settings";
export function ActivityRecap() {
  const section = useLandingSection();
  const settings = useSiteSettings();
  const defaults = [
    { label: "Phần quà Trung Thu", value: settings.statPresents },
    { label: "Học bổng vượt khó", value: settings.statScholarships },
    { label: "Chiến sĩ tình nguyện", value: settings.statVolunteers },
    { label: "Lồng đèn thắp sáng", value: settings.statLanterns },
  ];
  const content = section?.content as { stats?: typeof defaults; journey?: typeof recapStoriesData } | undefined;
  const stats = (content?.stats ?? defaults).filter(s => s.value);
  const stories = content?.journey ?? recapStoriesData;
  return <section id="recap" className="lower-section lower-recap"><div className="lower-inner">
    <header className="lower-heading"><span className="lower-eyebrow">Hành trình sẻ chia</span><h2 className="festival-title">{section?.title || "Dấu ấn mùa trăng"}</h2><p>{section?.description || "Từ những ngày chuẩn bị đến đêm hội rước đèn, mỗi chặng đường đều có dấu tay của những người cùng góp sức."}</p></header>
    {stats.length > 0 && <div className="lower-stats">{stats.map((s, i) => <div key={s.label || i}><strong>{s.value}</strong><span>{s.label}</span></div>)}</div>}
    {stories.length > 0 && <div className="lower-journey"><h3>Nhìn lại hành trình</h3>{stories.map((s, i) => <article key={i}><div><span className="journey-index">{String(i + 1).padStart(2, "0")}</span><p className="journey-phase">{[s.phase, s.date].filter(Boolean).join(" · ")}</p><h4>{s.title}</h4></div><div>{s.description.split(/\r?\n(?:[ \t]*\r?\n)+/).map(p=>p.trim()).filter(Boolean).map((paragraph,j)=><p className="journey-story-paragraph" key={j}>{paragraph}</p>)}{s.highlight && <p className="journey-highlight">{s.highlight}</p>}</div></article>)}</div>}
    <div className="lower-news-heading"><div><span className="lower-eyebrow">Chuyện của chúng mình</span><h3>Tin tức & câu chuyện</h3><p>Những hoạt động, lời kể và khoảnh khắc đáng nhớ của mùa trăng.</p></div><Link href="/posts" className="lower-link">Tất cả bài viết ↗</Link></div>
    <PostGallery />
  </div></section>;
}
