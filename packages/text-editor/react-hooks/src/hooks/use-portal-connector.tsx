import { flushSync } from 'react-dom';
import React, { useState, useCallback } from 'react';
import type { ReactPortal } from 'react';

interface PortalItem {
  id: string;
  portal: ReactPortal;
}

function flush(fn: () => void, options: { sync: boolean }) {
  if (options.sync) {
    queueMicrotask(() => {
      flushSync(fn);
    });
  } else {
    fn();
  }
}

function createPortalConnector(options?: { sync?: boolean }) {
  let add = (id: string, portal: ReactPortal) => {};

  let remove = (id: string) => {};

  function connect(id: string, portal: ReactPortal) {
    add(id, portal);
  }

  function disconnect(id: string) {
    remove(id);
  }

  function Portal() {
    const [items, setItems] = useState<PortalItem[]>([]);

    const addItem = useCallback((id: string, portal: ReactPortal) => {
      flush(
        () => {
          setItems(prevItems => {
            const nextItems = [...prevItems];
            const index = nextItems.findIndex(item => item.id === id);
            if (index > -1) {
              nextItems[index] = { id, portal };
            } else {
              nextItems.push({ id, portal });
            }
            return nextItems;
          });
        },
        { sync: options?.sync ?? false },
      );
    }, []);

    const removeItem = useCallback((id: string) => {
      flush(
        () => {
          setItems(oldItems => oldItems.filter(item => item.id !== id));
        },
        { sync: options?.sync ?? false },
      );
    }, []);

    add = addItem;
    remove = removeItem;

    return <>{items.map(item => item.portal)}</>;
  }

  return {
    connect,
    disconnect,
    Portal,
  };
}

function usePortalConnector(options?: { sync?: boolean }) {
  const [connector] = useState(() => createPortalConnector(options));
  return connector;
}

export { createPortalConnector, usePortalConnector };
