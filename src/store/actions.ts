import type { Coordinates, UniqueId, DroppableContainer } from '@/types';

export enum Action {
  DragStart = 'dragStart',
  DragMove = 'dragMove',
  DragEnd = 'dragEnd',
  DragCancel = 'dragCancel',
  DragOver = 'dragOver',
  RegisterDroppable = 'registerDroppable',
  SetDroppableDisabled = 'setDroppableDisabled',
  UnregisterDroppable = 'unregisterDroppable',
}

export type Actions =
  | {
      type: Action.DragStart;
      id: UniqueId;
      droppableId?: UniqueId;
      initialCoordinates: Coordinates;
    }
  | { type: Action.DragMove; coordinates: Coordinates }
  | { type: Action.DragEnd }
  | { type: Action.DragCancel }
  | {
      type: Action.RegisterDroppable;
      element: DroppableContainer;
    }
  | {
      type: Action.SetDroppableDisabled;
      id: UniqueId;
      key: UniqueId;
      disabled: boolean;
    }
  | {
      type: Action.UnregisterDroppable;
      id: UniqueId;
      key: UniqueId;
    };
