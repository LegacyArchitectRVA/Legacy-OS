"use client";

import { useEffect, useRef } from "react";

interface SignVideoVoicePlayerProps {
  videoUri: string;
  audioUri?: string;
  transcript?: string;
}

export default function SignVideoVoicePlayer({ videoUri, audioUri, transcript }: SignVideoVoicePlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    const audio = audioRef.current;
    if (!video || !audioUri || !audio) return;

    const sync = () => {
      if (Math.abs(audio.currentTime - video.currentTime) > 0.08) audio.currentTime = video.currentTime;
      if (video.paused) audio.pause();
      else void audio.play().catch(() => undefined);
    };
    const play = () => void audio.play().catch(() => undefined);
    const pause = () => audio.pause();
    const seek = () => { audio.currentTime = video.currentTime; };
    const end = () => audio.pause();

    video.addEventListener("timeupdate", sync);
    video.addEventListener("play", play);
    video.addEventListener("pause", pause);
    video.addEventListener("seeking", seek);
    video.addEventListener("ended", end);
    return () => {
      video.removeEventListener("timeupdate", sync);
      video.removeEventListener("play", play);
      video.removeEventListener("pause", pause);
      video.removeEventListener("seeking", seek);
      video.removeEventListener("ended", end);
    };
  }, [audioUri]);

  return (
    <section className="overflow-hidden rounded-2xl border border-cyan-300/20 bg-slate-950 shadow-2xl">
      <div className="relative aspect-video bg-black">
        <video ref={videoRef} src={videoUri} controls playsInline className="h-full w-full" aria-label="Signed video with optional voice-over" />
        {audioUri && <audio ref={audioRef} src={audioUri} preload="auto" />}
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">Sign + Voice</p>
          <span className="rounded-full border border-white/10 px-2.5 py-1 text-xs text-white/50">{audioUri ? "Synchronized" : "Original only"}</span>
        </div>
        {transcript && <p className="mt-3 text-sm leading-6 text-white/65">{transcript}</p>}
        {!audioUri && <p className="mt-2 text-xs text-white/35">A verified transcript and generated voice track are required before voice playback is enabled.</p>}
      </div>
    </section>
  );
}
