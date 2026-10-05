"use client";
import { useRef, useState } from "react";
import Image from "next/image";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { FestivalIcon } from '../ui/festival-icon';
export function OriginalImage({ src, thumbnailSrc, alt, className = "", label = "Xem ảnh đầy đủ", naturalSize = false, showLabel = true }: { src: string; thumbnailSrc?:string|null; alt: string; className?: string; label?: string; naturalSize?: boolean; showLabel?: boolean }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [opened, setOpened] = useState(false);
  const [failed, setFailed] = useState(false);
  return <>
    <button type="button" className={`original-image ${naturalSize ? 'image-natural' : ''} ${className}`} aria-label={`${label}: ${alt}`} onClick={() => { setOpened(true); dialog.current?.showModal(); }}>
      {failed ? <span className="image-unavailable">Ảnh chưa tải được. Bấm để mở ảnh đầy đủ và thử lại.</span> : naturalSize ? <Image src={thumbnailSrc||src} alt={alt} width={2400} height={1600} unoptimized sizes="100vw" className="image-natural-preview" onError={() => setFailed(true)} /> : <Image src={thumbnailSrc||src} alt={alt} fill unoptimized sizes="100vw" className="object-contain" onError={() => setFailed(true)} />}{showLabel&&<span className="image-action">{label}<FestivalIcon name="star" /></span>}
    </button>
    <dialog ref={dialog} className="image-dialog" aria-label={alt} onClose={() => setOpened(false)} onClick={e => { if (e.target === e.currentTarget) dialog.current?.close(); }}>
      <header><span>{alt}</span><button type="button" aria-label="Đóng ảnh" onClick={() => dialog.current?.close()}>Đóng ×</button></header>
      {opened && <TransformWrapper initialScale={1} minScale={1} maxScale={6}>
        {({ zoomIn, zoomOut, resetTransform }) => <>
          <div className="image-tools"><button type="button" onClick={() => zoomOut()}>Thu nhỏ −</button><button type="button" onClick={() => zoomIn()}>Phóng to +</button><button type="button" onClick={() => resetTransform()}>Đặt lại</button><a href={src} download target="_blank" rel="noreferrer"><FestivalIcon name="moon" /> Mở / tải ảnh đầy đủ</a></div>
          <p className="touch-hint image-touch-hint">Chụm hai ngón để phóng to · kéo để xem ảnh</p>
          <TransformComponent wrapperClass="image-zoom" contentClass="image-zoom-content"><Image src={src} alt={alt} unoptimized width={2400} height={1600} className="original-full" /></TransformComponent>
        </>}
      </TransformWrapper>}
    </dialog>
  </>;
}
