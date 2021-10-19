import * as React from 'react';
import { createNamedContext, getIndexFromCoordinates, getPositionForIndex } from '@/utils';
import { GridSettings, TraverseType, Bounds } from './types';

interface RegisterOptions extends Bounds {
  count: number;
  grid: GridSettings;
  disableDrop: boolean;
  refreshBounds: () => void;
}

interface IGridContext {
  register: (id: string, options: RegisterOptions) => void;
  remove: (id: string) => void;
  measureAll: () => void;
  getActiveDropId: (sourceId: string, x: number, y: number) => string | null;
  startTraverse: (
    sourceId: string,
    targetId: string,
    x: number,
    y: number,
    sourceIndex: number,
  ) => void;
  traverse: TraverseType | null;
  endTraverse: () => void;
  onChange: (sourceId: string, sourceIndex: number, targetIndex: number, targetId?: string) => void;
}

interface IGridContextProvider {
  onChange: (sourceId: string, sourceIndex: number, targetIndex: number, targetId?: string) => void;
}

const noop = () => {
  throw new Error('Make sure that you have wrapped your drop zones with GridContext');
};

export const GridContext = createNamedContext<IGridContext>('GridContext', {
  register: noop,
  remove: noop,
  getActiveDropId: noop,
  startTraverse: noop,
  measureAll: noop,
  traverse: null,
  endTraverse: noop,
  onChange: noop,
});

export const GridContextProvider: React.FC<IGridContextProvider> = ({ onChange, children }) => {
  const [traverse, setTraverse] = React.useState<TraverseType | null>(null);
  const dropRefs = React.useRef<Map<string, RegisterOptions>>(new Map());

  const register = React.useCallback(
    (id: string, options: RegisterOptions) => dropRefs.current.set(id, options),
    [],
  );

  const remove = React.useCallback((id: string) => dropRefs.current.delete(id), []);

  const getFixedPosition = (sourceId: string, rx: number, ry: number) => {
    const item = dropRefs.current.get(sourceId);

    if (!item) {
      return {
        x: rx,
        y: ry,
      };
    }

    const { left, top } = item;

    return {
      x: left + rx,
      y: top + ry,
    };
  };

  const getRelativePosition = (targetId: string, fx: number, fy: number) => {
    const item = dropRefs.current.get(targetId);
    return {
      x: fx - (item?.left || 0),
      y: fy - (item?.top || 0),
    };
  };

  const diffDropzones = (sourceId: string, targetId: string) => {
    const sBounds = dropRefs.current.get(sourceId);
    const tBounds = dropRefs.current.get(targetId);

    return {
      x: (tBounds?.left ?? 0) - (sBounds?.left ?? 0),
      y: (tBounds?.top ?? 0) - (sBounds?.top ?? 0),
    };
  };

  const getActiveDropId = (sourceId: string, x: number, y: number) => {
    const { x: fx, y: fy } = getFixedPosition(sourceId, x, y);

    for (const [key, bounds] of dropRefs.current.entries()) {
      if (
        !bounds.disableDrop &&
        fx > bounds.left &&
        fx < bounds.right &&
        fy > bounds.top &&
        fy < bounds.bottom
      ) {
        return key;
      }
    }

    return null;
  };

  const startTraverse = (
    sourceId: string,
    targetId: string,
    x: number,
    y: number,
    sourceIndex: number,
  ) => {
    const { x: fx, y: fy } = getFixedPosition(sourceId, x, y);
    const { x: rx, y: ry } = getRelativePosition(targetId, fx, fy);
    const { grid: targetGrid, count } = dropRefs.current.get(targetId) as RegisterOptions;

    const targetIndex = getIndexFromCoordinates(
      rx + targetGrid.columnWidth / 2,
      ry + targetGrid.rowHeight / 2,
      targetGrid,
      count,
    );

    const {
      xy: [px, py],
    } = getPositionForIndex(targetIndex, targetGrid);

    const { x: dx, y: dy } = diffDropzones(sourceId, targetId);

    if (
      !traverse ||
      !(traverse && traverse.targetIndex !== targetIndex && traverse.targetId !== targetId)
    ) {
      setTraverse({
        rx: px + dx,
        ry: py + dy,
        tx: rx,
        ty: ry,
        sourceId,
        targetId,
        sourceIndex,
        targetIndex,
      });
    }
  };

  const endTraverse = () => setTraverse(null);

  const onSwitch = (
    sourceId: string,
    sourceIndex: number,
    targetIndex: number,
    targetId?: string,
  ) => {
    setTraverse({
      ...(traverse as TraverseType),
      execute: true,
    });

    onChange(sourceId, sourceIndex, targetIndex, targetId);
  };

  const measureAll = () => {
    dropRefs.current.forEach((ref) => {
      ref.refreshBounds();
    });
  };

  return (
    <GridContext.Provider
      value={{
        register,
        remove,
        getActiveDropId,
        startTraverse,
        traverse,
        measureAll,
        endTraverse,
        onChange: onSwitch,
      }}
    >
      {children}
    </GridContext.Provider>
  );
};
