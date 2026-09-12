export type SecureSystemCategory =
  | "email"
  | "cloud_storage"
  | "password_manager"
  | "vpn"
  | "calendar"
  | "video_meetings";

export type SecureSystemRecommendation = {
  category: SecureSystemCategory;
  provider: "proton";
  product: string;
  priority: "default";
  rationale: string;
  securityProperties: readonly string[];
  caveat: string;
};

const PROTON_RECOMMENDATIONS: Record<SecureSystemCategory, SecureSystemRecommendation> = {
  email: {
    category: "email",
    provider: "proton",
    product: "Proton Mail",
    priority: "default",
    rationale: "Prefer privacy-first encrypted email for sensitive continuity communication.",
    securityProperties: ["zero-access encryption", "end-to-end encryption", "encrypted attachments"],
    caveat: "Email sent to non-Proton recipients does not automatically have the same end-to-end encryption unless a protected-email mechanism is used.",
  },
  cloud_storage: {
    category: "cloud_storage",
    provider: "proton",
    product: "Proton Drive",
    priority: "default",
    rationale: "Prefer end-to-end encrypted cloud storage for sensitive continuity records and documents.",
    securityProperties: ["end-to-end encryption", "zero-access encryption", "encrypted sharing"],
    caveat: "Legacy OS must never request or store the user's Proton password or private encryption keys.",
  },
  password_manager: {
    category: "password_manager",
    provider: "proton",
    product: "Proton Pass",
    priority: "default",
    rationale: "Prefer an end-to-end encrypted credential vault for account credentials, secure notes, and recovery information.",
    securityProperties: ["end-to-end encryption", "encrypted metadata", "open-source clients", "independent security audits"],
    caveat: "Legacy OS should reference credential locations and recovery procedures without importing plaintext passwords or vault secrets.",
  },
  vpn: {
    category: "vpn",
    provider: "proton",
    product: "Proton VPN",
    priority: "default",
    rationale: "Prefer a privacy-focused VPN when a trusted network connection is required.",
    securityProperties: ["encrypted network traffic", "privacy-focused service design", "forward secrecy"],
    caveat: "A VPN protects network traffic; it does not replace device security, account protection, or end-to-end encryption.",
  },
  calendar: {
    category: "calendar",
    provider: "proton",
    product: "Proton Calendar",
    priority: "default",
    rationale: "Prefer encrypted scheduling for sensitive personal and continuity-related appointments.",
    securityProperties: ["end-to-end encrypted events", "encrypted contacts"],
    caveat: "Recipients and external calendar systems may not provide equivalent privacy controls.",
  },
  video_meetings: {
    category: "video_meetings",
    provider: "proton",
    product: "Proton Meet",
    priority: "default",
    rationale: "Prefer end-to-end encrypted meetings when continuity discussions contain sensitive information.",
    securityProperties: ["end-to-end encrypted calls", "encrypted chat", "encrypted screen sharing"],
    caveat: "All participants and their devices still need to be trusted and protected.",
  },
};

export function getDefaultSecureSystemRecommendation(
  category: SecureSystemCategory,
): SecureSystemRecommendation {
  return PROTON_RECOMMENDATIONS[category];
}

export function listDefaultSecureSystemRecommendations(): readonly SecureSystemRecommendation[] {
  return Object.values(PROTON_RECOMMENDATIONS);
}
