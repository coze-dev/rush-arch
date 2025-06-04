import { createPortal } from 'react-dom';
import React, {
  type ReactNode,
  type SVGProps,
  useEffect,
  useState,
} from 'react';

import { disposeAll } from '@text-editor/utils';
import {
  useInjectorEffect,
  useLatest,
  usePortalConnector,
} from '@text-editor/react-hooks';
import { useInjector } from '@text-editor/react';
import { v4 } from '@lukeed/uuid';
import { EditorView } from '@codemirror/view';
import { Prec } from '@codemirror/state';
import { codeFolding, foldGutter } from '@codemirror/language';

function FluentTriangleDown12Filled(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="8px"
      height="8px"
      viewBox="0 0 12 12"
      {...props}
    >
      <path
        fill="currentColor"
        d="M5.214 10.541a.903.903 0 0 0 1.572 0l4.092-7.169C11.226 2.762 10.789 2 10.09 2H1.91c-.698 0-1.135.762-.787 1.372z"
      ></path>
    </svg>
  );
}

function FluentTriangleRight12Filled(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="8px"
      height="8px"
      viewBox="0 0 12 12"
      {...props}
    >
      <path
        fill="currentColor"
        d="M10.541 6.786a.903.903 0 0 0 0-1.572L3.372 1.122C2.762.774 2 1.211 2 1.91v8.182c0 .698.762 1.135 1.372.787z"
      ></path>
    </svg>
  );
}

function defaultRenderMarker(open: boolean) {
  return open ? (
    <FluentTriangleDown12Filled />
  ) : (
    <FluentTriangleRight12Filled />
  );
}

function defaultRenderPlaceholder() {
  return null;
}

interface FoldGutterProps {
  renderMarker?: (open: boolean) => ReactNode | undefined;
  renderPlaceholder?: () => ReactNode | undefined;
  opacityTransition?: boolean;
  opacityTransitionDuration?: number;
}

function FoldGutter({
  renderMarker = defaultRenderMarker,
  renderPlaceholder = defaultRenderPlaceholder,
  opacityTransition = false,
  opacityTransitionDuration = 300,
}: FoldGutterProps) {
  const connector = usePortalConnector({ sync: true });
  const connectorRef = useLatest(connector);
  const renderMarkerRef = useLatest(renderMarker);
  const renderPlaceholderRef = useLatest(renderPlaceholder);
  const [opacity, setOpacity] = useState(0);
  const setOpacityRef = useLatest(setOpacity);
  const injector = useInjector();

  const { Portal } = connector;

  // inject transition after `opacity: 0` style being injected
  useEffect(() => {
    if (!opacityTransition || !opacityTransitionDuration) {
      return;
    }

    return injector.inject([
      EditorView.theme({
        '.cm-foldGutter': {
          transition: `opacity ${opacityTransitionDuration / 1000}s ease`,
        },
      }),
    ]);
  }, [injector, opacityTransition, opacityTransitionDuration]);

  useInjectorEffect(
    injector => {
      if (!opacityTransition) {
        return;
      }

      return injector.inject([
        Prec.lowest(
          EditorView.theme({
            '.cm-foldGutter': {
              opacity,
            },
          }),
        ),
      ]);
    },
    [opacityTransition, opacity],
  );

  useInjectorEffect(injector => {
    const disposes: (() => void)[] = [];

    return disposeAll([
      injector.inject([
        Prec.low(
          EditorView.theme({
            '.cm-foldGutter .cm-gutterElement': {
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer',
            },
          }),
        ),
        foldGutter({
          markerDOM(open) {
            const dom = document.createElement('span');
            dom.setAttribute('aria-expanded', open ? 'true' : 'false');
            const id = v4();
            connectorRef.current.connect(
              id,
              createPortal(renderMarkerRef.current(open), dom),
            );
            disposes.push(() => {
              connectorRef.current.disconnect(id);
            });
            return dom;
          },
          domEventHandlers: {
            mouseenter() {
              setOpacityRef.current(1);
              return true;
            },
            mouseleave() {
              setOpacityRef.current(0);
              return true;
            },
          },
        }),
        codeFolding({
          placeholderDOM(view, onclick) {
            const dom = document.createElement('span');
            const id = v4();
            connectorRef.current.connect(
              id,
              createPortal(renderPlaceholderRef.current(), dom),
            );
            disposes.push(() => {
              connectorRef.current.disconnect(id);
            });
            dom.addEventListener('click', onclick, false);
            disposes.push(() => {
              dom.removeEventListener('click', onclick, false);
            });
            return dom;
          },
        }),
      ]),
      ...disposes,
    ]);
  }, []);

  return <Portal />;
}

export { FoldGutter };
