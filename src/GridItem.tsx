import * as React from 'react';
import classNames from 'classnames';
import { StateType, useGestureResponder } from 'react-gesture-responder';
import { animated, interpolate, useSpring } from 'react-spring';
import { useGridItemContext } from './GridItemContext';
// import { NodeType } from '@/utils';

interface IGridItem extends React.HTMLAttributes<HTMLDivElement> {
  disabled?: boolean;
}

// function shouldPreventDefault(event: DragEvent) {
//   return (
//     event.nativeEvent instanceof MouseEvent &&
//     Object.prototype.hasOwnProperty.call(NodeType, event?.currentTarget?.tagName)
//   );
// }

export const GridItem: React.FC<IGridItem> = ({ className, style, children, ...other }) => {
  const context = useGridItemContext();
  if (!context) {
    throw Error(
      'Unable to find GridItem context. Please ensure that GridItem is used as a child of GridDropZone',
    );
  }

  const {
    top,
    disableDrag,
    endTraverse,
    onStart,
    mountWithTraverseTarget,
    left,
    i,
    onMove,
    onEnd,
    grid,
    dragging: isDragging,
  } = context;

  const { columnWidth, rowHeight } = grid;
  const dragging = React.useRef(false);
  const startCoords = React.useRef([left, top]);

  const [styles, set] = useSpring(() => {
    if (mountWithTraverseTarget) {
      // this feels really brittle. unsure of a better
      // solution for now.

      const mountXY = mountWithTraverseTarget;

      endTraverse();

      return {
        xy: mountXY,
        immediate: true,
        zIndex: 1,
        scale: 1.1,
        opacity: 0.8,
      };
    }

    return {
      xy: [left, top],
      immediate: true,
      zIndex: 0,
      scale: 1,
      opacity: 1,
    };
  });

  // handle move updates imperatively
  function handleMove(state: StateType) {
    const x = startCoords.current[0] + state.delta[0];
    const y = startCoords.current[1] + state.delta[1];
    set({
      xy: [x, y],
      zIndex: 1,
      immediate: true,
      opacity: 0.8,
      scale: 1.1,
    });

    onMove(state, x, y);
  }

  // handle end of drag
  function handleEnd(state: StateType) {
    const x = startCoords.current[0] + state.delta[0];
    const y = startCoords.current[1] + state.delta[1];
    dragging.current = false;
    set({
      xy: [left, top],
      zIndex: 0,
      opacity: 1,
      scale: 1,
      immediate: false,
    });
    onEnd(state, x, y);
  }

  const { bind } = useGestureResponder(
    {
      onMoveShouldSet: () => {
        if (disableDrag) {
          return false;
        }

        onStart();

        startCoords.current = [left, top];
        dragging.current = true;
        return true;
      },
      onMove: handleMove,
      onTerminationRequest: () => {
        if (dragging.current) {
          return false;
        }

        return true;
      },
      onTerminate: handleEnd,
      onRelease: handleEnd,
    },
    {
      enableMouse: true,
    },
  );

  /**
   * Update our position when left or top
   * values change
   */

  React.useEffect(() => {
    if (!dragging.current) {
      set({
        xy: [left, top],
        zIndex: 0,
        opacity: 1,
        scale: 1,
        immediate: false,
      });
    }
  }, [left, set, top]);

  const props = {
    className: classNames(className, {
      'grid-item-dragging': isDragging,
      'grid-item-disabled': disableDrag,
    }),
    ...bind,
    style: {
      cursor: !!disableDrag ? 'grab' : undefined,
      zIndex: styles.zIndex,
      position: 'absolute',
      width: columnWidth + 'px',
      opacity: styles.opacity,
      height: rowHeight + 'px',
      boxSizing: 'border-box',
      transform: interpolate(
        [styles.xy, styles.scale],
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (xy: any, s: any) => `translate3d(${xy[0]}px, ${xy[1]}px, 0) scale(${s})`,
      ),
      ...style,
    } as React.CSSProperties,
    ...other,
  };

  return typeof children === 'function' ? (
    children(animated.div, props, {
      dragging: isDragging,
      disabled: !!disableDrag,
      i,
      grid,
    })
  ) : (
    <animated.div {...props}>{children}</animated.div>
  );
};

GridItem.displayName = 'GridItem';
