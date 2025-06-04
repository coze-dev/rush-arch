function disposeAll(disposes: unknown[]) {
  return () => {
    for (const dispose of disposes) {
      if (typeof dispose === 'function') {
        dispose();
      }
    }
  };
}

export { disposeAll };
