import universal from '@coze-editor/editor/preset-universal';
import universalCode from '@coze-editor/editor/preset-universal-code';
import autoLanguage from '@coze-editor/editor/preset-code-languages';
import { useState } from 'react';
import { examples } from './examples';
import { createEditor, ValueSync } from '@coze-editor/editor/react';

const CodeHighlight = createEditor([
  ...universal,
  ...universalCode,
  ...autoLanguage,
], {
  defaultOptions: {
    fontSize: 15,
    readOnly: true,
    editable: false,
  }
})

const HighlightPage = () => {
  const [code, setCode] = useState('const a = 1;');
  const [path, setPath] = useState('a.js');

  return (
    <div>
      <div>
        {examples.map(({ code, path }) => (
          <button
            style={{
              marginRight: 8,
            }}
            key={path}
            onClick={() => {
              setCode(code.trim());
              setPath(path);
            }}
          >
            {path}
          </button>
        ))}
      </div>
      <CodeHighlight
        domProps={{
          style: {
            width: '500px',
            border: '1px solid #000',
          },
        }}
        options={{
          path: path,
          activeLine: false,
        }}
        didMount={api => {
          console.log('didMount', api);
        }}
      >
        <ValueSync value={code}></ValueSync>
      </CodeHighlight>
    </div>
  );
};

export default HighlightPage;
