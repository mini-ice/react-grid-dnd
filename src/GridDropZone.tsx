import React from 'react';
import { StateType } from 'react-gesture-responder';
import { useResizeObserver, swap, getPositionForIndex, getTargetIndex } from '@/utils';
import { GridContext } from './GridContext';
import { GridItemContextProvider } from './GridItemContext';

interface IGridDropZone extends React.HtmlHTMLAttributes<HTMLDivElement> {
  boxesPerRow: number;
  rowHeight: number;
  disableDrag?: boolean;
  disableDrop?: boolean;
  id: string;
  [key: string]: unknown;
}

interface PlaceholderType {
  startIndex: number;
  targetIndex: number;
}

export const GridDropZone: React.FC<IGridDropZone> = ({
  id,
  boxesPerRow,
  children,
  className,
  style,
  disableDrag = false,
  disableDrop = false,
  rowHeight,
  ...other
}) => {
  const {
    traverse,
    startTraverse,
    endTraverse,
    register,
    measureAll,
    onChange,
    remove,
    getActiveDropId,
  } = React.useContext(GridContext);

  const { ref, bounds, refreshBounds } = useResizeObserver<HTMLDivElement>();
  const [draggingIndex, setDraggingIndex] = React.useState<number | null>(null);
  const [placeholder, setPlaceholder] = React.useState<PlaceholderType | null>(null);

  const traverseIndex =
    traverse && !traverse.execute && traverse.targetId === id ? traverse.targetIndex : null;

  const grid = React.useMemo(
    () => ({ columnWidth: (bounds?.width || 0) / boxesPerRow, boxesPerRow, rowHeight }),
    [bounds.width, boxesPerRow, rowHeight],
  );

  const childCount = React.Children.count(children);

  React.useEffect(() => {
    register(id, {
      top: bounds.top,
      bottom: bounds.bottom,
      left: bounds.left,
      right: bounds.right,
      width: bounds.width,
      height: bounds.height,
      count: childCount,
      grid,
      disableDrop,
      refreshBounds,
    });
  }, [childCount, disableDrop, bounds, id, grid, register, refreshBounds]);

  React.useEffect(() => {
    return () => remove(id);
  }, [id, remove]);

  const itemsIndexes = React.Children.map(children, (_, i) => i) || [];

  return (
    <div
      className={className}
      style={{
        position: 'relative',
        ...style,
      }}
      ref={ref}
      {...other}
    >
      {!grid.columnWidth
        ? null
        : React.Children.map(children, (child, i) => {
            const isTraverseTarget =
              traverse && traverse.targetId === id && traverse.targetIndex === i;

            const order = placeholder
              ? swap(itemsIndexes, placeholder.startIndex, placeholder.targetIndex)
              : itemsIndexes;

            const pos = getPositionForIndex(order.indexOf(i), grid, traverseIndex);

            const onStart = () => measureAll();

            const onMove = (state: StateType, x: number, y: number) => {
              if (!ref.current) return;

              if (draggingIndex !== i) {
                setDraggingIndex(i);
              }

              const targetDropId = getActiveDropId(
                id,
                x + grid.columnWidth / 2,
                y + grid.rowHeight / 2,
              );

              if (targetDropId && targetDropId !== id) {
                startTraverse(id, targetDropId, x, y, i);
              } else {
                endTraverse();
              }

              const targetIndex =
                targetDropId !== id
                  ? childCount
                  : getTargetIndex(i, grid, childCount, state.delta[0], state.delta[1]);

              if (targetIndex !== i) {
                if ((placeholder && placeholder.targetIndex !== targetIndex) || !placeholder) {
                  setPlaceholder({
                    targetIndex,
                    startIndex: i,
                  });
                }
              } else if (placeholder) {
                setPlaceholder(null);
              }
            };

            const onEnd = (state: StateType, x: number, y: number) => {
              const targetDropId = getActiveDropId(
                id,
                x + grid.columnWidth / 2,
                y + grid.rowHeight / 2,
              );

              const targetIndex =
                targetDropId !== id
                  ? childCount
                  : getTargetIndex(i, grid, childCount, state.delta[0], state.delta[1]);

              // traverse?
              if (traverse) {
                onChange(
                  traverse.sourceId,
                  traverse.sourceIndex,
                  traverse.targetIndex,
                  traverse.targetId,
                );
              } else {
                onChange(id, i, targetIndex);
              }

              setPlaceholder(null);
              setDraggingIndex(null);
            };

            return (
              <GridItemContextProvider
                value={{
                  top: pos.xy[1],
                  disableDrag,
                  endTraverse,
                  mountWithTraverseTarget: isTraverseTarget
                    ? [traverse?.tx, traverse?.ty]
                    : undefined,
                  left: pos.xy[0],
                  i,
                  onMove,
                  onEnd,
                  onStart,
                  grid,
                  dragging: i === draggingIndex,
                }}
              >
                {child}
              </GridItemContextProvider>
            );
          })}
    </div>
  );
};
