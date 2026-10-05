"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { TransformComponent, TransformWrapper } from "react-zoom-pan-pinch";
import { messageTreePosition } from "@/data/tree-slots";
import { Banyan } from "./banyan";
import type { LeafType, MemoryMessage } from "@/types";

const symbols: Record<LeafType, string> = { leaf: "🏮", lantern: "🏮", star: "⭐" };

function Ornament({ type }: { type: LeafType }) {
  if (type === "star") {
    return (
      <svg viewBox="0 0 44 68" className="h-full w-full overflow-visible" aria-hidden="true">
        <defs>
          <linearGradient id="star-gold-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fffbeb" />
            <stop offset="40%" stopColor="#fde047" />
            <stop offset="100%" stopColor="#eab308" />
          </linearGradient>
        </defs>
        {/* Dây treo ánh vàng */}
        <line x1="22" y1="0" x2="22" y2="18" stroke="#fef08a" strokeWidth="1.4" strokeDasharray="2 1" />
        {/* Vòng hào quang phát sáng */}
        <circle cx="22" cy="36" r="17" fill="#fde047" fillOpacity="0.25" />
        {/* Vòng tròn khung đèn ông sao truyền thống */}
        <circle cx="22" cy="36" r="13" fill="none" stroke="#f87171" strokeWidth="1.2" opacity="0.85" />
        {/* Ngôi sao 5 cánh */}
        <path
          d="M 22 18 L 26.5 30 L 39 31.5 L 30 40 L 32.5 52 L 22 45.5 L 11.5 52 L 14 40 L 5 31.5 L 17.5 30 Z"
          fill="url(#star-gold-grad)"
          stroke="#fff"
          strokeWidth="1.2"
          filter="drop-shadow(0 0 6px rgba(250, 204, 21, 0.8))"
        />
        {/* Tâm đèn màu đỏ */}
        <circle cx="22" cy="36" r="4" fill="#dc2626" stroke="#fef08a" strokeWidth="0.8" />
      </svg>
    );
  }

  // Lồng đèn truyền thống Trung thu
  return (
    <svg viewBox="0 0 44 68" className="h-full w-full overflow-visible" aria-hidden="true">
      <defs>
        <radialGradient id="lantern-glow-grad" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#fed7aa" />
          <stop offset="35%" stopColor="#fb923c" />
          <stop offset="70%" stopColor="#ef4444" />
          <stop offset="100%" stopColor="#991b1b" />
        </radialGradient>
      </defs>
      {/* Dây treo */}
      <line x1="22" y1="0" x2="22" y2="18" stroke="#fef08a" strokeWidth="1.4" />
      {/* Nẹp trên */}
      <rect x="13" y="17" width="18" height="4" rx="2" fill="#d97706" stroke="#fef08a" strokeWidth="0.8" />
      {/* Thân lồng đèn đỏ cam phát sáng rực rỡ */}
      <rect
        x="8"
        y="21"
        width="28"
        height="32"
        rx="10"
        fill="url(#lantern-glow-grad)"
        stroke="#fef08a"
        strokeWidth="1.2"
        filter="drop-shadow(0 0 8px rgba(239, 68, 68, 0.75))"
      />
      {/* Nan đèn */}
      <path d="M 16 22 C 11 31 11 43 16 52" fill="none" stroke="#fef08a" strokeWidth="1" opacity="0.75" />
      <path d="M 28 22 C 33 31 33 43 28 52" fill="none" stroke="#fef08a" strokeWidth="1" opacity="0.75" />
      <line x1="22" y1="22" x2="22" y2="52" stroke="#fef08a" strokeWidth="1.2" opacity="0.85" />
      {/* Nẹp đáy */}
      <rect x="14" y="53" width="16" height="3" rx="1.5" fill="#d97706" stroke="#fef08a" strokeWidth="0.6" />
      {/* Tua rua vàng buông lơi */}
      <path d="M 18 56 L 17 66 M 22 56 L 22 67 M 26 56 L 27 66" stroke="#fef08a" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function MemoryTree({ messages }: { messages: MemoryMessage[] }) {
  const [chosenPage, setChosenPage] = useState<number | null>(null);
  const [selected, setSelected] = useState<MemoryMessage | null>(null);
  const [swaying, setSwaying] = useState(true);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const reducedMotion = useReducedMotion();

  const pages = [...new Set(messages.map((item) => messageTreePosition(item.slot_index).page))].sort((a, b) => a - b);
  if (!pages.length) pages.push(0);
  const currentPage = chosenPage !== null && pages.includes(chosenPage) ? chosenPage : pages[pages.length - 1];
  const currentIndex = pages.indexOf(currentPage);
  const visible = messages.filter((item) => messageTreePosition(item.slot_index).page === currentPage);

  useEffect(() => {
    if (selected && !dialogRef.current?.open) dialogRef.current?.showModal();
  }, [selected]);

  return (
    <section aria-labelledby="tree-heading" className="wishing-tree relative mt-8 overflow-hidden rounded-[2.5rem] border border-amber-300/20 bg-gradient-to-b from-[#250d35] via-[#1a0827] to-[#12041c] shadow-2xl">
      {/* Tree header stats */}
      <div className="relative z-10 flex flex-wrap items-start justify-between gap-4 px-6 pt-6 md:px-10">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/30 bg-amber-400/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-amber-200">
            <span>🌕</span> Kỷ niệm ngàn điều muốn nói <span>🌕</span>
          </div>
          <h2 id="tree-heading" className="mt-2 text-2xl font-black text-white md:text-3xl">
            Cây Mùa Trăng
          </h2>
        </div>

        <div className="flex items-center gap-2 rounded-full border border-amber-300/30 bg-purple-950/60 px-5 py-2 text-sm text-amber-200 shadow-md backdrop-blur-md">
          <span className="text-lg">🏮</span>
          <span>
            <strong className="mr-1.5 text-xl font-bold text-white">{messages.length}</strong>
            lời nhắn đã gửi
          </span>
        </div>
      </div>

      <TransformWrapper
        key={currentPage}
        minScale={1}
        maxScale={3}
        centerOnInit
        wheel={{ disabled: true }}
        panning={{ excluded: ["button", "a"] }}
        doubleClick={{ disabled: true }}
      >
        {({ zoomIn, zoomOut, resetTransform }) => (
          <>
            <TransformComponent wrapperStyle={{ width: "100%" }} contentStyle={{ width: "100%" }}>
              <div className="tree-canvas relative w-full" style={{ aspectRatio: "800 / 560" }}>
                <div className="tree-ground-glow" aria-hidden="true" />
                <Banyan moving={swaying && !reducedMotion} />

                {/* Lồng đèn và ngôi sao treo trên cành */}
                {visible.map((item) => {
                  const { slot } = messageTreePosition(item.slot_index);
                  return (
                    <motion.button
                      key={item.id}
                      initial={reducedMotion ? false : { opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5 }}
                      onClick={() => setSelected(item)}
                      aria-label={`Đọc lời nhắn của ${item.author_name}`}
                      title={`${item.author_name}: "${item.message.slice(0, 50)}..."`}
                      className="tree-ornament absolute -translate-x-1/2 rounded-lg cursor-pointer focus-visible:outline-2 focus-visible:outline-amber-200 transition-transform hover:scale-125 hover:z-20"
                      style={{ left: `${slot.x / 8}%`, top: `${slot.y / 5.6}%` }}
                    >
                      <span
                        className={`block h-full w-full ${swaying && !reducedMotion ? "ornament-sway" : ""}`}
                        style={{
                          transformOrigin: "top center",
                          transform: `rotate(${slot.angle}deg)`,
                          animationDelay: `${(item.slot_index % 7) * -0.7}s`,
                        }}
                      >
                        <Ornament type={item.leaf_type} />
                      </span>
                    </motion.button>
                  );
                })}
              </div>
            </TransformComponent>

            {/* Controls */}
            <div className="absolute top-1/2 right-4 z-10 -translate-y-1/2 flex flex-col gap-2 md:right-7">
              <button aria-label="Phóng to cây" className="tree-control" onClick={() => zoomIn()}>
                ＋
              </button>
              <button aria-label="Thu nhỏ cây" className="tree-control" onClick={() => zoomOut()}>
                −
              </button>
              <button aria-label="Đưa cây về kích thước ban đầu" className="tree-control text-xs" onClick={() => resetTransform()}>
                ↺
              </button>
            </div>
          </>
        )}
      </TransformWrapper>

      {/* Tree footer action */}
      <div className="relative z-10 -mt-2 flex flex-col items-center px-6 pb-8">
        <a
          href="#leave-message"
          className="festival-button rounded-full px-8 py-3.5 font-bold text-purple-950 shadow-xl transition-transform hover:-translate-y-1"
        >
          Treo một lời nhắn lên cây <span aria-hidden="true">✧</span>
        </a>
        <p className="mt-3 text-center text-xs text-purple-200">
          Chạm vào lồng đèn hoặc ngôi sao trên cây để đọc kỷ niệm mùa trăng.
        </p>

        <div className="mt-5 flex flex-wrap items-center justify-center gap-5 text-xs text-purple-200/90">
          <button
            aria-pressed={!swaying}
            onClick={() => setSwaying(!swaying)}
            className="hover:text-amber-300 underline underline-offset-4 transition-colors"
          >
            {swaying ? "Dừng gió đung đưa" : "Bật gió đung đưa"}
          </button>
          {pages.length > 1 && (
            <div className="flex items-center gap-3">
              <button
                aria-label="Tán cây trước"
                disabled={currentIndex === 0}
                onClick={() => setChosenPage(pages[currentIndex - 1])}
                className="disabled:opacity-30 hover:text-amber-300"
              >
                ←
              </button>
              <span>Tán {currentPage + 1} / {pages.length}</span>
              <button
                aria-label="Tán cây sau"
                disabled={currentIndex === pages.length - 1}
                onClick={() => setChosenPage(pages[currentIndex + 1])}
                className="disabled:opacity-30 hover:text-amber-300"
              >
                →
              </button>
              {currentIndex !== pages.length - 1 && (
                <button className="underline hover:text-amber-300" onClick={() => setChosenPage(null)}>
                  Mới nhất
                </button>
              )}
            </div>
          )}
          <span className="text-purple-300/60">Có thể dùng chuột/ngón tay để kéo và phóng to</span>
        </div>
      </div>

      {/* Dialog xem lời nhắn */}
      <dialog
        ref={dialogRef}
        aria-labelledby="memory-dialog-title"
        onClose={() => setSelected(null)}
        onClick={(event) => {
          if (event.target === event.currentTarget) dialogRef.current?.close();
        }}
        className="memory-dialog m-auto w-[calc(100%-2rem)] max-w-lg rounded-3xl p-7 shadow-2xl backdrop:bg-purple-950/75 border border-amber-300/40"
      >
        {selected && (
          <>
            <div className="flex items-start justify-between gap-4">
              <span className="inline-block rounded-full bg-amber-400/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-purple-900">
                Kỷ niệm trên cây
              </span>
              <button
                aria-label="Đóng lời nhắn"
                onClick={() => dialogRef.current?.close()}
                className="rounded-full px-2 text-2xl text-purple-900 hover:bg-black/5"
              >
                ×
              </button>
            </div>
            <h3 id="memory-dialog-title" className="mt-4 break-words text-2xl font-bold text-purple-950">
              {symbols[selected.leaf_type]} {selected.author_name}
            </h3>
            {selected.role_team && (
              <p className="mt-1 font-semibold text-sm text-pink-700">
                {selected.role_team}
              </p>
            )}
            <p className="mt-5 whitespace-pre-wrap break-words leading-relaxed text-purple-950 text-base">
              {selected.message}
            </p>
            <time className="mt-6 block text-xs text-purple-800/70" dateTime={selected.created_at}>
              {new Intl.DateTimeFormat("vi-VN", {
                timeZone: "Asia/Ho_Chi_Minh",
                dateStyle: "medium",
                timeStyle: "short",
              }).format(new Date(selected.created_at))}
            </time>
          </>
        )}
      </dialog>
    </section>
  );
}
