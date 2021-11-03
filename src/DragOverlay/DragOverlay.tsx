import * as React from 'react';
import { useLazyMemo } from '../hooks';
import { useDndContext, useActiveDraggable } from '../DndContext';
import { ViewRect } from '../types';
import { useDropAnimation, DropAnimation } from './useDropAnimation';

const defaultDropAnimation: DropAnimation = {
  duration: 250,
  easing: 'ease',
  dragSourceOpacity: 1,
};

type Props = {
  className?: string;
  dropAnimation?: DropAnimation | null | undefined;
  style?: React.CSSProperties;
  wrapperElement?: keyof JSX.IntrinsicElements;
  zIndex?: number;
};

export const DragOverlay: React.FC<Props> = React.memo(function DragOverly(props) {
  const {
    wrapperElement = 'div',
    className,
    style: styleProp,
    zIndex = 999,
    dropAnimation = defaultDropAnimation,
    children,
  } = props;
  const { draggableId, draggableNodes, draggableNodeRect, dragOverlay } = useDndContext();
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

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const attributes = isDragging ? { style, children, className, transform: transform } : undefined;

  const attributesSnapshot = React.useRef(attributes);
  const derivedAttributes = attributes ?? attributesSnapshot.current;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { children: finalChildren, transform: _, ...otherAttributes } = derivedAttributes ?? {};

  const prevActiveId = React.useRef(draggableId ?? null);
  const dropAnimationComplete = useDropAnimation({
    animate: Boolean(dropAnimation && prevActiveId.current && !draggableId),
    draggableId: prevActiveId.current,
    draggableNodes,
    duration: dropAnimation?.duration,
    easing: dropAnimation?.easing,
    dragSourceOpacity: dropAnimation?.dragSourceOpacity,
    node: dragOverlay.ref.current,
    transform: attributesSnapshot.current?.transform,
  });

  const shouldRender = Boolean(
    finalChildren && (children || (dropAnimation && !dropAnimationComplete)),
  );

  React.useEffect(() => {
    if (draggableId !== prevActiveId.current) {
      prevActiveId.current = draggableId ?? null;
    }

    if (draggableId && attributesSnapshot.current !== attributes) {
      attributesSnapshot.current = attributes;
    }
  }, [draggableId, attributes]);

  React.useEffect(() => {
    if (dropAnimationComplete) {
      attributesSnapshot.current = undefined;
    }
  }, [dropAnimationComplete]);

  if (!shouldRender) return null;

  return React.createElement(
    wrapperElement,
    { ref: dragOverlay.ref, ...otherAttributes },
    finalChildren,
  );
});
