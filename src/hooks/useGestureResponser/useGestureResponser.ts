import * as React from 'react';
import { usePersistFn } from '../usePersistFn';
import { State, DragTypes, MouseButton, Options, EventTypes, Config, SensorEvent } from './types';
import {
  preventDefault,
  isActiveCoordinates,
  hasExceededDistance,
  binds,
  getPosition,
} from './utils';

const defaultConfig: Config = {};

const initialState: State = {
  type: null,
  coordinates: { x: 0, y: 0 },
  initial: { x: 0, y: 0 },
  previous: { x: 0, y: 0 },
  offset: { x: 0, y: 0 },
  local: { x: 0, y: 0 },
  lastLocal: { x: 0, y: 0 },
  velocity: 0,
  distance: 0,
  time: Date.now(),
};

export function useGestureResponser(options: Options, config: Config = defaultConfig) {
  const { onStartShouldSet, onStart, onMoveShouldSet, onMove, onEnd, onCancel } = options;
  const { enableMouse = true, distance, delay, tolerance, axis = 'xy' } = config;

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
    event: SensorEvent,
    type: DragTypes.DragStart | DragTypes.DragPress = DragTypes.DragStart,
  ) => {
    const { x, y } = getPosition(event instanceof Event ? event : event.nativeEvent);
    state.current = {
      ...initialState,
      type,
      lastLocal: state.current.lastLocal || initialState.lastLocal,
      coordinates: { x, y },
      initial: { x, y },
      previous: { x, y },
      time: Date.now(),
    };
  };

  const updateMoveState = (event: Event) => {
    const { x, y } = getPosition(event);
    const prevState = state.current;
    const time = Date.now();
    const lockHorizatal = axis === 'y';
    const lockVertial = axis === 'x';
    const offset = {
      x: lockHorizatal ? 0 : x - prevState.initial.x,
      y: lockVertial ? 0 : y - prevState.initial.y,
    };
    const local = {
      x: lockHorizatal ? 0 : prevState.lastLocal.x + x,
      y: lockVertial ? 0 : prevState.lastLocal.y + y,
    };
    const distance = Math.sqrt(Math.pow(offset.x, 2) + Math.pow(offset.y, 2));
    const velocity = distance / (time - prevState.time);
    const coordinates = { x, y };

    state.current = {
      ...prevState,
      type: DragTypes.DragUpdate,
      coordinates,
      previous: prevState.coordinates,
      offset,
      local,
      distance,
      velocity,
      time,
    };
  };

  const handleEnd = usePersistFn((event: Event) => {
    preventDefault(event);

    isTouched.current = false;

    if (timerId.current) {
      clearTimeout(timerId.current);
      timerId.current = null;
    }
    unbinds.current && unbinds.current();
    const prevState = state.current;

    state.current = {
      ...prevState,
      type: DragTypes.DragEnd,
      lastLocal: prevState.local,
      time: Date.now(),
    };
    onEnd && onEnd(state.current, event);
  });

  const handleCancel = usePersistFn(() => {
    isTouched.current = false;

    if (timerId.current) {
      clearTimeout(timerId.current);
      timerId.current = null;
    }
    unbinds.current && unbinds.current();
    const prevState = state.current;

    state.current = {
      ...prevState,
      type: DragTypes.DragEnd,
      lastLocal: prevState.local,
      time: Date.now(),
    };
    onCancel && onCancel(state.current);
  });

  const handleMove = usePersistFn((event: Event) => {
    if (!isActiveCoordinates(state.current.initial)) return;
    preventDefault(event);

    updateMoveState(event);

    if (!isTouched.current) {
      if (delay && hasExceededDistance(state.current, tolerance)) {
        // exist delay and exceed tolerance
        handleCancel && handleCancel();
        return;
      }

      if (distance && hasExceededDistance(state.current, distance)) {
        // exist distance and exceed distance
        if (hasExceededDistance(state.current, tolerance)) {
          // exceed tolerance
          handleCancel && handleCancel();
          return;
        }
        handleStart && handleStart(event);
      }
    }

    const shouldHandleSet = onMoveShouldSet ? onMoveShouldSet(state.current, event) : true;

    if (isTouched.current && shouldHandleSet) {
      onMove && onMove(state.current, event);
    }
  });

  const handleStart = usePersistFn((event: SensorEvent) => {
    updateStartState(event);
    const shouldHandleStart = onStartShouldSet ? onStartShouldSet(state.current, event) : true;
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

    updateStartState(event, DragTypes.DragPress);

    if (distance) {
      return;
    }

    if (delay) {
      event.persist();
      timerId.current = window.setTimeout(() => {
        handleStart(event);
      }, delay);
      return;
    }

    handleStart(event);
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
