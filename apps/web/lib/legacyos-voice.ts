export type LegacyOsVoiceMode = "elara" | "client" | "elara_direct";

export function isLegacyOsVoiceMode(value: unknown): value is LegacyOsVoiceMode {
  return value === "elara" || value === "client" || value === "elara_direct";
}

export function getLegacyOsVoiceMode(userMetadata: Record<string, unknown> | undefined): LegacyOsVoiceMode {
  const value = userMetadata?.elara_voice_mode;
  return isLegacyOsVoiceMode(value) ? value : "elara_direct";
}

export function buildLegacyOsVoiceInstruction(
  mode: LegacyOsVoiceMode,
  clientName?: string | null,
): string {
  const name = clientName?.trim();

  switch (mode) {
    case "client":
      return "Speak directly to the client. Use second-person language (you/your) and do not present yourself as Elara unless the client explicitly asks who is speaking.";
    case "elara_direct":
      return name
        ? `Speak as Elara by default. When specifically addressing ${name}, address ${name} directly by name and use natural second-person language. Do not switch the entire conversation into a client voice merely because the client's name appears in context.`
        : "Speak as Elara by default. When specifically addressing the client, use natural second-person language. Do not switch the entire conversation into a client voice merely because the client is mentioned in context.";
    case "elara":
    default:
      return "Speak consistently as Elara, the Legacy OS guide. Keep Elara's voice distinct from the client's voice and do not impersonate the client.";
  }
}
