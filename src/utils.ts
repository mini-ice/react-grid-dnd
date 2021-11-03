import * as React from 'react';
import { Coordinates, ViewRect, LayoutRect } from './types';

/**
 * create context and assign context displayName
 */
export function createNamedContext<T>(displayName: string, defaultValue: T): React.Context<T> {
  const context = React.createContext(defaultValue);
  context.displayName = displayName;

  return context;
}

export function getMeasurableNode(node: HTMLElement | undefined | null): HTMLElement | null {
  if (!node) {
    return null;
  }

  if (node.children.length > 1) {
    return node;
  }
  const firstChild = node.children[0];

  return firstChild instanceof HTMLElement ? firstChild : node;
}

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

export function getElementLayout(element: HTMLElement): LayoutRect {
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

export function isScrollable(node: HTMLElement): boolean {
  // reflow
  const computedStyle = window.getComputedStyle(node);
  const overflowRegex = /(auto|scroll)/;
  const properties = ['overflow', 'overflowX', 'overflowY'];

  return properties.some((key) => {
    const overflow = computedStyle.getPropertyValue(key);
    return typeof overflow === 'string' ? overflowRegex.test(overflow) : false;
  });
}

export function getScrollableAncestors(element: Node | null): Element[] {
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

export function getViewRect(element: HTMLElement): ViewRect {
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

export function closest<T extends HTMLElement>(el: T, fn: (el: T) => boolean) {
  while (el) {
    if (fn(el)) return el;
    el = el.parentNode as T;
  }

  return null;
}

export function getOwnerDocument(target: Event['target']) {
  return target instanceof HTMLElement ? target.ownerDocument : document;
}

export function getPosition(event: Event): Coordinates {
  if (TouchEvent && event instanceof TouchEvent) {
    const { changedTouches, touches } = event;
    return {
      x: changedTouches?.[0]?.clientX || touches?.[0]?.clientX || 0,
      y: changedTouches?.[0]?.clientY || touches?.[0]?.clientY || 0,
    };
  }

  return {
    x: (event as MouseEvent).clientX,
    y: (event as MouseEvent).clientY,
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
