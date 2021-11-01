import React from 'react';
import classNames from 'classnames';
import { useDraggable } from '../../../src';

import { Handle } from '../Item/Handle';

import { DraggableIcon, DraggableHorizontal, DraggableVertical } from './DraggableIcon';
import styles from './Draggable.module.less';

export const Draggable = ({
  id = 'draggable',
  disabled = false,
  dragOverlay = false,
  handle = false,
  style,
  axis = '',
  translate,
  ...props
}: {
  [key: string]: any;
}) => {
  const { ref, draggableId, dragHandleProps, dragProps } = useDraggable({ id, disabled });
  const dragging = draggableId === id;

  return (
    <div
      className={classNames(
        styles.Draggable,
        dragOverlay && styles.dragOverlay,
        dragging && styles.dragging,
        handle && styles.handle,
      )}
      {...dragProps}
      style={{
        transform: `translate3d(${translate.x}px, ${translate.y}px, 0px)`,
        transition: 'none',
      }}
    >
      <button
        ref={ref}
        {...props}
        aria-label="Draggable"
        data-cypress="draggable-item"
        {...(handle ? {} : dragHandleProps)}
      >
        {axis === 'y' ? DraggableVertical : axis === 'x' ? DraggableHorizontal : DraggableIcon}
        {handle ? <Handle {...(handle ? dragHandleProps : {})} /> : null}
      </button>
    </div>
  );
};
