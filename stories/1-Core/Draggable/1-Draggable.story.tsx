import React, { useState } from 'react';
import { DndContext } from '../../../src';
import type { SensorConfig } from '@/index';
import { Draggable } from '../../components/Draggable';

type Translate = {
  x: number;
  y: number;
};

const defaultCoordinates = {
  x: 0,
  y: 0,
};

function DraggableStory({
  sensorConfig,
  ...props
}: {
  sensorConfig?: SensorConfig;
  [key: string]: any;
}) {
  const [{ translate }, setTranslate] = useState<{
    initialTranslate: Translate;
    translate: Translate;
  }>({ initialTranslate: defaultCoordinates, translate: defaultCoordinates });
  const [initialWindowScroll, setInitialWindowScroll] = useState(defaultCoordinates);

  return (
    <DndContext
      sensorConfig={sensorConfig}
      onDragStart={() => {
        setInitialWindowScroll({
          x: window.scrollX,
          y: window.scrollY,
        });
      }}
      onDragUpdate={(state) => {
        setTranslate(({ initialTranslate }) => ({
          initialTranslate,
          translate: {
            x: initialTranslate.x + state.offset.x,
            y: initialTranslate.y + state.offset.y,
          },
        }));
      }}
      onDragEnd={() => {
        setTranslate(({ translate }) => {
          return {
            translate,
            initialTranslate: translate,
          };
        });
        setInitialWindowScroll(defaultCoordinates);
      }}
      onDragCancel={() => {
        setTranslate(({ initialTranslate }) => ({
          translate: initialTranslate,
          initialTranslate,
        }));
        setInitialWindowScroll(defaultCoordinates);
      }}
    >
      <Draggable translate={translate} {...props} />
    </DndContext>
  );
}

export function BasicSetup() {
  return <DraggableStory />;
}

export function UserHandle() {
  return <DraggableStory handle />;
}

export function PressDelay() {
  return <DraggableStory sensorConfig={{ delay: 500 }} />;
}

export function PressDelayAndTolerance() {
  return <DraggableStory sensorConfig={{ delay: 500, tolerance: 15 }} />;
}

export function MinimumDistance() {
  return <DraggableStory sensorConfig={{ distance: 15 }} />;
}

export function MinimumDistanceX() {
  return <DraggableStory sensorConfig={{ distance: { x: 15 } }} />;
}

export function MinimumDistanceY() {
  return <DraggableStory sensorConfig={{ distance: { y: 15 } }} />;
}

export function MinimumDistanceXY() {
  return <DraggableStory sensorConfig={{ distance: { x: 15, y: 15 } }} />;
}

export function HorizontalAxis() {
  return <DraggableStory sensorConfig={{ axis: 'x' }} />;
}

export function VerticalAxis() {
  return <DraggableStory sensorConfig={{ axis: 'y' }} />;
}

export default {
  title: 'Core/Draggable/Hooks/useDraggable',
};
