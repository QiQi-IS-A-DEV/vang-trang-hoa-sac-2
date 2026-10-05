"use client";

import { useState } from "react";
import Image from "next/image";

interface TeamAvatarProps {
  src?: string;
  alt: string;
  name: string;
  aspectRatio?: "square" | "portrait" | "card";
  className?: string;
  badge?: string;
}

export function TeamAvatar({
  src,
  alt,
  name,
  aspectRatio = "portrait",
  className = "",
  badge,
}: TeamAvatarProps) {
  const [hasError, setHasError] = useState(false);

  // Generate deterministic gradient & initials
  const initials = name
    .trim()
    .split(" ")
    .slice(-2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

  const aspectClass =
    aspectRatio === "portrait"
      ? "aspect-[3/4]"
      : aspectRatio === "card"
      ? "aspect-[4/5]"
      : "aspect-square";

  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-900/80 via-purple-950 to-pink-950/60 border border-white/10 group ${aspectClass} ${className}`}
    >
      {src && !hasError ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          unoptimized
          className="object-contain"
          onError={() => setHasError(true)}
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
          <div className="relative mb-3 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-tr from-amber-400/30 via-pink-400/30 to-purple-400/20 p-1 border border-amber-300/40 shadow-inner">
            <span className="text-2xl font-bold tracking-wider text-amber-200">
              {initials || "VTHS"}
            </span>
          </div>
          <span className="text-xs font-medium text-purple-200/80 line-clamp-1">{name}</span>
          <span className="mt-1 text-[10px] text-pink-300/60 tracking-wider uppercase font-semibold">
            Vầng Trăng Hòa Sắc
          </span>
        </div>
      )}

      {badge && (
        <div className="absolute top-3 right-3 z-10 rounded-full bg-amber-400/90 px-2.5 py-0.5 text-[11px] font-bold text-purple-950 shadow-md backdrop-blur-sm">
          {badge}
        </div>
      )}

      {/* Decorative gradient overlay */}
    </div>
  );
}
