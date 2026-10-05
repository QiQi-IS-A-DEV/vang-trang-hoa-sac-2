type IconName = 'lantern' | 'moon' | 'star' | 'rabbit' | 'sound' | 'mute';

/** Small decorations share the site's colours; labels carry the action's meaning. */
export function FestivalIcon({ name = 'lantern', className = '' }: { name?: IconName; className?: string }) {
  return <svg className={`festival-icon ${className}`} viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
    {name === 'lantern' && <><path d="M16 2v4M11 7h10M11 25h10M16 26v4m-3-2v2m6-2v2"/><path d="M16 7c-15 0-15 18 0 18s15-18 0-18Z" fill="currentColor" fillOpacity=".12"/><path d="M16 7c-6 4-6 14 0 18m0-18c6 4 6 14 0 18M6 16h20"/></>}
    {name === 'moon' && <><path d="M24 20A11 11 0 0 1 13 5 11 11 0 1 0 24 20Z" fill="currentColor" fillOpacity=".18"/><path d="m24 4 1.2 3.8L29 9l-3.8 1.2L24 14l-1.2-3.8L19 9l3.8-1.2L24 4Z"/></>}
    {name === 'star' && <><path d="m16 3 3.8 8.1 9 1.1-6.6 6.1 1.8 8.8-8-4.5-8 4.5 1.8-8.8-6.6-6.1 9-1.1L16 3Z" fill="currentColor" fillOpacity=".16"/><path d="m16 8 2.1 6 6 .5-4.7 3.8 1.3 5.9-4.7-3.5-4.7 3.5 1.3-5.9L8 14.5l6-.5L16 8Z"/></>}
    {name === 'rabbit' && <><path d="M10 15C3 1 11-3 15 13m3 0c0-14 9-15 7-5l-3 8"/><path d="M7 23c-2-7 4-11 10-10s10 5 9 10c-1 7-17 8-19 0Z" fill="currentColor" fillOpacity=".12"/><path d="M12 20h.1m9 0h.1M15 23l2 1 2-1m-2 1v2"/></>}
    {(name === 'sound' || name === 'mute') && <><path d="M5 12h6l7-6v20l-7-6H5V12Z" fill="currentColor" fillOpacity=".12"/>{name === 'sound' ? <><path d="M23 11a8 8 0 0 1 0 10m4-13a13 13 0 0 1 0 16"/></> : <path d="m23 12 6 8m0-8-6 8"/>}</>}
  </svg>;
}
