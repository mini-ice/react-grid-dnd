import * as React from 'react';
import { createNamedContext } from './utils';
import { useDndContext } from './DndContext';
import { Action } from './store';

export const DroppableContext = createNamedContext('Droppable', {
  droppableId: 'droppable',
});

export function useDroppableContext() {
  const context = React.useContext(DroppableContext);

  return context;
}

type UseDroppable = {
  id: string;
  disabled: boolean;
};

export function useDroppable<T extends HTMLElement>({ id, disabled = false }: UseDroppable) {
  const { dispatch } = useDndContext();
  const key = `droppable-${id}`;
  const node = React.useRef<T | null>(null);

  React.useEffect(() => {
    const isHtmlElement = node.current && node.current instanceof HTMLElement;
    if (isHtmlElement) {
      dispatch({
        type: Action.RegisterDroppable,
        element: {
          id,
          key,
          disabled,
          node,
        },
      });
    }

    return () => {
      isHtmlElement &&
        dispatch({
          type: Action.UnregisterDroppable,
          id,
          key,
        });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  React.useEffect(() => {
    if (node.current && node.current instanceof HTMLElement) {
      dispatch({
        type: Action.SetDroppableDisabled,
        id,
        key,
        disabled,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [disabled]);

  return {
    ref: node,
    key,
    droppableProps: {
      'data-droppable-id': id,
      'data-droppable-key': key,
    },
  };
}

// export const Droppable: React.FC<any> = ({ droppableId, disabled, className, style, children }) => {
//   const { key, ref, droppableProps } = useDroppable<HTMLDivElement>({ id: droppableId, disabled });
//   const droppableContext = React.useMemo(
//     () => ({ droppableId, droppableKey: key }),
//     [droppableId, key],
//   );

//   return (
//     <DroppableContext.Provider value={droppableContext}>
//       <div ref={ref} className={className} style={style} {...droppableProps}>
//         {children}
//       </div>
//     </DroppableContext.Provider>
//   );
// };
