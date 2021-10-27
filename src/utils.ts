import * as React from 'react';
import { Coordinates } from './types';

/**
 * create context and assign context displayName
 */
export function createNamedContext<T>(displayName: string, defaultValue: T): React.Context<T> {
  const context = React.createContext(defaultValue);
  context.displayName = displayName;

  return context;
}

export function closest<T extends HTMLElement>(el: T, fn: (el: T) => boolean) {
  while (el) {
    if (fn(el)) return el;
    el = el.parentNode as T;
  }

  return null;
}

export function getPosition(event: MouseEvent | TouchEvent): Coordinates {
  if (TouchEvent && event instanceof TouchEvent) {
    const { changedTouches, touches } = event;
    return {
      x: changedTouches?.[0]?.pageX || touches?.[0]?.pageX || 0,
      y: changedTouches?.[0]?.pageY || touches?.[0]?.pageY || 0,
    };
  }

  return {
    x: (event as MouseEvent).pageX,
    y: (event as MouseEvent).pageY,
  };
}

export const isFunction = (fn: unknown): boolean => !!(fn && typeof fn === 'function');

export const NodeType = {
  Anchor: 'A',
  Button: 'BUTTON',
  Canvas: 'CANVAS',
  Input: 'INPUT',
  Option: 'OPTION',
  Textarea: 'TEXTAREA',
  Select: 'SELECT',
};

/**************************** hooks ****************************/

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function usePersistFn<T extends (...args: any[]) => void>(fn?: T) {
  const fnRef = React.useRef<T>();
  fnRef.current = fn;

  const presistFn = React.useRef<T>();

  if (typeof fnRef.current !== 'function') return undefined;

  if (!presistFn.current) {
    presistFn.current = function (...args: unknown[]) {
      return fnRef.current?.(...args);
    } as T;
  }

  return presistFn.current;
}

export function useSetState<S>(
  initalState: S,
): [Partial<S>, React.Dispatch<React.SetStateAction<Partial<S>>>] {
  const [state, set] = React.useState<S>(initalState);
  const isUnmountedRef = React.useRef(false);

  React.useEffect(
    () => () => {
      isUnmountedRef.current = true;
    },
    [],
  );

  const setMergeState = React.useCallback(
    (state) =>
      isUnmountedRef.current &&
      set((prevState) => {
        if (typeof state === 'function') return { ...prevState, ...state(prevState) };
        if (typeof state === 'object') return { ...prevState, ...state };
        return prevState;
      }),
    [set],
  );

  return [state, setMergeState];
}
