"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useSiteSettings } from "@/frontend/lib/hooks/use-site-settings";

const destinations = [
  { href: "/", label: "Trang chủ" },
  { href: "/#advisors", label: "Đội ngũ" },
  { href: "/#volunteers", label: "Thẻ tình nguyện viên" },
  { href: "/#recap", label: "Dấu ấn chương trình" },
  { href: "/posts", label: "Tin tức" },
  { href: "/memories", label: "Cây kỷ niệm" },
];

export function NavigationDrawer() {
  const pathname = usePathname();
  const settings = useSiteSettings();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  const isAdmin = pathname.startsWith("/admin");

  useEffect(() => {
    dialogRef.current?.close();
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const desktop = window.matchMedia("(min-width: 48rem)");
    const closeOnDesktop = () => {
      if (desktop.matches) dialogRef.current?.close();
    };
    desktop.addEventListener("change", closeOnDesktop);
    return () => {
      document.body.style.overflow = previousOverflow;
      desktop.removeEventListener("change", closeOnDesktop);
    };
  }, [open]);

  return (
    <>
      {!isAdmin && <button
        type="button"
        className="festival-menu-toggle"
        aria-label="Mở menu điều hướng"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls="festival-navigation-drawer"
        onClick={() => {
          dialogRef.current?.showModal();
          setOpen(true);
          dialogRef.current?.focus();
        }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
          <path d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>}
      <dialog
        ref={dialogRef}
        id="festival-navigation-drawer"
        className="festival-navigation-drawer"
        aria-labelledby="festival-drawer-title"
        tabIndex={-1}
        onClose={() => setOpen(false)}
        onKeyDown={(event) => {
          if (event.key !== "Tab") return;
          const controls = event.currentTarget.querySelectorAll<HTMLElement>("a[href], button");
          const first = controls[0];
          const last = controls[controls.length - 1];
          if (event.shiftKey && (document.activeElement === first || document.activeElement === event.currentTarget)) {
            event.preventDefault();
            last?.focus();
          } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first?.focus();
          }
        }}
        onClick={(event) => {
          if (event.target !== event.currentTarget) return;
          const bounds = event.currentTarget.getBoundingClientRect();
          if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) {
            event.currentTarget.close();
          }
        }}
      >
        <div className="festival-drawer-header">
          <h2 id="festival-drawer-title">Khám phá mùa trăng</h2>
          <button type="button" className="festival-drawer-close" aria-label="Đóng menu điều hướng" onClick={() => dialogRef.current?.close()}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true"><path d="m6 6 12 12M6 18 18 6" /></svg>
          </button>
        </div>
        <div className="festival-drawer-brand">
          <Image src={settings.logoUrl || "/branding/Logo_VTHS.png"} alt="" width={44} height={44} unoptimized className="festival-brand-logo" />
          <span>{settings.heroTitle}</span>
        </div>
        <nav aria-label="Điều hướng mobile" className="festival-drawer-nav">
          {destinations.map(({ href, label }) => {
            const current = !href.includes("#") && (href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`));
            return <Link key={href} href={href} aria-current={current ? "page" : undefined} onClick={() => dialogRef.current?.close()}>{label}<span aria-hidden="true">›</span></Link>;
          })}
        </nav>
      </dialog>
    </>
  );
}
