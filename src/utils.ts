import * as React from 'react';
import ResizeObserver from 'resize-observer-polyfill';
import { GridSettings, Bounds } from './types';

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

export function defaultShouldCancelStart(event: React.TouchEvent | React.MouseEvent): boolean {
  const interactiveElement = ['input', 'select', 'checkbox', 'option', 'button'];

  if (interactiveElement.includes(event.currentTarget.tagName)) return true;

  if (closest(event.currentTarget as HTMLElement, (el) => el.contentEditable === 'true'))
    return true;

  return false;
}

export function getPosition(event: React.TouchEvent | React.MouseEvent) {
  if (TouchEvent && event.nativeEvent instanceof TouchEvent) {
    if (event.nativeEvent?.changedTouches?.length)
      return {
        x: event.nativeEvent.changedTouches[0].pageX,
        y: event.nativeEvent.changedTouches[0].pageY,
      };

    return {
      x: event.nativeEvent.touches[0].pageX,
      y: event.nativeEvent.touches[0].pageY,
    };
  }

  return {
    x: (event as React.MouseEvent).nativeEvent.pageX,
    y: (event as React.MouseEvent).nativeEvent.pageY,
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

export function getIndexFromCoordinates(
  x: number,
  y: number,
  { rowHeight, boxesPerRow, columnWidth }: GridSettings,
  count: number,
) {
  const index = Math.floor(y / rowHeight) * boxesPerRow + Math.floor(x / columnWidth);
  return index >= count ? count : index;
}

export function getPositionForIndex(
  i: number,
  { boxesPerRow, rowHeight, columnWidth }: GridSettings,
  traverseIndex?: number | false | null,
) {
  const index = typeof traverseIndex === 'number' ? (i >= traverseIndex ? i + 1 : i) : i;
  const x = (index % boxesPerRow) * columnWidth;
  const y = Math.floor(index / boxesPerRow) * rowHeight;
  return {
    xy: [x, y],
  };
}

export function getDragPosition(
  index: number,
  grid: GridSettings,
  dx: number,
  dy: number,
  center?: boolean,
) {
  const {
    xy: [left, top],
  } = getPositionForIndex(index, grid);
  return {
    xy: [
      left + dx + (center ? grid.columnWidth / 2 : 0),
      top + dy + (center ? grid.rowHeight / 2 : 0),
    ],
  };
}

export function getTargetIndex(
  startIndex: number,
  grid: GridSettings,
  count: number,
  dx: number,
  dy: number,
) {
  const {
    xy: [cx, cy],
  } = getDragPosition(startIndex, grid, dx, dy, true);
  return getIndexFromCoordinates(cx, cy, grid, count);
}

export function swap<T>(array: T[], moveIndex: number, toIndex: number) {
  const item = array[moveIndex];
  const length = array.length;
  const diff = moveIndex - toIndex;

  if (diff > 0) {
    // move left
    return [
      ...array.slice(0, toIndex),
      item,
      ...array.slice(toIndex, moveIndex),
      ...array.slice(moveIndex + 1, length),
    ];
  } else if (diff < 0) {
    // move right
    const targetIndex = toIndex + 1;
    return [
      ...array.slice(0, moveIndex),
      ...array.slice(moveIndex + 1, targetIndex),
      item,
      ...array.slice(targetIndex, length),
    ];
  }
  return array;
}

export function move<T>(
  source: Array<T>,
  destination: Array<T>,
  droppableSource: number,
  droppableDestination: number,
) {
  const sourceClone = Array.from(source);
  const destClone = Array.from(destination);
  const [removed] = sourceClone.splice(droppableSource, 1);
  destClone.splice(droppableDestination, 0, removed);
  return [sourceClone, destClone];
}

/**************************** hooks ****************************/

export function usePersistFn<T extends (...args: unknown[]) => unknown>(fn?: T) {
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

type UseResizeObserver<T extends HTMLElement> = {
  ref: React.RefObject<T>;
  bounds: Bounds;
  refreshBounds: () => void;
};
export function useResizeObserver<T extends HTMLElement>(): UseResizeObserver<T> {
  const [bounds, setBounds] = React.useState<Bounds>({
    left: 0,
    top: 0,
    width: 0,
    height: 0,
    right: 0,
    bottom: 0,
  });

  const observerRef = React.useRef<ResizeObserver>();
  const ref = React.useRef<T>(null);

  if (!observerRef.current) {
    observerRef.current = new ResizeObserver(([entry]) => {
      setBounds(entry.target.getBoundingClientRect());
    });
  }

  React.useLayoutEffect(() => {
    if (ref?.current && ref.current instanceof HTMLElement)
      observerRef.current?.observe(ref.current);
    return () => observerRef.current?.disconnect();
  }, [ref]);

  const refreshBounds = React.useCallback(
    () =>
      ref.current &&
      ref.current instanceof HTMLElement &&
      setBounds(ref.current.getBoundingClientRect()),
    [],
  );

  return { ref, bounds, refreshBounds };
}
