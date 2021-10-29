export enum DragTypes {
  BeforeDragStart = 'beforeDragStart',
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
  initialCoordinates: Coordinates;
  prevCoordinates: Coordinates;
  offset: Coordinates;
  velocity: number;
  distance: number;
  time: number;
};

export enum MouseButton {
  RightClick = 2,
}

export type DragEvent = React.TouchEvent | React.MouseEvent | Event;

export type Options = {
  onBeforeStart?: (state?: State, event?: DragEvent) => boolean;
  onStart?: (state: State, event: Event) => void;
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
  listener?: <T extends Event>(event: T) => void;
  options?: boolean | AddEventListenerOptions;
};

export type DistanceMeasurement =
  | number
  | Coordinates
  | Pick<Coordinates, 'x'>
  | Pick<Coordinates, 'y'>;

export enum Axis {
  All = 'xy',
  Vertical = 'y',
  Horizontal = 'x',
}

export type Config = {
  enableMouse: boolean;
  delay?: number;
  tolerance?: DistanceMeasurement;
  distance?: DistanceMeasurement;
  axis?: Axis;
};
