export interface GridSettings {
  boxesPerRow: number;
  rowHeight: number;
  columnWidth: number;
}

export interface Bounds {
  left: number;
  height: number;
  top: number;
  right: number;
  bottom: number;
  width: number;
}

export interface TraverseType {
  sourceId: string;
  targetId: string;
  rx: number;
  ry: number;
  tx: number;
  ty: number;
  sourceIndex: number;
  targetIndex: number;
  execute?: boolean;
}
