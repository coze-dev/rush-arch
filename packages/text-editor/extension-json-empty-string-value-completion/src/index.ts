import { FacetCombineStrategy } from '@coze-editor/utils';
import astField, {
  type ArrayASTNode,
  type ASTNode,
  findNodeAtOffset,
  type PropertyASTNode,
} from '@coze-editor/extension-json-ast';
import { showTooltip, type TooltipView } from '@codemirror/view';
import {
  type EditorState,
  type Extension,
  Facet,
  StateField,
} from '@codemirror/state';

type JSONPath = string | number;

interface TriggerContext {
  position: number;
  paths: JSONPath[];
}

type TriggerHandler = (e: TriggerContext) => TooltipView | undefined;

const triggerHandlerFacet = Facet.define<TriggerHandler, TriggerHandler>({
  combine: FacetCombineStrategy.Last,
});

const field = StateField.define<TriggerContext | undefined>({
  create(state) {
    return getTriggerContext(state);
  },
  update(value, tr) {
    if (tr.docChanged || !tr.startState.selection.eq(tr.state.selection)) {
      return getTriggerContext(tr.state);
    }
    return value;
  },
  provide(f) {
    return showTooltip.compute([f], state => {
      const triggerContext = state.field(f);
      if (!triggerContext) {
        return null;
      }

      const render = state.facet(triggerHandlerFacet);
      const tooltip = render({
        position: triggerContext.position,
        paths: triggerContext.paths,
      });

      if (!tooltip) {
        return null;
      }

      return {
        pos: triggerContext.position,
        create() {
          return tooltip;
        },
      };
    });
  },
});

function getTriggerContext(state: EditorState): TriggerContext | undefined {
  const ast = state.field(astField);
  const { head, anchor } = state.selection.main;

  if (head !== anchor || !ast) {
    return;
  }

  const node = findNodeAtOffset(ast, head, true);

  if (
    node?.type === 'string' &&
    node.value === '' &&
    // between "" or between ''
    head > node.offset &&
    head < node.offset + node.length
  ) {
    return {
      position: head,
      paths: getPaths(node),
    };
  }
}

function isInProperty(node?: ASTNode): boolean {
  return node?.parent?.type === 'property';
}

function isItemNode(node?: ASTNode): boolean {
  const parentNode = node?.parent;

  if (!node || !parentNode) {
    return false;
  }

  return parentNode.type === 'array' && parentNode.items.indexOf(node) !== -1;
}

function getPaths(node: ASTNode) {
  const paths: JSONPath[] = [];

  let target: ASTNode | undefined = node;
  while (target) {
    if (isInProperty(target)) {
      const key = (target.parent as PropertyASTNode).keyNode.value;
      paths.unshift(key);
    } else if (isItemNode(target)) {
      const itemIndex = (target.parent as ArrayASTNode).items.indexOf(target);
      paths.unshift(itemIndex);
    }

    target = target.parent;
  }

  return paths;
}

const extension = (handler: TriggerHandler): Extension[] => [
  triggerHandlerFacet.of(handler),
  field,
];

export default extension;
