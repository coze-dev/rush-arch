import {
  EditorView,
  hoverTooltip,
  ViewPlugin,
  type Tooltip,
} from '@codemirror/view';
import {
  StateField,
  StateEffect,
  type EditorState,
  Facet,
} from '@codemirror/state';

type GetTypeInformation = (
  state: EditorState,
  pos: number,
) =>
  | Promise<{
      type: string;
      properties: {
        name: string;
        type: string;
      }[];
    } | null>
  | undefined;

const cmdKeyPressedState = StateField.define<boolean>({
  create: () => false,
  update: (value, tr) => {
    for (const effect of tr.effects) {
      if (effect.is(setCmdKeyPressedEffect)) {
        return effect.value;
      }
    }
    return value;
  },
});

const setCmdKeyPressedEffect = StateEffect.define<boolean>();

const cmdKeyEventPlugin = ViewPlugin.fromClass(
  class {
    private dispose: () => void;
    constructor(view: EditorView) {
      const onKeyDown = (event: KeyboardEvent) => {
        if (event.metaKey && !view.state.field(cmdKeyPressedState)) {
          view.dispatch({ effects: setCmdKeyPressedEffect.of(true) });
        }
      };

      const onKeyUp = (event: KeyboardEvent) => {
        if (!event.metaKey && view.state.field(cmdKeyPressedState)) {
          view.dispatch({ effects: setCmdKeyPressedEffect.of(false) });
        }
      };

      const onBlur = () => {
        if (view.state.field(cmdKeyPressedState)) {
          view.dispatch({ effects: setCmdKeyPressedEffect.of(false) });
        }
      };

      window.addEventListener('keydown', onKeyDown);
      window.addEventListener('keyup', onKeyUp);
      window.addEventListener('blur', onBlur);

      this.dispose = () => {
        window.removeEventListener('keydown', onKeyDown);
        window.removeEventListener('keyup', onKeyUp);
        window.removeEventListener('blur', onBlur);
      };
    }
    destroy() {
      this.dispose();
    }
  },
);

const getTypeInformationFacet = Facet.define<
  GetTypeInformation,
  GetTypeInformation
>({
  combine(values) {
    return values[values.length - 1];
  },
});

const cmdHoverTooltipSource = async (
  view: EditorView,
  pos: number,
  side: -1 | 1,
): Promise<Tooltip | null> => {
  const word = view.state.wordAt(pos);

  if (!word) {
    return null;
  }

  if (!view.state.facet(getTypeInformationFacet)) {
    return null;
  }

  const doTypeInfoFn = view.state.facet(getTypeInformationFacet);
  const info = await doTypeInfoFn?.(view.state, word.from);

  if (!info) {
    return null;
  }

  return {
    pos: word.from,
    end: word.to,
    above: true,
    create() {
      const dom = document.createElement('div');
      dom.className = 'cm-type-tooltip';

      const cmdPressed = view.state.field(cmdKeyPressedState, false);
      dom.style.display = cmdPressed ? 'block' : 'none';

      if (info?.properties?.length) {
        const propsDiv = document.createElement('div');
        propsDiv.className = 'cm-type-tooltip-properties';

        const propsHeader = document.createElement('div');
        propsHeader.className = 'cm-type-tooltip-props-header';
        propsHeader.textContent = 'Properties:';
        propsDiv.appendChild(propsHeader);

        const propsList = document.createElement('ul');
        propsList.className = 'cm-type-tooltip-props-list';

        info.properties.forEach(prop => {
          if (
            prop &&
            typeof prop.name === 'string' &&
            typeof prop.type === 'string'
          ) {
            const propItem = document.createElement('li');
            propItem.className = 'cm-type-tooltip-prop-item';

            const propName = document.createElement('span');
            propName.className = 'cm-type-tooltip-prop-name';
            propName.textContent = prop.name;
            propItem.appendChild(propName);

            const separator = document.createTextNode(': ');
            propItem.appendChild(separator);

            const propType = document.createElement('span');
            propType.className = 'cm-type-tooltip-prop-type';
            propType.textContent = prop.type;
            propItem.appendChild(propType);

            propsList.appendChild(propItem);
          }
        });
        propsDiv.appendChild(propsList);
        dom.appendChild(propsDiv);
      }

      return {
        dom,
        update(update) {
          for (const tr of update.transactions) {
            for (const effect of tr.effects) {
              if (effect.is(setCmdKeyPressedEffect)) {
                const show = effect.value;
                dom.style.display = show ? 'block' : 'none';
                break;
              }
            }
          }
        },
      };
    },
  };
};

const tooltipTheme = EditorView.theme({
  '.cm-tooltip .cm-type-tooltip': {
    padding: '0 10px 6px 10px',
    maxWidth: '350px',
  },
  '.cm-type-tooltip-properties': {
    paddingTop: '6px',
  },
  '.cm-type-tooltip-props-header': {
    fontWeight: 'bold',
    marginBottom: '4px',
    color: '#E06C75',
  },
  '.cm-type-tooltip-props-list': {
    listStyle: 'none',
    margin: '0',
  },
  '.cm-type-tooltip-prop-item': {
    marginBottom: '3px',
  },
  '.cm-type-tooltip-prop-name': {
    color: '#E5C07B',
  },
  '.cm-type-tooltip-prop-type': {
    color: '#ABB2BF',
  },
});

function typeInformation(getTypeInformation: GetTypeInformation) {
  return [
    getTypeInformationFacet.of(getTypeInformation),
    tooltipTheme,
    cmdKeyPressedState,
    cmdKeyEventPlugin,
    hoverTooltip(cmdHoverTooltipSource, {
      hoverTime: 300,
    }),
  ];
}

export default typeInformation;
