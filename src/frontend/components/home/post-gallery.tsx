"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

type Post = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  cover: { url: string; alt: string; thumbnail_url?: string | null } | null;
};

export function PostGallery() {
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [category, setCategory] = useState("");
  const [items, setItems] = useState<Post[]>([]);
  const [next, setNext] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [more, setMore] = useState(false);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/categories", { signal: controller.signal })
      .then(async (r) => {
        if (r.ok) setCategories((await r.json()).items);
      })
      .catch(() => {});
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/posts?limit=12${category ? "&category=" + category : ""}`, {
      signal: controller.signal,
    })
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw new Error(data.error);
        setItems(data.items);
        setNext(data.next_offset);
        setError("");
      })
      .catch((e) => {
        if (!controller.signal.aborted) setError(e.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [category, retry]);

  return (
    <div className="space-y-6">
      {/* Category filter pills */}
      <nav className="post-category-options flex flex-wrap items-center gap-2" aria-label="Danh mục tin tức">
        {[{ id: "", name: "Tất cả" }, ...categories].map((c) => (
          <button
            key={c.id} disabled={more} aria-pressed={category === c.id}
            onClick={() => {
              if (category === c.id) return;
              setLoading(true);
              setItems([]);
              setNext(null);
              setCategory(c.id);
            }}
            className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all duration-200 cursor-pointer shadow-sm ${
              category === c.id
                ? "bg-gradient-to-r from-amber-400 to-yellow-300 text-purple-950 font-black  shadow-amber-400/20"
                : "bg-purple-950/60 border border-purple-400/30 text-purple-200 hover:text-white hover:bg-purple-900/60"
            }`}
          >
            {c.name}
          </button>
        ))}
      </nav>

      {error && (
        <div role="alert" className="p-6 rounded-2xl border border-red-500/30 bg-red-950/30 text-center text-sm text-red-200">
          <span>{error}</span>{" "}
          <button
            onClick={() => {
              setLoading(true);
              setRetry((r) => r + 1);
            }}
            className="ml-2 underline font-bold text-amber-300"
          >
            Thử lại
          </button>
        </div>
      )}

      {loading ? (
        <div className="py-16 text-center text-sm font-mono text-purple-300/70">
          Đang tải những câu chuyện mùa trăng…
        </div>
      ) : (
        <div className="post-card-grid">
          {items.map((p) => (
            <Link
              href={`/posts/${p.slug}`}
              key={p.id}
              className="post-story-card group"
            >
              {p.cover && (
                <div className="post-cover">
                  <Image
                    src={p.cover.thumbnail_url || p.cover.url}
                    alt={p.cover.alt || p.title}
                    width={1920}
                    height={1280}
                    unoptimized
                    sizes="(max-width:768px) 100vw, 33vw"
                    className="post-cover-image"
                  />
                </div>
              )}
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="text-base sm:text-lg font-bold text-white group-hover:text-amber-300 transition-colors leading-snug">
                    {p.title}
                  </h4>
                  {p.excerpt && (
                    <p className="mt-2 text-sm text-purple-200/80 line-clamp-2 leading-relaxed">
                      {p.excerpt}
                    </p>
                  )}
                </div>
                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                  <span className="post-read-link text-sm font-bold text-amber-300 inline-flex items-center gap-2">
                    <span>Đọc bài viết</span>

                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {!loading && items.length > 1 && <p className="touch-hint post-swipe-hint"> Vuốt ngang để xem thêm câu chuyện</p>}

      {!loading && !items.length && !error && (
        <p className="py-12 text-center text-sm text-purple-200">
          Những câu chuyện mùa trăng đang được chuẩn bị. Hẹn bạn quay lại để cùng nhìn ngắm những khoảnh khắc mới.
        </p>
      )}

      {next !== null && (
        <div className="pt-6 text-center">
          <button
            disabled={more}
            onClick={async () => {
              setMore(true);
              try {
                const r = await fetch(
                  `/api/posts?limit=12&offset=${next}${category ? "&category=" + category : ""}`
                );
                const d = await r.json();
                if (!r.ok) throw new Error(d.error);
                setError("");
                setItems((old) =>
                  [...old, ...d.items].filter((p, i, a) => a.findIndex((x) => x.id === p.id) === i)
                );
                setNext(d.next_offset);
              } catch (e) {
                setError((e as Error).message);
              } finally {
                setMore(false);
              }
            }}
            className="festival-button rounded-full px-8 py-3 text-sm font-black uppercase text-purple-950 shadow-lg hover: transition-all disabled:opacity-50 cursor-pointer"
          >
            {more ? "Đang tải…" : "Xem thêm bài viết"}
          </button>
        </div>
      )}
    </div>
  );
}
