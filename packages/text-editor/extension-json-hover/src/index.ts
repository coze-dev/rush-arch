import astField, {
  type ArrayASTNode,
  type ASTNode,
  findNodeAtOffset,
  type PropertyASTNode,
} from '@coze-editor/extension-json-ast';
import { hoverTooltip, type TooltipView } from '@codemirror/view';

type JSONPath = string | number;

interface Options {
  key: (e: { paths: JSONPath[] }) => TooltipView | undefined;
}

const jsonHover = (options: Options) => [
  astField,
  hoverTooltip((view, pos) => {
    const ast = view.state.field(astField);

    if (!ast) {
      return null;
    }

    const node = findNodeAtOffset(ast, pos, true);

    // hover on key
    if (node && isKeyNode(node)) {
      const tooltip = options.key({
        paths: getPaths(node),
      });

      if (!tooltip) {
        return null;
      }

      return {
        pos: node.offset,
        end: node.offset + node.length,
        create() {
          return tooltip;
        },
      };
    }

    return null;
  }),
];

function isKeyNode(node?: ASTNode): boolean {
  const parentNode = node?.parent;

  if (!node || !parentNode) {
    return false;
  }

  return (
    node.type === 'string' &&
    parentNode.type === 'property' &&
    parentNode.keyNode === node
  );
}

function isInProperty(node?: ASTNode): boolean {
  return node?.parent?.type === 'property';
}

function isItemNode(node?: ASTNode): boolean {
  const parentNode = node?.parent;

  if (!node || !parentNode) {
    return false;
  }

  return parentNode.type === 'array' && !!~parentNode.items.indexOf(node);
}

function getPaths(node: ASTNode): JSONPath[] {
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

export default jsonHover;
