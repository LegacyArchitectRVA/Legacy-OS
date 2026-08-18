export interface MediaCompositionRequest {
  videoUri: string;
  audioUri: string;
  informationAuthorized: boolean;
}

export interface MediaCompositionResult {
  status: "ready" | "denied" | "unavailable";
  sourceVideoUri: string;
  audioUri?: string;
  outputUri?: string;
  preservesSource: true;
}

/**
 * Provider-neutral composition contract. The actual media encoder can be
 * supplied by a worker/server adapter without changing Echo's authorization
 * or provenance model.
 */
export interface MediaCompositionAdapter {
  readonly id: string;
  compose(request: MediaCompositionRequest): Promise<{ outputUri: string }>;
}

export async function composeSignedVideoWithVoice(
  request: MediaCompositionRequest,
  adapter?: MediaCompositionAdapter,
): Promise<MediaCompositionResult> {
  if (!request.informationAuthorized) {
    return {
      status: "denied",
      sourceVideoUri: request.videoUri,
      audioUri: request.audioUri,
      preservesSource: true,
    };
  }

  if (!adapter) {
    return {
      status: "unavailable",
      sourceVideoUri: request.videoUri,
      audioUri: request.audioUri,
      preservesSource: true,
    };
  }

  try {
    const output = await adapter.compose(request);
    return {
      status: "ready",
      sourceVideoUri: request.videoUri,
      audioUri: request.audioUri,
      outputUri: output.outputUri,
      preservesSource: true,
    };
  } catch {
    return {
      status: "unavailable",
      sourceVideoUri: request.videoUri,
      audioUri: request.audioUri,
      preservesSource: true,
    };
  }
}
