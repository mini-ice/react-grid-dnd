import * as React from 'react';
import { createNamedContext } from './utils';
import { reducer, getInitialState, Actions, Action } from './store';
import { useGestureResponser } from './hooks';
import type { State, Config as SensorConfig } from './hooks';
import {
  UniqueId,
  DraggableNode,
  LayoutRect,
  ViewRect,
  DroppableContainer,
  // Announcements,
} from './types';

// eslint-disable-next-line @typescript-eslint/no-empty-function
function noop(...args: any[]) {}

interface Transform {
  x: number;
  y: number;
  scaleX: number;
  scaleY: number;
}

export const ActiveDraggableContext = createNamedContext<Transform>('ActiveDraggableContext', {
  x: 0,
  y: 0,
  scaleX: 1,
  scaleY: 1,
});

export const useActiveDraggable = () => {
  const context = React.useContext(ActiveDraggableContext);

  return context;
};

interface IDndContext {
  dispatch: React.Dispatch<Actions>;
  draggableId: UniqueId | null;
  draggableNode: DraggableNode | null;
  draggableNodeRect: ViewRect | null;
  draggableNodes: Record<UniqueId, DraggableNode>;
  droppableContainers: Map<UniqueId, DroppableContainer>;
  droppableRects: Map<UniqueId, LayoutRect>;
  over: DroppableContainer | null;
  overlayNode: {
    ref: React.MutableRefObject<HTMLElement | null>;
    rect: ViewRect | null;
  } | null;
  scrollableAncestors: Element[];
  scrollableAncestorRects: ViewRect[];
  recomputeLayouts: () => void;
  willRecomputeLayouts: boolean;
  listeners: ReturnType<typeof useGestureResponser> | null;
}

export const Context = createNamedContext<IDndContext>('DndContext', {
  dispatch: noop,
  draggableId: null,
  draggableNode: null,
  draggableNodeRect: null,
  draggableNodes: {},
  droppableContainers: new Map(),
  droppableRects: new Map(),
  over: null,
  overlayNode: null,
  scrollableAncestors: [],
  scrollableAncestorRects: [],
  recomputeLayouts: noop,
  willRecomputeLayouts: false,
  listeners: null,
});

export const useDndContext = () => {
  const context = React.useContext(Context);

  if (!context) {
    throw Error('Unable to find Dnd context. Please ensure that is used as a child of DndContext');
  }

  return context;
};

interface Props {
  id?: string;
  autoScroll?: boolean;
  sensorConfig?: SensorConfig;
  onDragStart?: (state: State, event: Event) => void;
  onDragUpdate?: (state: State, event: Event) => void;
  onDragOver?: () => void;
  onDragEnd?: (state: State, event: Event) => void;
  onDragCancel?: (state: State) => void;
}

export const DndContext: React.FC<Props> = React.memo(function DndContext({
  onDragStart = noop,
  onDragUpdate = noop,
  onDragOver = noop,
  onDragEnd = noop,
  onDragCancel = noop,
  sensorConfig,
  children,
}) {
  const [store, dispatch] = React.useReducer(reducer, undefined, getInitialState);
  const { draggable, droppable } = store;
  const { id: draggableId, nodes: draggableNodes } = draggable;
  const draggableNode = draggableId ? draggableNodes[draggableId] : null;
  const draggableElement = draggableNode ? draggableNode?.node?.current : null;
  const draggableNodeRect = null;

  const { containers: droppableContainers } = droppable;

  const collisionRect = React.useRef<any | null>(null);

  const overId = draggableId && collisionRect.current ? '10' : null;
  const over = overId ? droppableContainers.get(overId) ?? null : null;

  const listeners = useGestureResponser(
    {
      onStart: (state, event) => {
        const { draggableId, droppableId } = (event?.target as HTMLElement)?.dataset;

        if (draggableId) {
          dispatch({
            type: Action.DragStart,
            id: draggableId,
            droppableId,
            initialCoordinates: state.initialCoordinates,
          });

          onDragStart(state, event);
        }
      },
      onMove: (state, event) => {
        if (draggableId) {
          dispatch({
            type: Action.DragMove,
            coordinates: state.coordinates,
          });

          onDragUpdate(state, event);
          // onDragUpdate({ id: draggableId }, event);
        }
      },
      onEnd: (state, event) => {
        dispatch({
          type: Action.DragEnd,
        });

        onDragEnd(state, event);
      },
      onCancel: (state) => {
        dispatch({
          type: Action.DragEnd,
        });

        onDragCancel(state);
      },
    },
    sensorConfig,
  );

  const memoContext = React.useMemo(
    () => ({
      dispatch,
      draggableId,
      draggableNode,
      draggableNodeRect,
      draggableNodes,
      droppableContainers,
      droppableRects: new Map(),
      over,
      overlayNode: {
        ref: { current: null },
        rect: null,
      },
      scrollableAncestors: [],
      scrollableAncestorRects: [],
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      recomputeLayouts: () => {},
      willRecomputeLayouts: false,
      listeners,
    }),
    [
      draggableId,
      draggableNode,
      draggableNodeRect,
      draggableNodes,
      droppableContainers,
      listeners,
      over,
    ],
  );

  return <Context.Provider value={memoContext}>{children}</Context.Provider>;
});
