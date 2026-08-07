import { describe, expect, it } from 'vitest';
import type { SourceConnector } from './source';
import { ConnectorRegistry } from './source';

describe('ConnectorRegistry', () => {
  it('registers and retrieves connectors', () => {
    const registry = new ConnectorRegistry();
    const connector: SourceConnector = {
      id: 'test',
      kind: 'api',
      displayName: 'Test',
      async *scan() {},
      async health() { return { ok: true }; },
    };

    registry.register(connector);

    expect(registry.get('test')).toBe(connector);
    expect(registry.list()).toEqual([connector]);
  });

  it('rejects duplicate connector ids', () => {
    const registry = new ConnectorRegistry();
    const connector: SourceConnector = {
      id: 'test',
      kind: 'api',
      displayName: 'Test',
      async *scan() {},
      async health() { return { ok: true }; },
    };

    registry.register(connector);
    expect(() => registry.register(connector)).toThrow('Connector already registered: test');
  });
});
