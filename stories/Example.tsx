import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { GridContext, GridDropZone, GridContextProvider } from '../src';
import { swap, move } from '../src/utils';

import { GridItem } from '../src/GridItem';

export function Example() {
  const [items, setItems] = React.useState([1, 2, 3, 4, 5, 6]); // supply your own state

  // target id will only be set if dragging from one dropzone to another.
  function onChange(sourceId: any, sourceIndex: any, targetIndex: any, targetId: any) {
    const nextState = swap(items, sourceIndex, targetIndex);
    setItems(nextState);
  }
  return (
    <GridContextProvider onChange={onChange}>
      <GridDropZone id="items" boxesPerRow={4} rowHeight={100} style={{ height: '400px' }}>
        {items.map((item: any) => (
          <GridItem key={item}>
            <div
              style={{
                width: '100%',
                height: '100%',
                padding: '4px',
                boxSizing: 'border-box',
              }}
            >
              <div
                style={{
                  height: '100%',
                  boxShadow: '1px 6px 12px rgba(0,0,0,0.15)',
                  borderRadius: '8px',
                }}
              >
                {item}
              </div>
            </div>
          </GridItem>
        ))}
      </GridDropZone>
    </GridContextProvider>
  );
}
