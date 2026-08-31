export type AdminCreatedUser = {
  id: string;
  email: string;
  temporaryPasswordIssued: boolean;
  mustChangePassword: boolean;
};

export function isAdminRequest(request: Request) {
  const configuredSecret = process.env.LEGACY_OS_ADMIN_SECRET;
  if (!configuredSecret) return false;
  const suppliedSecret = request.headers.get("x-legacy-admin-secret");
  return suppliedSecret === configuredSecret;
}

export function validateUserCredentials(email: string, password: string) {
  return /.+@.+\..+/.test(email) && password.length >= 12;
}
