import * as React from 'react';
import { UniqueId, DraggableNode, Transform } from '../types';
import { getMeasurableNode, getViewRect } from '../utils';

export interface DropAnimation {
  duration: number;
  easing: string;
  dragSourceOpacity?: number;
}

interface Arguments extends Partial<DropAnimation> {
  animate: boolean;
  draggableId: UniqueId | null;
  draggableNodes: Record<string, DraggableNode>;
  node: HTMLElement | null;
  transform?: Transform;
}

export function useDropAnimation({
  animate,
  draggableId,
  draggableNodes,
  easing,
  duration,
  dragSourceOpacity,
  node,
  transform,
}: Arguments) {
  const [dropAnimationComplete, setDropAnimationComplete] = React.useState(false);
  const timerId = React.useRef<number | null>(null);

  React.useEffect(() => {
    if (!animate || !draggableId || !easing || !duration) {
      if (animate) {
        setDropAnimationComplete(true);
      }
      return;
    }

    timerId.current = requestAnimationFrame(() => {
      const finalNode = draggableNodes[draggableId]?.node.current;

      if (transform && node && finalNode && finalNode.parentNode !== null) {
        if (!node) return;

        const fromNode = getMeasurableNode(node);

        if (!fromNode) return;

        const formRect = fromNode.getBoundingClientRect();
        const toRect = getViewRect(finalNode);
        const offset = {
          x: formRect.left - toRect.left,
          y: formRect.top - toRect.top,
        };

        if (Math.abs(offset.x) || Math.abs(offset.y)) {
          const scaleDelta = {
            scaleX: 1,
            scaleY: 1,
          };
          const finalTransform = `translate3d(${0}px, ${0}px, 0px) scaleX(${
            scaleDelta.scaleX
          }) scaleY(${scaleDelta.scaleY})`;

          const originalOpacity = finalNode.style.opacity;

          if (dragSourceOpacity != null) {
            finalNode.style.opacity = `${dragSourceOpacity}`;
          }

          const nodeAnimation = node.animate(
            [
              {
                transform: `translate3d(${transform.x}px, ${transform.y}px, 0px) scaleX(${transform.scaleX}) scaleY(${transform.scaleY})`,
              },
              { transform: finalTransform },
            ],
            {
              easing,
              duration,
            },
          );

          nodeAnimation.onfinish = () => {
            node.style.display = 'none';

            setDropAnimationComplete(true);

            if (finalNode && dragSourceOpacity != null) {
              finalNode.style.opacity = originalOpacity;
            }
          };

          return;
        }
      }
    });

    // return () => {
    //   timerId.current && cancelAnimationFrame(timerId.current);
    // };
  }, [animate, dragSourceOpacity, draggableId, draggableNodes, duration, easing, node, transform]);

  React.useLayoutEffect(() => {
    if (dropAnimationComplete) {
      setDropAnimationComplete(false);
    }
  }, [dropAnimationComplete]);

  return dropAnimationComplete;
}
