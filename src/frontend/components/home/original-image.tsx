"use client";
import { useState } from "react";
import Image from "next/image";
export function OriginalImage({ src, thumbnailSrc, alt, className = "", naturalSize = false }: { src: string; thumbnailSrc?:string|null; alt: string; className?: string; naturalSize?: boolean }) {
  const [pressed, setPressed] = useState(false);
  const [failed, setFailed] = useState(false);
  return <div className={`original-image ${naturalSize ? 'image-natural' : ''} ${className}`} data-pressed={pressed||undefined} onPointerDown={e=>{if(e.pointerType!=='mouse')setPressed(true);}} onPointerUp={()=>setPressed(false)} onPointerCancel={()=>setPressed(false)} onPointerLeave={()=>setPressed(false)}>
      {failed ? <span className="image-unavailable" role="status">Ảnh chưa tải được. Hãy tải lại trang để thử lại.</span> : naturalSize ? <Image src={thumbnailSrc||src} alt={alt} width={2400} height={1600} unoptimized sizes="100vw" className="image-natural-preview" onError={() => setFailed(true)} /> : <Image src={thumbnailSrc||src} alt={alt} fill unoptimized sizes="100vw" className="object-contain" onError={() => setFailed(true)} />}
    </div>;
}
