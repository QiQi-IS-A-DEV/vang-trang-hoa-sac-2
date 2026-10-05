"use client";

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { createFestivalChimes, soundtrackUrl } from '@/frontend/lib/festival-sound';
import { FestivalIcon } from './festival-icon';

export function MusicPlayer() {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');
  const [playing, setPlaying] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const sound = useRef<ReturnType<typeof createFestivalChimes> | null>(null);
  const audio = useRef<HTMLAudioElement | null>(null);
  const operation = useRef(0);

  useEffect(() => {
    // Both start only after an explicit tap. Hide/pause sound inside the admin.
    function pause() {
      operation.current++;
      if (sound.current) void sound.current.pause();
      audio.current?.pause();
      setPlaying(false); setBusy(false);
    }
    function visibility() { if (document.hidden) pause(); }
    if (isAdmin) pause();
    document.addEventListener('visibilitychange', visibility);
    return () => document.removeEventListener('visibilitychange', visibility);
  }, [isAdmin]);

  useEffect(() => () => {
    operation.current++;
    sound.current?.dispose(); audio.current?.pause();
    sound.current = null; audio.current = null;
  }, []);

  async function toggle() {
    if (busy) return;
    const attempt = ++operation.current;
    setBusy(true); setError('');
    try {
      if (playing) {
        if (sound.current) await sound.current.pause();
        audio.current?.pause();
        setPlaying(false);
      } else {
        if (soundtrackUrl) {
          if (!audio.current) { audio.current = new Audio(soundtrackUrl); audio.current.loop = true; audio.current.volume = .25; }
          await audio.current.play();
        } else {
          sound.current ??= createFestivalChimes();
          await sound.current.play();
        }
        if (attempt === operation.current) setPlaying(true);
        else { if (sound.current) await sound.current.pause(); audio.current?.pause(); }
      }
    } catch {
      setPlaying(false);
      setError('Chưa bật được tiếng. Chạm để thử lại.');
    } finally { if (attempt === operation.current) setBusy(false); }
  }

  if (isAdmin) return null;
  return <div className="music-control">
    {error && <p className="sound-error" role="alert">{error}</p>}
    <button type="button" onClick={toggle} aria-pressed={playing} aria-busy={busy} disabled={busy} className="sound-toggle" title={soundtrackUrl ? 'Nhạc nền chương trình' : 'Giai điệu chuông mùa trăng'}>
      <FestivalIcon name={playing ? 'sound' : 'mute'} />
      <span className="music-label">{busy ? 'Đang bật…' : playing ? 'Tắt tiếng' : 'Bật tiếng'}</span>
      {playing && <span className="sound-playing" aria-hidden="true"><i/><i/><i/></span>}
    </button>
  </div>;
}
