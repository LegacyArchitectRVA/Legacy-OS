import { createHash } from 'node:crypto';
import { readdir, readFile, stat } from 'node:fs/promises';
import { join, relative } from 'node:path';
import type { SourceConnector, SourceItem, SourceScanOptions } from './source';

export class FilesystemConnector implements SourceConnector {
  readonly kind = 'filesystem' as const;

  constructor(
    readonly id: string,
    private readonly root: string,
    readonly displayName = 'Local filesystem',
  ) {}

  async *scan(options: SourceScanOptions = {}): AsyncIterable<SourceItem> {
    yield* this.walk(this.root, options);
  }

  async health(): Promise<{ ok: boolean; message?: string }> {
    try {
      const info = await stat(this.root);
      if (!info.isDirectory()) return { ok: false, message: 'Root is not a directory' };
      return { ok: true };
    } catch (error) {
      return { ok: false, message: error instanceof Error ? error.message : 'Filesystem unavailable' };
    }
  }

  private async *walk(directory: string, options: SourceScanOptions): AsyncIterable<SourceItem> {
    const entries = await readdir(directory, { withFileTypes: true });

    for (const entry of entries) {
      if (!options.includeHidden && entry.name.startsWith('.')) continue;

      const fullPath = join(directory, entry.name);
      if (entry.isDirectory()) {
        if (options.recursive !== false) yield* this.walk(fullPath, options);
        continue;
      }
      if (!entry.isFile()) continue;

      const info = await stat(fullPath);
      const modifiedAt = info.mtime.toISOString();
      if (options.modifiedAfter && modifiedAt < options.modifiedAfter) continue;
      if (options.modifiedBefore && modifiedAt > options.modifiedBefore) continue;

      const type = extensionType(entry.name);
      if (options.types && options.types.length > 0 && !options.types.includes(type)) continue;

      const contentHash = await hashFile(fullPath);
      yield {
        id: `${this.id}:${relative(this.root, fullPath)}`,
        sourceId: this.id,
        path: fullPath,
        name: entry.name,
        type,
        size: info.size,
        modifiedAt,
        contentHash,
        metadata: { relativePath: relative(this.root, fullPath) },
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
