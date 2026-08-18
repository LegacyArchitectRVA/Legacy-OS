import { describe, expect, it } from "vitest";
import { processMediaCompositionJob, type CompositionJobStore, type MediaCompositionJob } from "./media-composition-worker";

describe("media composition worker", () => {
  function store(): CompositionJobStore & { jobs: Map<string, MediaCompositionJob> } {
    const jobs = new Map<string, MediaCompositionJob>();
    return { jobs, async get(id) { return jobs.get(id); }, async put(job) { jobs.set(job.id, job); } };
  }

  const adapter = { id: "test-encoder", async compose() { return { outputVideoUri: "video://voiced" }; } };

  it("processes and persists a voiced-video job", async () => {
    const db = store();
    const job = { id: "job-1", sourceVideoUri: "video://signed", voiceAudioUri: "audio://voice", informationAuthorized: true, status: "queued" as const };
    await expect(processMediaCompositionJob(job, db, adapter)).resolves.toMatchObject({ status: "ready", outputVideoUri: "video://voiced" });
    expect(db.jobs.get("job-1")?.status).toBe("ready");
  });

  it("is idempotent after a successful composition", async () => {
    const db = store();
    const existing = { id: "job-2", sourceVideoUri: "video://signed", voiceAudioUri: "audio://voice", informationAuthorized: true, status: "ready" as const, outputVideoUri: "video://existing" };
    await db.put(existing);
    const result = await processMediaCompositionJob({ ...existing, status: "queued", outputVideoUri: undefined }, db, { id: "must-not-run", async compose() { throw new Error("should not run"); } });
    expect(result).toEqual(existing);
  });

  it("persists denied jobs without invoking the encoder", async () => {
    const db = store();
    let called = false;
    const deniedAdapter = { id: "test", async compose() { called = true; return { outputVideoUri: "video://bad" }; } };
    const result = await processMediaCompositionJob({ id: "job-3", sourceVideoUri: "video://signed", voiceAudioUri: "audio://voice", informationAuthorized: false, status: "queued" }, db, deniedAdapter);
    expect(result.status).toBe("denied");
    expect(called).toBe(false);
  });
});
