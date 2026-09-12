"use client";

import { FormEvent, useState } from "react";

type Device = { id: string; name: string; platform: string; status: string };
type Source = { id: string; name: string; source_type: string; provider: string | null; status: string };

type Props = { workspaceId: string | null; devices: Device[]; sources: Source[]; onChanged: () => void };

const platforms = ["windows", "macos", "linux", "android", "ios", "nas", "unknown"];
const sourceTypes = ["local_filesystem", "external_drive", "nas", "cloud_storage", "provider_api"];

async function readResponse(response: Response) {
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(typeof body.error === "string" ? body.error : "The request could not be completed.");
  return body;
}

export default function LegacyOsControls({ workspaceId, devices, sources, onChanged }: Props) {
  const [deviceName, setDeviceName] = useState("");
  const [platform, setPlatform] = useState("unknown");
  const [sourceName, setSourceName] = useState("");
  const [sourceType, setSourceType] = useState("cloud_storage");
  const [provider, setProvider] = useState("");
  const [deviceId, setDeviceId] = useState("");
  const [busy, setBusy] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function registerDevice(event: FormEvent) {
    event.preventDefault();
    if (!workspaceId) return setError("A workspace is required.");
    setBusy("device"); setError(""); setMessage("");
    try {
      await readResponse(await fetch("/api/devices", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ workspace_id: workspaceId, name: deviceName.trim() || "This device", platform, device_key_fingerprint: crypto.randomUUID() }) }));
      setDeviceName(""); setMessage("Device registered as pending."); onChanged();
    } catch (value) { setError(value instanceof Error ? value.message : "Unable to register the device."); }
    finally { setBusy(""); }
  }

  async function changeDevice(id: string, status: "active" | "revoked") {
    setBusy(`device:${id}`); setError(""); setMessage("");
    try { await readResponse(await fetch(`/api/devices/${encodeURIComponent(id)}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) })); setMessage(`Device ${status}.`); onChanged(); }
    catch (value) { setError(value instanceof Error ? value.message : "Unable to update the device."); }
    finally { setBusy(""); }
  }

  async function registerSource(event: FormEvent) {
    event.preventDefault();
    if (!workspaceId) return setError("A workspace is required.");
    setBusy("source"); setError(""); setMessage("");
    try {
      await readResponse(await fetch("/api/storage-sources", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ workspace_id: workspaceId, name: sourceName.trim(), source_type: sourceType, provider: provider.trim() || undefined, device_id: deviceId || undefined }) }));
      setSourceName(""); setProvider(""); setDeviceId(""); setMessage("Source registered as pending."); onChanged();
    } catch (value) { setError(value instanceof Error ? value.message : "Unable to register the source."); }
    finally { setBusy(""); }
  }

  async function changeSource(id: string, status: "active" | "paused" | "revoked") {
    setBusy(`source:${id}`); setError(""); setMessage("");
    try { await readResponse(await fetch(`/api/storage-sources/${encodeURIComponent(id)}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) })); setMessage(`Source ${status}.`); onChanged(); }
    catch (value) { setError(value instanceof Error ? value.message : "Unable to update the source."); }
    finally { setBusy(""); }
  }

  return (
    <section aria-labelledby="controls" className="mt-8 rounded-2xl border border-white/10 bg-white/[0.025] p-6 sm:p-8">
      <p className="text-xs uppercase tracking-[0.2em] text-[#e7b84b]">Control plane</p>
      <h2 id="controls" className="mt-1 text-2xl font-semibold">Devices & sources</h2>
      <p className="mt-2 text-sm leading-6 text-white/45">Register devices and storage sources. A registered device starts pending and can be activated or revoked.</p>
      {(error || message) && <div className={`mt-4 rounded-xl border p-4 text-sm ${error ? "border-red-400/20 bg-red-400/5" : "border-[#e7b84b]/20 bg-[#100d07]"}`} role={error ? "alert" : "status"}>{error || message}</div>}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <form onSubmit={registerDevice} className="rounded-xl border border-white/10 p-5">
          <h3 className="font-semibold">Register device</h3>
          <input value={deviceName} onChange={(event) => setDeviceName(event.target.value)} maxLength={160} placeholder="Device name" className="mt-4 min-h-11 w-full rounded-lg border border-white/10 bg-black/20 px-3 text-sm" />
          <select value={platform} onChange={(event) => setPlatform(event.target.value)} className="mt-3 min-h-11 w-full rounded-lg border border-white/10 bg-black/20 px-3 text-sm">{platforms.map((value) => <option key={value} value={value}>{value}</option>)}</select>
          <button disabled={busy === "device" || !workspaceId} className="mt-4 min-h-11 w-full rounded-lg bg-[#b98a25] px-4 py-2 text-sm font-semibold text-black disabled:opacity-50">{busy === "device" ? "Registering…" : "Register device"}</button>
        </form>
        <form onSubmit={registerSource} className="rounded-xl border border-white/10 p-5">
          <h3 className="font-semibold">Register source</h3>
          <input required value={sourceName} onChange={(event) => setSourceName(event.target.value)} maxLength={160} placeholder="Source name" className="mt-4 min-h-11 w-full rounded-lg border border-white/10 bg-black/20 px-3 text-sm" />
          <select value={sourceType} onChange={(event) => setSourceType(event.target.value)} className="mt-3 min-h-11 w-full rounded-lg border border-white/10 bg-black/20 px-3 text-sm">{sourceTypes.map((value) => <option key={value} value={value}>{value.replaceAll("_", " ")}</option>)}</select>
          <input value={provider} onChange={(event) => setProvider(event.target.value)} maxLength={160} placeholder="Provider, if applicable" className="mt-3 min-h-11 w-full rounded-lg border border-white/10 bg-black/20 px-3 text-sm" />
          <select value={deviceId} onChange={(event) => setDeviceId(event.target.value)} className="mt-3 min-h-11 w-full rounded-lg border border-white/10 bg-black/20 px-3 text-sm"><option value="">No device link</option>{devices.filter((device) => device.status === "active").map((device) => <option key={device.id} value={device.id}>{device.name}</option>)}</select>
          <button disabled={busy === "source" || !workspaceId} className="mt-4 min-h-11 w-full rounded-lg bg-[#b98a25] px-4 py-2 text-sm font-semibold text-black disabled:opacity-50">{busy === "source" ? "Registering…" : "Register source"}</button>
        </form>
      </div>
      <div className="mt-6 space-y-2">
        {devices.map((device) => <div key={device.id} className="flex flex-col gap-3 rounded-xl border border-white/10 p-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-sm font-semibold">{device.name}</p><p className="text-xs capitalize text-white/40">{device.platform} · {device.status}</p></div><div className="flex gap-2">{device.status === "pending" && <button disabled={busy === `device:${device.id}`} onClick={() => void changeDevice(device.id, "active")} className="min-h-11 rounded-lg border border-[#e7b84b]/30 px-4 text-xs text-[#e7b84b]">Activate</button>}{device.status === "active" && <button disabled={busy === `device:${device.id}`} onClick={() => void changeDevice(device.id, "revoked")} className="min-h-11 rounded-lg border border-red-400/20 px-4 text-xs text-red-200">Revoke</button>}</div></div>)}
        {sources.map((source) => <div key={source.id} className="flex flex-col gap-3 rounded-xl border border-white/10 p-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-sm font-semibold">{source.name}</p><p className="text-xs capitalize text-white/40">{source.provider ?? source.source_type.replaceAll("_", " ")} · {source.status}</p></div><div className="flex gap-2">{source.status === "pending" && <button disabled={busy === `source:${source.id}`} onClick={() => void changeSource(source.id, "active")} className="min-h-11 rounded-lg border border-[#e7b84b]/30 px-4 text-xs text-[#e7b84b]">Activate</button>}{source.status === "active" && <><button disabled={busy === `source:${source.id}`} onClick={() => void changeSource(source.id, "paused")} className="min-h-11 rounded-lg border border-white/10 px-4 text-xs">Pause</button><button disabled={busy === `source:${source.id}`} onClick={() => void changeSource(source.id, "revoked")} className="min-h-11 rounded-lg border border-red-400/20 px-4 text-xs text-red-200">Revoke</button></>}</div></div>)}
      </div>
    </section>
  );
}
