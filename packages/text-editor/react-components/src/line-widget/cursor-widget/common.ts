export interface CursorWidgetConfig {
  createDOM: () => HTMLElement;
  // 1-base
  lineNumber?: number;
  /*
  Which side of the given position the widget is on. When this is positive, the widget will be drawn after the cursor if the cursor is on the same position. Otherwise, it'll be drawn before it. When multiple widgets sit at the same position, their side values will determine their ordering—those with a lower value come first. Defaults to 0. May not be more than 10000 or less than -10000.
  */
  side?: number;
}

let nextID = 1;
export class ConfigFacet {
  id = nextID++;
  constructor(readonly config: CursorWidgetConfig) {}
}
