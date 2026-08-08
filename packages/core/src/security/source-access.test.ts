import { describe, expect, it } from 'vitest';
import { SourceAccessController } from './source-access';

describe('SourceAccessController', () => {
  const access = new SourceAccessController([
    { sourceId: 'device-1', roots: ['/Users/test/Documents'], modes: ['read'] },
  ]);

  it('allows authorized reads within an authorized root', () => {
    expect(access.canRead('device-1', '/Users/test/Documents/July/post.json')).toBe(true);
  });

  it('denies sibling-prefix traversal', () => {
    expect(access.canRead('device-1', '/Users/test/Documents-private/post.json')).toBe(false);
  });

  it('denies unknown sources and write access when only read is granted', () => {
    expect(access.canRead('unknown', '/Users/test/Documents/a')).toBe(false);
    expect(() => access.assertAuthorized('device-1', '/Users/test/Documents/a', 'write')).toThrow();
  });
});
