const unauthorizedListeners = new Set<() => void>();

export function subscribeUnauthorized(listener: () => void) {
  unauthorizedListeners.add(listener);
  return () => unauthorizedListeners.delete(listener);
}

export function emitUnauthorized() {
  unauthorizedListeners.forEach(listener => listener());
}
