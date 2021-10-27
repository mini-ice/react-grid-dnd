import * as React from 'react';
import type { Coordinates } from '../types';
import { getPosition } from '../utils';
import { usePersistFn } from './usePersistFn';

type State = {
  coordinates: Coordinates;
  initialCoordinates: Coordinates;
  prevCoordinates: Coordinates;
  offset: Coordinates;
  velocity: number;
  distance: number;
  time: number;
};

type DragEvent = React.TouchEvent | React.MouseEvent | Event;

type Options = {
  onBeforeStart?: (state?: State, event?: DragEvent) => boolean;
  onStart?: (state: State, event: DragEvent) => void;
  onMove?: (state: State, event: DragEvent) => void;
  onEnd?: (state: State, event: DragEvent) => void;
};

type Config = {
  enableMouse: boolean;
};

enum EventTypes {
  TouchMove = 'touchmove',
  TouchEnd = 'touchend',
  TouchCancel = 'touchcancel',
  MouseMove = 'mousemove',
  MouseUp = 'mouseup',
}

type GlobalEvent = {
  type: EventTypes;
  listener?: (event: MouseEvent | TouchEvent) => void;
  options?: boolean | AddEventListenerOptions;
};

const defaultConfig = { enableMouse: true };

const initialState = {
  coordinates: { x: 0, y: 0 },
  initialCoordinates: { x: 0, y: 0 },
  prevCoordinates: { x: 0, y: 0 },
  offset: { x: 0, y: 0 },
  velocity: 0,
  distance: 0,
  time: Date.now(),
};

const defaultBeforeStart = () => true;

const preventDefault = (event: DragEvent) => {
  event.preventDefault();
};

const bindGlobalEvents = (events: GlobalEvent[] = []) => {
  events.forEach(({ type, listener, options }) => {
    if (type && typeof listener === 'function') {
      window.addEventListener(type, listener, options);
    }
  });
};

const removeGlobalEvent = (events: GlobalEvent[] = []) => {
  events.forEach(({ type, listener }) => {
    if (type && typeof listener === 'function') {
      window.removeEventListener(type, listener);
    }
  });
};

export function useGestureResponser(options: Options, config: Config = defaultConfig) {
  const { onBeforeStart = defaultBeforeStart, onStart, onMove, onEnd } = options;
  const { enableMouse } = config;

  const state = React.useRef<State>(initialState);
  const isTouched = React.useRef(false);
  const lastRegisterEvents = React.useRef<GlobalEvent[]>([]);

  const updateStartState = (event: React.TouchEvent | React.MouseEvent) => {
    const { x, y } = getPosition(event.nativeEvent);
    state.current = {
      ...initialState,
      coordinates: { x, y },
      initialCoordinates: { x, y },
      prevCoordinates: { x, y },
      time: Date.now(),
    };
  };

  const updateMoveState = (event: TouchEvent | MouseEvent) => {
    const { x, y } = getPosition(event);
    const prevState = state.current;
    const time = Date.now();
    const distanceX = x - prevState.coordinates.x;
    const distanceY = y - prevState.coordinates.y;
    const offset = {
      x: x - prevState.initialCoordinates.x,
      y: y - prevState.initialCoordinates.y,
    };
    const distance = Math.sqrt(Math.pow(distanceX, 2) + Math.pow(distanceY, 2));
    const velocity = distance / (time - prevState.time);
    const coordinates = {
      x,
      y,
    };

    state.current = {
      ...prevState,
      coordinates,
      offset,
      time,
      distance,
      velocity,
    };
  };

  const handleMove = usePersistFn((event: TouchEvent | MouseEvent) => {
    if (event instanceof TouchEvent) {
      preventDefault(event);
    }

    if (isTouched.current) {
      updateMoveState(event);

      onMove && onMove(state.current, event);
    }
  });

  const handleEnd = usePersistFn((event: TouchEvent | MouseEvent) => {
    const prevTouched = isTouched.current;
    isTouched.current = false;

    removeGlobalEvent(lastRegisterEvents.current);

    if (prevTouched) {
      onEnd && onEnd(state.current, event);
    }
  });

  const handleStart = usePersistFn((event: React.TouchEvent | React.MouseEvent) => {
    updateStartState(event);

    if (onBeforeStart(state.current, event)) {
      isTouched.current = true;

      lastRegisterEvents.current = [
        { type: EventTypes.TouchMove, listener: handleMove },
        { type: EventTypes.TouchEnd, listener: handleEnd },
        { type: EventTypes.TouchCancel, listener: handleEnd },
        { type: EventTypes.MouseMove, listener: handleMove },
        { type: EventTypes.MouseUp, listener: handleEnd },
      ];

      bindGlobalEvents(lastRegisterEvents.current);

      onStart && onStart(state.current, event);
    }
  });

  React.useEffect(() => bindGlobalEvents, []);

  return React.useMemo(
    () =>
      enableMouse
        ? {
            onTouchStart: handleStart,
            onMouseDown: handleStart,
            onDragStart: preventDefault,
          }
        : {
            onTouchStart: handleStart,
            onDragStart: preventDefault,
          },
    [enableMouse, handleStart],
  );
}
