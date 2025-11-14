import React, { createContext, type ReactNode, useContext } from 'react';

const Context = createContext('');

function ElementProvider({
  internalId,
  children,
}: {
  internalId: string;
  children: ReactNode;
}) {
  return <Context.Provider value={internalId}>{children}</Context.Provider>;
}

function useElementId() {
  const id = useContext(Context);
  return id;
}

export { ElementProvider, useElementId };
