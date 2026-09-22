// A tiny pub-sub, outside React, that lets code with no access to the
// QueryClient (the cache-level error handlers in Providers, which run before
// the client they belong to can be referenced) announce that the session
// cookie was rejected. Providers subscribes from an effect and invalidates
// the current user there; the guards (RequireToken/RequireVerified) watch
// that query and redirect to /sign-in.
type Listener = () => void;

const listeners = new Set<Listener>();

export function notifySessionInvalid() {
  for (const listener of listeners) listener();
}

export function onSessionInvalid(listener: Listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
