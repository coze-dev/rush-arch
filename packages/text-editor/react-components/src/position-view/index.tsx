import { createPortal } from 'react-dom';
import React, {
  type ReactNode,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

import { createPortalConnector } from '@coze-editor/react-hooks';
import {
  useEditor,
  useInjector,
  type BuiltinEditorAPI,
} from '@coze-editor/react';
import { type Tooltip } from '@codemirror/view';

import {
  addPositionViewProvider,
  positionViewProvidersState,
  positionViewTooltipsState,
  removePositionViewProvider,
  updatePositionViews,
} from './extension';

interface PositionViewProps {
  className?: string;
  pos: number;
  visible?: boolean;
  arrow?: boolean;
  children?: ReactNode;
}

type PositionStateOptions = Pick<
  PositionViewProps,
  'className' | 'pos' | 'visible' | 'arrow'
> & { contentDOM: HTMLElement };

class PositionState {
  private _tooltip: Tooltip | null = null;

  constructor(private _options: PositionStateOptions) {
    const { className, pos, visible, arrow, contentDOM } = _options;

    let tooltip: Tooltip | null = null;

    if (pos >= 0 && visible !== false) {
      tooltip = {
        pos,
        arrow,
        create() {
          const dom = document.createElement('div');
          if (className) {
            dom.classList.add(className);
          }
          dom.appendChild(contentDOM);

          return {
            dom,
            overlap: true,
          };
        },
      };
    }

    this._tooltip = tooltip;
  }

  update(newOptions: PositionStateOptions) {
    const equals = Object.keys(newOptions).every(
      key => (newOptions as any)[key] === (this._options as any)[key],
    );

    if (equals) {
      return this;
    }

    return new PositionState(newOptions);
  }

  get tooltip(): Tooltip {
    return this._tooltip!;
  }
}

function useLatest<T>(state: T) {
  const ref = useRef<T>(state);
  ref.current = state;
  return ref;
}

function PositionView({
  className = '',
  pos = -1,
  visible = true,
  arrow = false,
  children,
}: PositionViewProps) {
  const injector = useInjector();
  const editor = useEditor<BuiltinEditorAPI>();
  const [connector] = useState(() => createPortalConnector());
  const posRef = useLatest(pos);
  const visibleRef = useLatest(visible);
  const arrowRef = useLatest(arrow);
  const classNameRef = useLatest(className);
  const { Portal } = connector;

  useLayoutEffect(
    () =>
      injector.inject([positionViewProvidersState, positionViewTooltipsState]),
    [injector],
  );

  useEffect(() => {
    if (!editor) {
      return;
    }

    const contentDOM = document.createElement('div');
    const container = contentDOM.appendChild(document.createElement('div'));
    const id = String(Math.random());
    connector.connect(id, createPortal(children, container));

    let positionState = new PositionState({
      className: classNameRef.current,
      pos: posRef.current,
      visible: visibleRef.current,
      arrow: arrowRef.current,
      contentDOM,
    });

    const provider = {
      provide() {
        positionState = positionState.update({
          className: classNameRef.current,
          pos: posRef.current,
          visible: visibleRef.current,
          arrow: arrowRef.current,
          contentDOM,
        });
        return positionState.tooltip;
      },
    };

    editor.$view.dispatch({
      effects: addPositionViewProvider.of(provider),
    });

    return () => {
      editor.$view.dispatch({
        effects: removePositionViewProvider.of(provider),
      });
    };
  }, [injector, editor]);

  useEffect(() => {
    if (!editor) {
      return;
    }

    editor.$view.dispatch({
      effects: updatePositionViews.of(null),
    });
  }, [editor, pos, visible, arrow]);

  return <Portal />;
}

export { PositionView };
