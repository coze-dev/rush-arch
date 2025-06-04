import { cursorWidgetState, setWidgetLineNumber } from './state';
import { ConfigFacet, type CursorWidgetConfig } from './common';

const cursorBlockWidget = (config: CursorWidgetConfig) => {
  const facet = new ConfigFacet(config);

  return {
    setWidgetLineNumber: (lineNumber?: number, side?: number) =>
      setWidgetLineNumber(facet.id, lineNumber, side),
    extension: [cursorWidgetState(facet)],
  };
};

export { cursorBlockWidget, setWidgetLineNumber };
