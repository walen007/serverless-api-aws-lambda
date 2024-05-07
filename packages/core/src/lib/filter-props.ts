// Filters props into or out of an object depending on the direction (dir)
export function filterProps<T>(obj: T, props: string[], dir: 'in' | 'out' = 'out'): Partial<T> {
  const filtered: Partial<T> = {};

  for (const prop in obj) {
    if (dir === 'out' && !props.includes(prop)) filtered[prop] = obj[prop];
    if (dir === 'in' && props.includes(prop)) filtered[prop] = obj[prop];
  }

  return filtered;
}
