"use client";

import { useEffect, useRef, useState } from "react";

type SignLanguage = "ASL" | "BSL" | "ISL" | "LSF";
type Channel = "camera" | "avatar" | "video";

const languages: SignLanguage[] = ["ASL", "BSL", "ISL", "LSF"];

export default function SignLanguagePanel() {
  const [language, setLanguage] = useState<SignLanguage>("ASL");
  const [channel, setChannel] = useState<Channel>("camera");
  const [cameraAuthorized, setCameraAuthorized] = useState(false);
  const [active, setActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => () => streamRef.current?.getTracks().forEach((track) => track.stop()), []);

  async function startCamera() {
    if (!cameraAuthorized) return;
    setCameraError(null);
    try {
      if (!navigator.mediaDevices?.getUserMedia) throw new Error("Camera access isn't supported by this browser.");
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: false });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setActive(true);
    } catch (error) {
      setActive(false);
      setCameraError(error instanceof Error ? error.message : "Camera access couldn't be started.");
    }
  }

  function stopCamera() {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setActive(false);
  }

  function toggleAuthorization() {
    if (cameraAuthorized) stopCamera();
    setCameraAuthorized((value) => !value);
    setCameraError(null);
  }

  const cameraMode = channel === "camera";

  return (
    <section className="rounded-2xl border border-violet-300/20 bg-slate-950 p-6 shadow-2xl">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-violet-300">Echo Sign Language</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">Communicate visually.</h2>
          <p className="mt-2 max-w-2xl text-sm text-white/60">Camera recognition and signed output are separate channels, with camera access requiring explicit authorization.</p>
        </div>
        <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/50">{language} · Multimodal</span>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <label className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <span className="text-xs text-white/40">Sign language</span>
          <select value={language} onChange={(event) => setLanguage(event.target.value as SignLanguage)} className="mt-2 w-full rounded-lg bg-slate-900 p-2 text-sm text-white">
            {languages.map((item) => <option key={item}>{item}</option>)}
          </select>
        </label>
        <label className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <span className="text-xs text-white/40">Communication channel</span>
          <select value={channel} onChange={(event) => { stopCamera(); setChannel(event.target.value as Channel); }} className="mt-2 w-full rounded-lg bg-slate-900 p-2 text-sm text-white">
            <option value="camera">Camera recognition</option>
            <option value="avatar">Signing avatar</option>
            <option value="video">Signed video</option>
          </select>
        </label>
      </div>

      <div className="mt-4 rounded-xl border border-white/10 bg-black/20 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-white">{language} · {channel}</p>
            <p className="mt-1 text-xs text-white/40">{cameraAuthorized ? "Camera authorization granted for this session." : "Camera authorization is off."}</p>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={toggleAuthorization} className="rounded-lg border border-white/10 px-3 py-2 text-xs text-white/70">{cameraAuthorized ? "Revoke camera" : "Authorize camera"}</button>
            <button type="button" disabled={cameraMode && !cameraAuthorized} onClick={active ? stopCamera : startCamera} className="rounded-lg bg-violet-300 px-3 py-2 text-xs font-medium text-slate-950 disabled:cursor-not-allowed disabled:opacity-30">{active ? "Stop" : "Start"}</button>
          </div>
        </div>
      </div>

      <div className="mt-4 flex aspect-video items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-slate-900 via-violet-950/30 to-slate-950">
        {cameraMode && active ? (
          <video ref={videoRef} autoPlay playsInline muted className="h-full w-full object-cover" aria-label={`${language} sign language camera feed`} />
        ) : active ? (
          <div className="text-center">
            <div className="mx-auto h-24 w-32 rounded-2xl border border-violet-300/40 bg-violet-300/5 shadow-[0_0_60px_rgba(196,181,253,.18)]" />
            <p className="mt-4 text-sm text-violet-100">Signed output active</p>
            <p className="mt-1 text-xs text-white/40">{language}</p>
          </div>
        ) : (
          <p className="text-sm text-white/30">Sign communication is ready</p>
        )}
      </div>
      {cameraError && <p role="alert" className="mt-3 text-xs text-amber-200/80">{cameraError}</p>}
      {cameraMode && <p className="mt-3 text-xs text-white/30">The camera feed stays local to this session until an authorized recognition adapter is connected.</p>}
    </section>
  );
}
