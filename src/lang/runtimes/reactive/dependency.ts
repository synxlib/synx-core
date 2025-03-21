const dependents = new Map<any, Set<() => void>>();

export function trackDependency(signal: any, effect: () => void) {
  if (!dependents.has(signal)) dependents.set(signal, new Set());
  dependents.get(signal)!.add(effect);
}

export function notify(signal: any) {
  const effects = dependents.get(signal);
  if (effects) {
    effects.forEach((fn) => fn());
  }
}