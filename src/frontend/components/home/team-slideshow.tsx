'use client';

import { useEffect, useRef, useState } from 'react';
import { OriginalImage } from './original-image';
import type { TeamPoster } from '@/shared/data/team-posters';

const sectionHashes: Record<string, TeamPoster['section']> = {
  '#advisors': 'advisors', '#organizers': 'organizers', '#department-leads': 'departments',
};

export function TeamSlideshow({ slides }: { slides: TeamPoster[] }) {
  const [index, setIndex] = useState(0);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const swiped = useRef(false);
  const current = slides[index] ?? slides[0];

  useEffect(() => {
    const chooseSection = () => {
      const section = sectionHashes[window.location.hash];
      const found = slides.findIndex(slide => slide.section === section);
      if (found >= 0) setIndex(found);
      else setIndex(old => Math.min(old, Math.max(0, slides.length - 1)));
    };
    window.addEventListener('hashchange', chooseSection);
    const frame = requestAnimationFrame(chooseSection);
    return () => { window.removeEventListener('hashchange', chooseSection); cancelAnimationFrame(frame); };
  }, [slides]);

  if (!current) return null;
  const step = (direction: number) => setIndex(old => (old + direction + slides.length) % slides.length);

  return <section className="home-section team-slideshow" aria-label="Ảnh ban tổ chức, cố vấn và các ban" aria-roledescription="slideshow" onKeyDown={event => {
    if (event.target instanceof HTMLElement && event.target.closest('dialog')) return;
    if (event.key === 'ArrowLeft') { event.preventDefault(); step(-1); }
    if (event.key === 'ArrowRight') { event.preventDefault(); step(1); }
  }}>
    {Array.from(new Set(slides.map(slide => slide.section))).map(section => <span className="team-slide-anchor" id={section === 'departments' ? 'department-leads' : section} key={section} />)}
    <div className="section-inner">
      <div
        className="team-slideshow-stage group/poster"
        onTouchStart={event => {
          const touch = event.touches[0]; touchStart.current = { x: touch.clientX, y: touch.clientY };
        }}
        onTouchEnd={event => {
          const start = touchStart.current, touch = event.changedTouches[0]; touchStart.current = null;
          if (!start || !touch) return;
          const dx = touch.clientX - start.x, dy = touch.clientY - start.y;
          if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) {
            swiped.current = true; step(dx < 0 ? 1 : -1);
            setTimeout(() => { swiped.current = false; }, 350);
          }
        }}
        onClickCapture={event => {
          if (swiped.current) { event.preventDefault(); event.stopPropagation(); swiped.current = false; }
        }}
      >
        {/* Vầng hào quang nhẹ sau khung poster */}
        <div
          className="pointer-events-none absolute -inset-2 sm:-inset-4 -z-10 rounded-3xl sm:rounded-[36px] bg-gradient-to-r from-amber-400/20 via-fuchsia-500/25 to-amber-400/20 blur-2xl opacity-40 group-hover/poster:opacity-100 transition-opacity duration-500"
          aria-hidden="true"
        />

        {/* Khung poster chính kèm hiệu ứng viền phát sáng */}
        <div className="team-slideshow-frame">
          {/* Dải sáng viền chạy quanh (animated running border beam) */}
          <div className="team-border-beam" aria-hidden="true" />

          {/* Khung ảnh chính */}
          <div className="team-poster-inner">
            <OriginalImage key={current.src} src={current.src} alt={current.title} className="team-slideshow-image" label="Phóng to ảnh gốc" />
          </div>

          {/* Nút mũi tên trái ở rìa ảnh */}
          <button
            type="button"
            onClick={event => {
              event.preventDefault();
              event.stopPropagation();
              step(-1);
            }}
            onTouchStart={event => event.stopPropagation()}
            disabled={slides.length < 2}
            aria-label="Ảnh trước"
            className="team-nav-arrow team-nav-prev"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Nút mũi tên phải ở rìa ảnh */}
          <button
            type="button"
            onClick={event => {
              event.preventDefault();
              event.stopPropagation();
              step(1);
            }}
            onTouchStart={event => event.stopPropagation()}
            disabled={slides.length < 2}
            aria-label="Ảnh tiếp theo"
            className="team-nav-arrow team-nav-next"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </section>;
}
