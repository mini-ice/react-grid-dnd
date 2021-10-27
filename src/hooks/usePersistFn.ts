import * as React from 'react';

export type noop = (...args: any[]) => any;

export function usePersistFn<T extends noop>(fn: T) {
  const fnRef = React.useRef<T | null>(null);
  fnRef.current = fn;

  const presistFn = React.useRef<T>();

  if (typeof fnRef.current !== 'function') return undefined;

  if (!presistFn.current) {
    presistFn.current = function (...args: any[]) {
      return fnRef.current!(...args);
    } as T;
  }

  return presistFn.current;
}
