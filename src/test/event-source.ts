// A fake `EventSource` for tests: no real connection, one instance per
// `new EventSource(...)`, and an `emit` to simulate a message from the
// server. Install with `installFakeEventSource()` before rendering, then
// grab the instance(s) from `.instances` to `emit` on.
export class FakeEventSource {
  static instances: FakeEventSource[] = [];

  url: string;
  withCredentials: boolean;
  closed = false;
  private listeners = new Map<string, Set<(event: MessageEvent) => void>>();

  constructor(url: string, eventSourceInitDict?: { withCredentials?: boolean }) {
    this.url = url;
    this.withCredentials = !!eventSourceInitDict?.withCredentials;
    FakeEventSource.instances.push(this);
  }

  addEventListener(type: string, listener: (event: MessageEvent) => void) {
    if (!this.listeners.has(type)) this.listeners.set(type, new Set());
    this.listeners.get(type)!.add(listener);
  }

  removeEventListener(type: string, listener: (event: MessageEvent) => void) {
    this.listeners.get(type)?.delete(listener);
  }

  close() {
    this.closed = true;
  }

  // Simulates a `event: <type>` SSE message; `data` is JSON-encoded, as the
  // real backend sends it.
  emit(type: string, data: unknown) {
    const event = { data: JSON.stringify(data) } as MessageEvent;
    for (const listener of this.listeners.get(type) ?? []) listener(event);
  }
}

export function installFakeEventSource() {
  FakeEventSource.instances = [];
  vi.stubGlobal("EventSource", FakeEventSource);
  return FakeEventSource;
}
