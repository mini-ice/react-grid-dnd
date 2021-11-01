export enum DragTypes {
  DragPress = 'dragPress',
  DragStart = 'dragStart',
  DragUpdate = 'dragUpdate',
  DragEnd = 'dragEnd',
  DragCancel = 'dragCancel',
}

export type Coordinates = {
  x: number;
  y: number;
};

export type State = {
  type: DragTypes | null;
  coordinates: Coordinates;
  initial: Coordinates;
  previous: Coordinates;
  offset: Coordinates;
  local: Coordinates;
  lastLocal: Coordinates;
  velocity: number;
  distance: number;
  time: number;
};

export enum MouseButton {
  RightClick = 2,
}

export type SensorEvent = React.TouchEvent | React.MouseEvent | Event;

export type Options = {
  onStartShouldSet?: (state: State, event: SensorEvent) => boolean;
  onStart?: (state: State, event: SensorEvent) => void;
  onMoveShouldSet?: (state: State, event: SensorEvent) => boolean;
  onMove?: (state: State, event: Event) => void;
  onEnd?: (state: State, event: Event) => void;
  onCancel?: (state: State) => void;
};

export enum EventTypes {
  TouchMove = 'touchmove',
  TouchEnd = 'touchend',
  TouchCancel = 'touchcancel',
  MouseMove = 'mousemove',
  MouseUp = 'mouseup',
  VisibilityChange = 'visibilitychange',
  Resize = 'resize',
  ContextMenu = 'contextmenu',
}

export type AttachEvent = {
  type: EventTypes;
  listener?: (event: Event) => void;
  options?: boolean | AddEventListenerOptions;
};

export type DistanceMeasurement =
  | number
  | Coordinates
  | Pick<Coordinates, 'x'>
  | Pick<Coordinates, 'y'>;

export type Config = {
  enableMouse?: boolean;
  delay?: number;
  tolerance?: DistanceMeasurement;
  distance?: DistanceMeasurement;
  axis?: 'xy' | 'x' | 'y';
};
