// import * as React from 'react';

// import { useDndContext, useActiveDraggable } from './DndContext';

// export const DragOverly: React.FC<any> = React.memo(function DragOverly(props) {
//   const { style, children } = props;
//   const { isDragging, draggableNodeRect } = useDndContext();
//   const { x, y, scaleX = 1, scaleY = 1 } = useActiveDraggable();

//   if (!isDragging) return null;

//   const { left, top, width, height } = draggableNodeRect;

//   const finalTransform = `translate3d(${x}px, ${y}px, 0) scaleX(${scaleX}) scaleY(${scaleY})`;

//   return (
//     <div
//       style={{
//         position: 'fixed',
//         left,
//         top,
//         width,
//         height,
//         zIndex: 999,
//         touchAction: 'none',
//         boxSizing: 'border-box',
//         // transition: 'transform 0.2s ease 0s',
//         transform: finalTransform,
//         ...style,
//       }}
//     >
//       {children}
//     </div>
//   );
// });
