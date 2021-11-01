import * as React from 'react';
import { useLazyMemo } from './hooks';
import { useDndContext, useActiveDraggable } from './DndContext';
import { ViewRect } from './types';

// export const defaultDropAnimation: DropAnimation = {
//   duration: 250,
//   easing: 'ease',
//   dragSourceOpacity: 0,
// };

type Props = {
  className?: string;
  // dropAnimation?: DropAnimation | null | undefined;
  style?: React.CSSProperties;
  wrapperElement?: keyof JSX.IntrinsicElements;
  zIndex?: number;
};

export const DragOverlay: React.FC<Props> = React.memo(function DragOverly(props) {
  const { wrapperElement = 'div', className, style: styleProp, zIndex = 999, children } = props;
  const { draggableId, draggableNodeRect, overlayNode } = useDndContext();
  const transform = useActiveDraggable();
  const isDragging = !!draggableId;

  const initialNodeRect = useLazyMemo<ViewRect | null>(
    (prevVal) => {
      if (isDragging) {
        return prevVal ?? draggableNodeRect;
      }

      return null;
    },
    [isDragging, draggableNodeRect],
  );

  const style: React.CSSProperties | undefined = initialNodeRect
    ? {
        position: 'fixed',
        width: initialNodeRect.width,
        height: initialNodeRect.height,
        top: initialNodeRect.top,
        left: initialNodeRect.left,
        transform: `translate3d(${transform?.x}px, ${transform?.y}px, 0) scaleX(${transform?.scaleX}) scaleY(${transform?.scaleY})`,
        touchAction: 'none',
        zIndex,
        ...styleProp,
      }
    : undefined;

  const attributes = isDragging
    ? {
        style,
        children,
        className,
      }
    : undefined;

  const attributesSnapshot = React.useRef(attributes);

  if (!draggableId) return null;

  // const finalTransform = `translate3d(${x}px, ${y}px, 0) scaleX(${scaleX}) scaleY(${scaleY})`;
  return React.createElement(wrapperElement, { className, style, ref: overlayNode.ref }, children);
});
