"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

export function MusicPlayer() {
  const pathname = usePathname();
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const isAdmin = pathname?.startsWith('/admin');

  // Nhạc nền hòa tấu không lời Trung thu êm dịu (royalty-free instrumental)
  const audioSrc = "https://cdn.pixabay.com/download/audio/2022/05/16/audio_c848529244.mp3?filename=traditional-asian-melody-111762.mp3";

  useEffect(() => {
    const audio = new Audio(audioSrc);
    audio.loop = true;
    audio.volume = 0.35; // Âm lượng nhẹ nhàng êm tai
    audioRef.current = audio;

    return () => {
      audio.pause();
      audioRef.current = null;
    };
  }, []);

  function togglePlay() {
    if (!audioRef.current) return;
    setHasInteracted(true);
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch((e) => {
        console.warn("Không thể phát nhạc tự động:", e);
      });
    }
  }

  if (isAdmin) return null;

  return (
    <div className="music-control fixed bottom-6 right-6 z-40">
      <button
        onClick={togglePlay}
        aria-label={isPlaying ? "Tắt nhạc nền" : "Bật nhạc nền Trung Thu"}
        title={isPlaying ? "Tắt nhạc nền" : "Bật nhạc nền Trung Thu êm dịu"}
        className={`group flex items-center gap-2.5 rounded-full border px-4 py-2.5 shadow-2xl backdrop-blur-md transition-all duration-300 hover:scale-105 ${
          isPlaying
            ? "border-amber-300 bg-gradient-to-r from-amber-500/90 to-yellow-400/90 text-purple-950 font-bold shadow-amber-500/20"
            : "border-white/20 bg-purple-950/80 text-purple-200 hover:border-amber-300/60 hover:text-white"
        }`}
      >
        {/* Equalizer animation khi phát nhạc */}
        {isPlaying ? (
          <div className="flex items-end gap-0.5 h-4 w-4">
            <span className="w-1 bg-purple-950 rounded-full animate-[bounce_1s_infinite_100ms] h-full" />
            <span className="w-1 bg-purple-950 rounded-full animate-[bounce_1s_infinite_300ms] h-3" />
            <span className="w-1 bg-purple-950 rounded-full animate-[bounce_1s_infinite_200ms] h-4" />
          </div>
        ) : (
          <span className="text-base group-hover:rotate-12 transition-transform">🏮</span>
        )}

        <span className="music-label text-xs tracking-wide">
          {isPlaying ? "Giai điệu mùa trăng" : "Bật nhạc Trung Thu"}
        </span>

        {!hasInteracted && !isPlaying && (
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
          </span>
        )}
      </button>
    </div>
  );
}
