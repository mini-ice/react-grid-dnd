export function swap<T>(array: T[], moveIndex: number, toIndex: number) {
  const item = array[moveIndex];
  const length = array.length;
  const diff = moveIndex - toIndex;

  if (diff > 0) {
    // move left
    return [
      ...array.slice(0, toIndex),
      item,
      ...array.slice(toIndex, moveIndex),
      ...array.slice(moveIndex + 1, length),
    ];
  } else if (diff < 0) {
    // move right
    const targetIndex = toIndex + 1;
    return [
      ...array.slice(0, moveIndex),
      ...array.slice(moveIndex + 1, targetIndex),
      item,
      ...array.slice(targetIndex, length),
    ];
  }
  return array;
}

export function move<T>(
  source: Array<T>,
  destination: Array<T>,
  droppableSource: number,
  droppableDestination: number,
) {
  const sourceClone = Array.from(source);
  const destClone = Array.from(destination);
  const [removed] = sourceClone.splice(droppableSource, 1);
  destClone.splice(droppableDestination, 0, removed);
  return [sourceClone, destClone];
}

export function setInlineStyles(el: HTMLElement, styles: any) {
  Object.keys(styles).forEach((key) => {
    el.style[key as any] = styles[key as any];
  });
}
