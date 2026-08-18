export type CompositionStatus = "ready" | "needs-encoder" | "denied" | "invalid-input";

export interface MediaCompositionRequest {
  sourceVideoUri: string;
  voiceAudioUri: string;
  informationAuthorized: boolean;
}

export interface MediaCompositionAdapter {
  readonly id: string;
  compose(input: { sourceVideoUri: string; voiceAudioUri: string }): Promise<{ outputVideoUri: string }>;
}

export interface MediaCompositionResult {
  status: CompositionStatus;
  sourceVideoUri: string;
  voiceAudioUri?: string;
  outputVideoUri?: string;
  encoderId?: string;
  note: string;
}

/** Composes a voiced copy while retaining the original signed video unchanged. */
export async function composeSignedVideoWithVoice(
  request: MediaCompositionRequest,
  adapter?: MediaCompositionAdapter,
): Promise<MediaCompositionResult> {
  if (!request.informationAuthorized) {
    return {
      status: "denied",
      sourceVideoUri: request.sourceVideoUri,
      note: "Authorization is required before media composition.",
    };
  }

  if (!request.sourceVideoUri || !request.voiceAudioUri) {
    return {
      status: "invalid-input",
      sourceVideoUri: request.sourceVideoUri,
      voiceAudioUri: request.voiceAudioUri,
      note: "Both the original signed video and generated voice track are required.",
    };
  }

  if (!adapter) {
    return {
      status: "needs-encoder",
      sourceVideoUri: request.sourceVideoUri,
      voiceAudioUri: request.voiceAudioUri,
      note: "A compatible media encoder is required to create the persistent voiced-video copy.",
    };
  }

  try {
    const output = await adapter.compose({
      sourceVideoUri: request.sourceVideoUri,
      voiceAudioUri: request.voiceAudioUri,
    });

    return {
      status: "ready",
      sourceVideoUri: request.sourceVideoUri,
      voiceAudioUri: request.voiceAudioUri,
      outputVideoUri: output.outputVideoUri,
      encoderId: adapter.id,
      note: "Voiced copy created; the original signed video remains the source of truth.",
    };
  } catch {
    return {
      status: "needs-encoder",
      sourceVideoUri: request.sourceVideoUri,
      voiceAudioUri: request.voiceAudioUri,
      encoderId: adapter.id,
      note: "The encoder could not create the voiced copy; the original signed video remains unchanged.",
    };
  }
}
