import React, { useState, useCallback, Fragment } from 'react';
import type { ReactPortal } from 'react';

type PortalItem = {
  id: string;
  portal: ReactPortal;
};

function createPortalConnector() {
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
    }, []);
    const removeItem = useCallback((id: string) => {
      setItems(items => items.filter(item => item.id !== id));
    }, []);

    add = addItem;
    remove = removeItem;

    return <Fragment>{items.map(item => item.portal)}</Fragment>;
  }

  return {
    connect,
    disconnect,
    Portal,
  };
}

type Connector = ReturnType<typeof createPortalConnector>;

export { createPortalConnector };
export type { Connector };
