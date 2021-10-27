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

  const isDragging = !!draggableId;

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
    dragProps: {
      style: isDragging
        ? { transition: 'transform 0.2s ease 0s', userSelect: 'none', boxSizing: 'border-box' }
        : undefined,
      'data-draggable-id': id,
      'data-draggable-key': key,
    },
    dragHandleProps: {
      'data-draggable-id': id,
      'data-draggable-key': key,
      disabled: disabled,
      ...(!disabled ? listeners : undefined),
    },
  };
}
