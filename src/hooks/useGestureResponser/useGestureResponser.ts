import * as React from 'react';
import { usePersistFn } from '../usePersistFn';
import { State, DragTypes, MouseButton, Options, EventTypes, Config } from './types';
import {
  preventDefault,
  isActiveCoordinates,
  hasExceededDistance,
  binds,
  getPosition,
} from './utils';

const defaultConfig: Config = { enableMouse: true };

const initialState = {
  type: null,
  coordinates: { x: 0, y: 0 },
  initialCoordinates: { x: 0, y: 0 },
  prevCoordinates: { x: 0, y: 0 },
  offset: { x: 0, y: 0 },
  velocity: 0,
  distance: 0,
  time: Date.now(),
};

export function useGestureResponser(options: Options, config: Config = defaultConfig) {
  const { onBeforeStart, onStart, onMove, onEnd, onCancel } = options;
  const { enableMouse, distance, delay, tolerance } = config;

  if (delay && distance) {
    throw Error(
      'Attempt set both "distance" and "delay" on useGestureResponser Config, you may only use one or the other, not both at the same time.',
    );
  }

  const state = React.useRef<State>(initialState);
  const isTouched = React.useRef(false);
  const timerId = React.useRef<number | null>(null);
  const unbinds = React.useRef<(() => void) | null>(null);

  const updateStartState = (
    event: Event,
    type: DragTypes.DragStart | DragTypes.BeforeDragStart = DragTypes.DragStart,
  ) => {
    const { x, y } = getPosition(event);
    state.current = {
      ...initialState,
      type,
      coordinates: { x, y },
      initialCoordinates: { x, y },
      prevCoordinates: { x, y },
      time: Date.now(),
    };
  };

  const updateMoveState = (event: Event) => {
    const { x, y } = getPosition(event);
    const prevState = state.current;
    const time = Date.now();
    const offset = {
      x: x - prevState.initialCoordinates.x,
      y: y - prevState.initialCoordinates.y,
    };
    const distance = Math.sqrt(Math.pow(offset.x, 2) + Math.pow(offset.y, 2));
    const velocity = distance / (time - prevState.time);
    const coordinates = { x, y };

    state.current = {
      ...prevState,
      type: DragTypes.DragUpdate,
      coordinates,
      prevCoordinates: prevState.coordinates,
      offset,
      time,
      distance,
      velocity,
    };
  };

  const handleEnd = usePersistFn((event: Event) => {
    if (event.cancelable) {
      preventDefault(event);
    }

    isTouched.current = false;

    if (timerId.current) {
      clearTimeout(timerId.current);
      timerId.current = null;
    }
    unbinds.current && unbinds.current();

    state.current = { ...state.current, type: DragTypes.DragEnd, time: Date.now() };
    onEnd && onEnd(state.current, event);
  });

  const handleCancel = usePersistFn(() => {
    isTouched.current = false;

    if (timerId.current) {
      clearTimeout(timerId.current);
      timerId.current = null;
    }
    unbinds.current && unbinds.current();

    state.current = { ...state.current, type: DragTypes.DragCancel, time: Date.now() };
    onCancel && onCancel(state.current);
  });

  const handleMove = usePersistFn((event: Event) => {
    if (!isActiveCoordinates(state.current.initialCoordinates)) return;
    updateMoveState(event);

    // https://developer.mozilla.org/en-US/docs/Web/API/Event/cancelable
    if (event.cancelable) {
      preventDefault(event);
    }

    if (!isTouched.current) {
      if (delay && hasExceededDistance(state.current, tolerance)) {
        handleCancel && handleCancel();
        return;
      }

      if (distance && hasExceededDistance(state.current, distance)) {
        if (hasExceededDistance(state.current, tolerance)) {
          handleCancel && handleCancel();
          return;
        }
        handleStart && handleStart(event);
      }
    }

    if (isTouched.current) {
      onMove && onMove(state.current, event);
    }
  });

  const handleStart = usePersistFn((event: Event) => {
    updateStartState(event);

    const shouldHandleStart = onBeforeStart ? onBeforeStart(state.current, event) : true;
    if (!shouldHandleStart) return;
    isTouched.current = true;

    onStart && onStart(state.current, event);
  });

  const handlePress = usePersistFn((event: React.TouchEvent | React.MouseEvent) => {
    if (
      event.nativeEvent instanceof MouseEvent &&
      event.nativeEvent.buttons === MouseButton.RightClick
    ) {
      return;
    }

    if (!handleStart) return;

    unbinds.current = binds([
      { type: EventTypes.TouchMove, listener: handleMove },
      { type: EventTypes.TouchEnd, listener: handleEnd },
      { type: EventTypes.MouseMove, listener: handleMove },
      { type: EventTypes.MouseUp, listener: handleEnd },
      { type: EventTypes.TouchCancel, listener: handleCancel },
      { type: EventTypes.VisibilityChange, listener: handleCancel },
      { type: EventTypes.Resize, listener: handleCancel },
      { type: EventTypes.ContextMenu, listener: preventDefault },
    ]);

    updateStartState(event.nativeEvent, DragTypes.BeforeDragStart);

    if (distance) {
      return;
    }

    if (delay) {
      timerId.current = window.setTimeout(() => {
        handleStart(event.nativeEvent);
      }, delay);
      return;
    }

    handleStart(event.nativeEvent);
  });

  React.useEffect(
    () => () => {
      unbinds.current && unbinds.current();
    },
    [],
  );

  return React.useMemo(
    () =>
      enableMouse
        ? {
            onTouchStart: handlePress,
            onMouseDown: handlePress,
            onDragStart: preventDefault,
          }
        : { onTouchStart: handlePress, onDragStart: preventDefault },
    [enableMouse, handlePress],
  );
}
