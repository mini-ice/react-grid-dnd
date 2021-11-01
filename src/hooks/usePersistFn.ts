import * as React from 'react';

export type noop = (...args: any[]) => any;

export function usePersistFn<T extends noop>(fn: T) {
  const fnRef = React.useRef<T>(fn);
  fnRef.current = fn;

  const persistFn = React.useRef<T>();
  if (!persistFn.current) {
    persistFn.current = function (...args) {
      return fnRef.current!(...args);
    } as T;
  }

  return persistFn.current!;
}
