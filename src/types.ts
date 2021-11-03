import type * as React from 'react';

export type UniqueId = string;

export type DragEvent = React.TouchEvent | React.MouseEvent;

export interface LayoutRect {
  width: number;
  height: number;
  offsetLeft: number;
  offsetTop: number;
}

export interface ViewRect extends LayoutRect {
  top: number;
  left: number;
  right: number;
  bottom: number;
}

export type DroppableContainer = {
  id: string;
  key: string;
  disabled: boolean;
  node: React.MutableRefObject<HTMLElement | null>;
  rect?: React.MutableRefObject<ViewRect | null>;
};

export type DraggableNode = {
  id: UniqueId;
  key: UniqueId;
  node: React.MutableRefObject<HTMLElement | null>;
};

export type Announcements = {
  onDragStart: (id: UniqueId) => string | undefined;
  onDragMove: (id: UniqueId, overId?: UniqueId) => string | undefined;
  onDragEnd: (id: UniqueId, overId?: UniqueId) => string | undefined;
  onDragCancel: (id: UniqueId) => string | undefined;
};

export type Coordinates = {
  x: number;
  y: number;
};

export interface Transform {
  x: number;
  y: number;
  scaleX: number;
  scaleY: number;
}
