import * as React from 'react';
import { createNamedContext } from '@/utils';
import { StateType } from 'react-gesture-responder';
import { GridSettings } from './types';

export type DragEvent = React.TouchEvent | React.MouseEvent;

export interface IGridContextItem {
  top: number;
  disableDrag: boolean;
  endTraverse: () => void;
  mountWithTraverseTarget?: [number, number];
  left: number;
  i: number;
  onMove: (state: StateType, x: number, y: number) => void;
  onEnd: (state: StateType, x: number, y: number) => void;
  onStart: () => void;
  grid: GridSettings;
  dragging: boolean;
}

export interface IGridContextProvider {
  value: IGridContextItem;
}

export const GridItemContext = createNamedContext<IGridContextItem | null>('GridItemContext', null);

export const GridItemContextProvider: React.FC<IGridContextProvider> = ({ value, children }) => {
  return <GridItemContext.Provider value={value}>{children}</GridItemContext.Provider>;
};

export const useGridItemContext = () => {
  const context = React.useContext(GridItemContext);
  return context;
};
