export type AccessMode = 'read' | 'write';

export type AuthorizedSource = {
  sourceId: string;
  roots: string[];
  modes: AccessMode[];
};

export class SourceAccessController {
  constructor(private readonly grants: AuthorizedSource[]) {}

  assertAuthorized(sourceId: string, path: string, mode: AccessMode = 'read'): void {
    const grant = this.grants.find((candidate) => candidate.sourceId === sourceId);
    if (!grant || !grant.modes.includes(mode)) {
      throw new Error(`Source access denied: ${sourceId}`);
    }

    const allowed = grant.roots.some((root) => isWithinRoot(root, path));
    if (!allowed) throw new Error(`Path access denied: ${path}`);
  }

  canRead(sourceId: string, path: string): boolean {
    try {
      this.assertAuthorized(sourceId, path, 'read');
      return true;
    } catch {
      return false;
    }
  }
}

function isWithinRoot(root: string, target: string): boolean {
  const normalizedRoot = normalize(root);
  const normalizedTarget = normalize(target);
  return normalizedTarget === normalizedRoot || normalizedTarget.startsWith(`${normalizedRoot}/`);
}

function normalize(path: string): string {
  return path.replace(/\\/g, '/').replace(/\/+$/, '') || '/';
}
