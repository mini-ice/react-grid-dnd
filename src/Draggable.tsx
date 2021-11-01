import * as React from 'react';
import { useDndContext } from './DndContext';
import { useGestureResponser } from './hooks';
import type { SensorConfig } from './hooks';

type UseDraggable = {
  id: string;
  disabled?: boolean;
  sensorConfig?: SensorConfig;
};

export function useDraggable({ id, disabled = false, sensorConfig }: UseDraggable) {
  const {
    draggableId,
    draggableNodes,
    sensorConfig: defaultSensorConfig,
    handleDragStart,
    handleDragUpdate,
    handleDragEnd,
    handleDragCancel,
  } = useDndContext();
  const ref = React.useRef(null);
  const key = `draggable-${id}`;

  const isDragging = draggableId === id;

  const listeners = useGestureResponser(
    {
      onStart: (state, event) => handleDragStart(id, state, event),
      onMove: handleDragUpdate,
      onEnd: handleDragEnd,
      onCancel: handleDragCancel,
    },
    { ...defaultSensorConfig, ...sensorConfig },
  );

  React.useEffect(() => {
    draggableNodes[id] = {
      id,
      key,
      node: ref,
    };
    return () => {
      const node = draggableNodes[id];
      if (node && node.key === key) {
        delete draggableNodes[id];
      }
    };
  }, [id, disabled, draggableNodes, key]);

  return {
    ref,
    isDragging,
    draggableId,
    dragProps: {
      'data-draggable-id': id,
      'data-draggable-key': key,
    },
    dragHandleProps: {
      'data-draggable-id': id,
      'data-draggable-key': key,
      'data-disabled': disabled,
      ...(!disabled ? listeners : undefined),
    },
  };
}
