import { CodeHighlight } from '@coze-editor/editor/react-code-highlight';
import { useEffect, useState } from 'react';
import { examples } from './examples';

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
      <CodeHighlight code={code} path={path} />
    </div>
  );
};

export default HighlightPage;
