import { Decoration, type DecorationSet } from '@codemirror/view';
import { type Range } from '@codemirror/state';

import { type Diagnostic, type Severity } from './index';

const splitDiagnosticBySeverity = (decorations: DecorationSet) => {
  const diagnosticMap = new Map<Severity, Diagnostic[]>();
  const decoration = decorations.iter();

  while (decoration.value) {
    const { severity } = decoration.value.spec.diagnostic;

    if (!diagnosticMap.has(severity)) {
      diagnosticMap.set(severity, []);
    }

    diagnosticMap.get(severity)!.push(decoration.value.spec.diagnostic);

    decoration.next();
  }

  return diagnosticMap;
};

const createDecoration = (
  from: number,
  to: number,
  severity: Severity,
  diagnostics: Diagnostic[],
) => {
  const last = diagnostics[diagnostics.length - 1];

  return Decoration.mark({
    attributes: {
      class: `cm-lintRange cm-lintRange-${
        severity
      }${last.markClass ? ` ${last.markClass}` : ''}`,
    },
    sourceDiagnostics: diagnostics,
  }).range(from, to);
};

interface MergedDiagnostic extends Partial<Diagnostic> {
  sourceDiagnostics: Diagnostic[];
}

const mergeDecoration = (diagnostics: Diagnostic[]): MergedDiagnostic[] => {
  const cloned = diagnostics.map(e => ({
    from: e.from,
    to: e.to,
  }));

  const merged: MergedDiagnostic[] = [];

  cloned.sort((a, b) => a.from - b.from);

  let current = cloned[0];
  let currentSourceDiagnostics: Diagnostic[] = [diagnostics[0]];

  for (let i = 1; i < cloned.length; i++) {
    const next = cloned[i];

    if (next.from <= current.to) {
      currentSourceDiagnostics.push(diagnostics[i]);
      current.to = Math.max(current.to, next.to);
    } else {
      merged.push({ ...current, sourceDiagnostics: currentSourceDiagnostics });
      current = next;
      currentSourceDiagnostics = [diagnostics[i]];
    }
  }

  merged.push({ ...current, sourceDiagnostics: currentSourceDiagnostics });

  return merged;
};

export const mergeDecorations = (decorations: DecorationSet): DecorationSet => {
  try {
    const diagnosticMap = splitDiagnosticBySeverity(decorations);
    const merge: Range<Decoration>[] = [];

    diagnosticMap.forEach((value, key) => {
      mergeDecoration(value).forEach(diagnostic => {
        if (
          typeof diagnostic.from !== 'number' ||
          typeof diagnostic.to !== 'number'
        ) {
          return;
        }
        if (diagnostic.from <= diagnostic.to) {
          merge.push(
            createDecoration(
              diagnostic.from,
              diagnostic.to,
              key,
              diagnostic.sourceDiagnostics,
            ),
          );
        }
      });
    });

    merge.sort((a, b) => {
      if (a.from !== b.from) {
        return a.from - b.from;
      }

      return a.value.startSide - b.value.startSide;
    });

    return Decoration.set(merge);
  } catch (e) {
    console.error('FlowLangSDK: linter mergeDecorations error', e);
    return decorations;
  }
};
