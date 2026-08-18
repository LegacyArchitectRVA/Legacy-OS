import type { MediaCompositionAdapter } from "./media-composition";
import { composeSignedVideoWithVoice } from "./media-composition";

export type CompositionJobStatus = "queued" | "processing" | "ready" | "denied" | "needs-encoder" | "invalid-input";

export interface MediaCompositionJob {
  id: string;
  sourceVideoUri: string;
  voiceAudioUri: string;
  informationAuthorized: boolean;
  status: CompositionJobStatus;
  outputVideoUri?: string;
  error?: string;
}

export interface CompositionJobStore {
  get(id: string): Promise<MediaCompositionJob | undefined>;
  put(job: MediaCompositionJob): Promise<void>;
}

/** Provider-neutral worker orchestration with idempotent job state transitions. */
export async function processMediaCompositionJob(
  job: MediaCompositionJob,
  store: CompositionJobStore,
  adapter?: MediaCompositionAdapter,
): Promise<MediaCompositionJob> {
  const existing = await store.get(job.id);
  if (existing?.status === "ready" && existing.outputVideoUri) return existing;

  const processing = { ...job, status: "processing" as const, error: undefined };
  await store.put(processing);

  const result = await composeSignedVideoWithVoice(
    {
      sourceVideoUri: job.sourceVideoUri,
      voiceAudioUri: job.voiceAudioUri,
      informationAuthorized: job.informationAuthorized,
    },
    adapter,
  );

  const completed: MediaCompositionJob = {
    ...processing,
    status: result.status === "ready" ? "ready" : result.status,
    outputVideoUri: result.outputVideoUri,
    error: result.status === "ready" ? undefined : result.note,
  };
  await store.put(completed);
  return completed;
}
