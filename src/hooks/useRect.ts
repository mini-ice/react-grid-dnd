import * as React from 'react';
import type { LayoutRect, ViewRect } from '../types';
import { useLazyMemo } from './useLazyMemo';

function getEdgeOffset(
  element: HTMLElement | null,
  parentNode: (Node & ParentNode) | null,
  defaultOffset = { x: 0, y: 0 },
): { x: number; y: number } {
  const offset = {
    x: defaultOffset.x,
    y: defaultOffset.y,
  };

  while (element && element !== parentNode) {
    // reflow
    const { offsetLeft, offsetTop } = element;
    offset.x += offsetLeft;
    offset.y += offsetTop;
    element = element.offsetParent as HTMLElement;
  }

  return offset;
}

function getElementLayout(element: HTMLElement): LayoutRect {
  // offsetWidth will be rounded to an integer.
  // https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/offsetWidth
  // reflow
  const { width, height } = element.getBoundingClientRect();
  const { x: offsetLeft, y: offsetTop } = getEdgeOffset(element, null);

  return {
    width,
    height,
    offsetTop,
    offsetLeft,
  };
}

const isScrollable = (node: HTMLElement): boolean => {
  // reflow
  const computedStyle = window.getComputedStyle(node);
  const overflowRegex = /(auto|scroll)/;
  const properties = ['overflow', 'overflowX', 'overflowY'];

  return properties.some((key) => {
    const overflow = computedStyle.getPropertyValue(key);
    return typeof overflow === 'string' ? overflowRegex.test(overflow) : false;
  });
};

function getScrollableAncestors(element: Node | null): Element[] {
  const scrollParents: Element[] = [];

  while (element) {
    if (element instanceof Document && element.scrollingElement !== null) {
      scrollParents.push(element.scrollingElement);
      return scrollParents;
    }

    if (element instanceof HTMLElement && isScrollable(element)) {
      scrollParents.push(element);
    }

    element = element.parentNode;
  }

  return scrollParents;
}

function getViewRect(element: HTMLElement): ViewRect {
  const { width, height, offsetTop, offsetLeft } = getElementLayout(element);
  const scrollableAncestors = getScrollableAncestors(element);
  const scrollOffsets = scrollableAncestors.reduce(
    (acc, element) => {
      if (element instanceof Window) {
        // reflow
        const { scrollX, scrollY } = element;
        acc.x += scrollX;
        acc.y += scrollY;
      } else {
        // reflow
        const { scrollTop, scrollLeft } = element;
        acc.x += scrollLeft;
        acc.y += scrollTop;
      }
      return acc;
    },
    { x: 0, y: 0 },
  );
  const top = offsetTop - scrollOffsets.y;
  const left = offsetLeft - scrollOffsets.x;

  return {
    width,
    height,
    top,
    bottom: top + height,
    right: left + width,
    left,
    offsetTop,
    offsetLeft,
  };
}

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
