import React, { useEffect, useState } from 'react';
import { Droppable } from '@hello-pangea/dnd';
import type { DroppableProps, DroppableProvided, DroppableStateSnapshot } from '@hello-pangea/dnd';

interface StrictModeDroppableProps extends Omit<DroppableProps, 'children'> {
  children: (provided: DroppableProvided, snapshot: DroppableStateSnapshot) => React.ReactElement;
}

export function StrictModeDroppable({ children, ...props }: StrictModeDroppableProps) {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const animation = requestAnimationFrame(() => setEnabled(true));

    return () => {
      cancelAnimationFrame(animation);
      setEnabled(false);
    };
  }, []);

  if (!enabled) {
    return null;
  }

  return <Droppable {...props}>{children}</Droppable>;
} 