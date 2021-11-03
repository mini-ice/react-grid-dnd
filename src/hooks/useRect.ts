import * as React from 'react';
import type { LayoutRect } from '../types';
import { getViewRect } from '../utils';
import { useLazyMemo } from './useLazyMemo';

export function createRectFn<T = LayoutRect, U = Element>(fn: (element: U) => T) {
  return function useClientRect(element: U | null, forceUpdate?: boolean): T | null {
    const previousElement = React.useRef(element);

    return useLazyMemo(
      (prevVal) => {
        if (!element) return null;

        if (forceUpdate || (!prevVal && element) || previousElement.current !== element) {
          if (element instanceof HTMLElement && element.parentNode == null) {
            return null;
          }

          return fn(element);
        }

        return prevVal ?? null;
      },
      [element, forceUpdate],
    );
  };
}

export const useViewRect = createRectFn(getViewRect);
