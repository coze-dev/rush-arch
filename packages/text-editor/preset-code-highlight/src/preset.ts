import { api, extension } from '@coze-editor/core';
import { Compartment, type Extension } from '@codemirror/state';

import { getLanguage } from './languages';

const languageCompartment = new Compartment();

export const preset = [
  api('setPath', ({ view }) => (path: string) => {
    getLanguage(path)
      .then(languageExtension => {
        view.dispatch({
          effects: [
            languageCompartment.reconfigure(
              languageExtension ? [languageExtension as Extension] : [],
            ),
          ],
        });
      })
      .catch(() => {
        console.error(`Failed to load language for file: ${path}`);
      });
  }),
  extension(languageCompartment.of([])),
];
