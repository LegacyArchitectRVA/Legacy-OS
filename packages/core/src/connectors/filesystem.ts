import { createHash } from 'node:crypto';
import { readdir, readFile, realpath, stat } from 'node:fs/promises';
import { isAbsolute, join, relative, resolve } from 'node:path';
import type { SourceConnector, SourceItem, SourceScanOptions } from './source';
import type { SourceAccessController } from '../security/source-access';

export class FilesystemConnector implements SourceConnector {
  readonly kind = 'filesystem' as const;
  private readonly access: SourceAccessController;

  constructor(
    readonly id: string,
    private readonly root: string,
    access: SourceAccessController,
    readonly displayName = 'Local filesystem',
  ) {
    if (!isAbsolute(root)) throw new Error('Filesystem root must be absolute');
    this.access = access;
  }

  async *scan(options: SourceScanOptions = {}): AsyncIterable<SourceItem> {
    const canonicalRoot = await realpath(this.root);
    this.access.assertAuthorized(this.id, canonicalRoot, 'read');
    yield* this.walk(canonicalRoot, options);
  }

  async health(): Promise<{ ok: boolean; message?: string }> {
    try {
      const canonicalRoot = await realpath(this.root);
      const info = await stat(canonicalRoot);
      if (!info.isDirectory()) return { ok: false, message: 'Root is not a directory' };
      this.access.assertAuthorized(this.id, canonicalRoot, 'read');
      return { ok: true };
    } catch (error) {
      return { ok: false, message: error instanceof Error ? error.message : 'Filesystem unavailable' };
    }
  }

  private async *walk(directory: string, options: SourceScanOptions): AsyncIterable<SourceItem> {
    const entries = await readdir(directory, { withFileTypes: true });

    for (const entry of entries) {
      if (!options.includeHidden && entry.name.startsWith('.')) continue;

      const fullPath = resolve(join(directory, entry.name));
      if (entry.isDirectory()) {
        const canonicalDirectory = await realpath(fullPath);
        this.access.assertAuthorized(this.id, canonicalDirectory, 'read');
        if (options.recursive !== false) yield* this.walk(canonicalDirectory, options);
        continue;
      }
      if (!entry.isFile()) continue;

      const canonicalPath = await realpath(fullPath);
      this.access.assertAuthorized(this.id, canonicalPath, 'read');
      const info = await stat(canonicalPath);
      const modifiedAt = info.mtime.toISOString();
      if (options.modifiedAfter && modifiedAt < options.modifiedAfter) continue;
      if (options.modifiedBefore && modifiedAt > options.modifiedBefore) continue;

      const type = extensionType(entry.name);
      if (options.types && options.types.length > 0 && !options.types.includes(type)) continue;

      const contentHash = await hashFile(canonicalPath);
      yield {
        id: `${this.id}:${relative(this.root, canonicalPath)}`,
        sourceId: this.id,
        path: canonicalPath,
        name: entry.name,
        type,
        size: info.size,
        modifiedAt,
        contentHash,
        metadata: { relativePath: relative(this.root, canonicalPath) },
      };
    }
  }
}

function extensionType(name: string): string {
  const extension = name.includes('.') ? name.slice(name.lastIndexOf('.') + 1).toLowerCase() : '';
  return extension || 'file';
}

async function hashFile(path: string): Promise<string> {
  const content = await readFile(path);
  return createHash('sha256').update(content).digest('hex');
}
