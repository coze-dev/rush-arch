import { CodeHighlight } from '@coze-editor/editor/react-code-highlight';
import { useEffect, useState } from 'react';
import { examples } from './examples';
import { EditorView } from '@codemirror/view';

const HighlightPage = () => {
  const [code, setCode] = useState('const a = 1;');
  const [path, setPath] = useState('a.js');

  useEffect(() => {
    const interval = setInterval(() => {
      setCode(prevCode => prevCode + '\n');
    }, 1000);
    return () => clearInterval(interval);
  }, []);

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
              setCode(code);
              setPath(path);
            }}
          >
            {path}
          </button>
        ))}
      </div>
      <CodeHighlight
        code={code}
        path={path}
        domProps={{
          style: {
            width: '200px',
            border: '1px solid #000',
          },
        }}
        didMount={api => {
          console.log('didMount', api);
        }}
        extensions={[
          EditorView.theme({
            '& .cm-content': {
              fontSize: '16px',
            },
          }),
        ]}
      />
    </div>
  );
};

export default HighlightPage;
