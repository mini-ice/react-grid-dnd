import type React from 'react';
import { Coordinates, State, DistanceMeasurement, AttachEvent } from './types';

export const preventDefault = (event: Event | React.SyntheticEvent) => {
  // https://developer.mozilla.org/en-US/docs/Web/API/Event/cancelable
  if (event.cancelable) {
    event.preventDefault();
  }
};

export const isActiveCoordinates = (coordinates: Coordinates) => !!(coordinates.x || coordinates.y);

export const hasExceededDistance = (state: State, measurement?: DistanceMeasurement): boolean => {
  const dx = Math.abs(state.offset.x);
  const dy = Math.abs(state.offset.y);

  if (!measurement) return false;

  if (typeof measurement === 'number') {
    return state.distance > measurement;
  }

  if ('x' in measurement && 'y' in measurement) {
    return dx > measurement.x && dy > measurement.y;
  }

  if ('x' in measurement) {
    return dx > measurement.x;
  }

  if ('y' in measurement) {
    return dy > measurement.y;
  }

  return false;
};

export const binds = (events: AttachEvent[] = []) => {
  const finalEvents = events.filter(({ type, listener }) => type && typeof listener === 'function');

  finalEvents.forEach(({ type, listener, options }) => {
    window.addEventListener(type, listener as EventListenerOrEventListenerObject, options);
  });

  return function unbinds() {
    finalEvents.forEach(({ type, listener }) => {
      window.removeEventListener(type, listener as EventListenerOrEventListenerObject);
    });
  };
};

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
