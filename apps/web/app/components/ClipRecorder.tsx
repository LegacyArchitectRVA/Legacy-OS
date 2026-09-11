"use client";

import { useEffect, useRef, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";

type ClipKind = "audio" | "video";

type LegacyOsClipInsert = {
  id: string;
  user_id: string;
  title: string;
  kind: ClipKind;
  storage_path: string;
  duration_seconds: number;
};

type LegacyOsClipTable = {
  insert: (values: LegacyOsClipInsert) => Promise<{ error: { message: string } | null }>;
};

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60).toString().padStart(2, "0");
  const remainder = (seconds % 60).toString().padStart(2, "0");
  return `${minutes}:${remainder}`;
}

function extensionForMime(mime: string, kind: ClipKind) {
  if (mime.includes("mp4")) return kind === "video" ? "mp4" : "m4a";
  if (mime.includes("mpeg")) return "mp3";
  return "webm";
}

export default function ClipRecorder() {
  const [kind, setKind] = useState<ClipKind>("audio");
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [clipUrl, setClipUrl] = useState<string | null>(null);
  const [clipBlob, setClipBlob] = useState<Blob | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => () => {
    if (timerRef.current) clearInterval(timerRef.current);
    streamRef.current?.getTracks().forEach((track) => track.stop());
    if (clipUrl) URL.revokeObjectURL(clipUrl);
  }, [clipUrl]);

  const startRecording = async () => {
    setError(null);
    setSaved(false);
    setClipUrl(null);
    setClipBlob(null);
    chunksRef.current = [];

    if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
      setError("This browser does not support recording clips.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia(
        kind === "video" ? { audio: true, video: true } : { audio: true },
      );
      streamRef.current = stream;
      const preferredMimeTypes = kind === "video"
        ? ["video/webm;codecs=vp9,opus", "video/webm"]
        : ["audio/webm;codecs=opus", "audio/webm"];
      const mimeType = preferredMimeTypes.find((type) => MediaRecorder.isTypeSupported(type));
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || (kind === "video" ? "video/webm" : "audio/webm") });
        setClipBlob(blob);
        setClipUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      };

      recorder.start();
      setSeconds(0);
      setRecording(true);
      timerRef.current = setInterval(() => setSeconds((value) => value + 1), 1000);
    } catch {
      setError("Recording permission was not granted, or the microphone/camera is unavailable.");
    }
  };

  const stopRecording = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    mediaRecorderRef.current?.stop();
    mediaRecorderRef.current = null;
    setRecording(false);
  };

  const saveClip = async () => {
    if (!clipBlob || saving || saved) return;
    setSaving(true);
    setError(null);

    try {
      const supabase = getSupabaseBrowserClient();
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error("You must be signed in to save a clip.");

      const extension = extensionForMime(clipBlob.type, kind);
      const clipId = crypto.randomUUID();
      const storagePath = `${user.id}/${clipId}.${extension}`;
      const { error: uploadError } = await supabase.storage
        .from("legacy-os-clips")
        .upload(storagePath, clipBlob, { contentType: clipBlob.type, upsert: false });
      if (uploadError) throw uploadError;

      const clipTable = supabase.from("legacy_os_clips") as unknown as LegacyOsClipTable;
      const { error: insertError } = await clipTable.insert({
        id: clipId,
        user_id: user.id,
        title: kind === "video" ? "Video clip" : "Voice clip",
        kind,
        storage_path: storagePath,
        duration_seconds: seconds,
      });
      if (insertError) {
        await supabase.storage.from("legacy-os-clips").remove([storagePath]);
        throw new Error(insertError.message);
      }

      setSaved(true);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "The clip could not be saved.");
    } finally {
      setSaving(false);
    }
  };

  const shareClip = async () => {
    if (!clipBlob) return;
    const extension = extensionForMime(clipBlob.type, kind);
    const file = new File([clipBlob], `legacy-os-clip-${Date.now()}.${extension}`, { type: clipBlob.type });

    try {
      if (navigator.share && (!navigator.canShare || navigator.canShare({ files: [file] }))) {
        await navigator.share({ title: "Legacy OS clip", text: "A clip recorded in Legacy OS.", files: [file] });
        return;
      }
      const url = URL.createObjectURL(file);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = file.name;
      anchor.click();
      URL.revokeObjectURL(url);
    } catch (shareError) {
      if ((shareError as DOMException)?.name !== "AbortError") setError("The clip could not be shared from this browser.");
    }
  };

  const discardClip = () => {
    setClipBlob(null);
    setClipUrl(null);
    setSeconds(0);
    setSaved(false);
    setError(null);
  };

  return (
    <section className="rounded-xl border bg-background p-6 shadow-sm">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-semibold">Record a clip</h2>
        <p className="text-sm text-muted-foreground">Leave a short voice or video message for the people who may need it later.</p>
      </div>

      <div className="mt-5 flex flex-wrap gap-2" role="group" aria-label="Clip type">
        {(["audio", "video"] as ClipKind[]).map((option) => (
          <button
            key={option}
            type="button"
            disabled={recording}
            onClick={() => setKind(option)}
            className={`rounded-full border px-4 py-2 text-sm ${kind === option ? "bg-foreground text-background" : "bg-background"}`}
          >
            {option === "audio" ? "Voice clip" : "Video clip"}
          </button>
        ))}
      </div>

      <div className="mt-5 flex items-center gap-4">
        {!recording ? (
          <button type="button" onClick={startRecording} className="rounded-lg bg-foreground px-5 py-3 text-sm font-medium text-background">
            Start recording
          </button>
        ) : (
          <button type="button" onClick={stopRecording} className="rounded-lg border px-5 py-3 text-sm font-medium">
            Stop recording
          </button>
        )}
        <span className="font-mono text-sm tabular-nums" aria-live="polite">{formatTime(seconds)}</span>
      </div>

      {clipUrl && (
        <div className="mt-5 space-y-3 rounded-lg border p-4">
          {kind === "video" ? <video src={clipUrl} controls className="max-h-80 w-full rounded-md" /> : <audio src={clipUrl} controls className="w-full" />}
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={saveClip} disabled={saving || saved} className="rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background disabled:opacity-60">
              {saved ? "Saved to Legacy OS" : saving ? "Saving…" : "Save to Legacy OS"}
            </button>
            <button type="button" onClick={shareClip} className="rounded-lg border px-4 py-2 text-sm font-medium">Share clip</button>
            <button type="button" onClick={discardClip} className="rounded-lg border px-4 py-2 text-sm">Discard</button>
          </div>
        </div>
      )}

      {error && <p className="mt-4 text-sm text-destructive" role="alert">{error}</p>}
    </section>
  );
}
