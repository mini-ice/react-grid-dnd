import * as React from 'react';
import { useDndContext } from './DndContext';

type UseDraggable = {
  id: string;
  disabled: boolean;
};

export function useDraggable({ id, disabled }: UseDraggable) {
  const { draggableId, draggableNodes, listeners } = useDndContext();
  const ref = React.useRef(null);
  const key = `draggable-${id}`;

  const isDragging = draggableId === id;

  const style = React.useMemo<React.CSSProperties | null>(() => {
    const basicStyles: React.CSSProperties = {
      userSelect: 'none',
      pointerEvents: 'none',
    };
    if (!draggableId) return null;

    if (isDragging) return basicStyles;

    return {
      ...basicStyles,
      transition: 'transform 0.2s ease 0s',
    };
  }, [draggableId, isDragging]);

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
      style,
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
