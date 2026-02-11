import preset, { type EditorAPI, themes, transformerCreator } from '@coze-editor/editor/preset-code'
import { createRenderer, EditorProvider } from '@coze-editor/editor/react'
import { frozenRanges } from '@coze-editor/editor'
import { EditorView } from '@codemirror/view'
import { useEffect, useRef } from 'react'
import { darkTheme } from './theme'
import './language-features'
import { json, type Text } from '@coze-editor/editor/language-json'

themes.register('coze-dark', darkTheme)

const CodeEditor = createRenderer(preset, [
  EditorView.theme({
    '&.cm-focused': {
      outline: 'none',
    },
  }),
])

const defaultTSValue = `
async function main({ params }: Args): Promise<Output> {
  return {
    key: 'value',
    object: {
      field: 'field',
      dynamic: params.input,
    }
  }
}
`.trim()

const tsURI = 'file:///untitled.ts'

const uri = 'file:///untitled.json'

const schema = {
  "type": "object",
  "required": [],
  "properties": {
    "number": {
      "type": "number",
      "description": "hello"
    },
    "string": {
      "type": "string",
      "description": "world"
    },
    "status": {
      "type": "string",
      "description": "The status",
      "enum": [
        "active",
        "inactive"
      ]
    }
  }
}

json.languageService.configureSchemas({
  uri: 'foo',
  fileMatch: [
    uri,
  ],
  schema,
})

const defaultValue = `{
  "hello": {{hello}},
  "title": "",
  "world": {{world}},
  "field": 111,
  "string": 222,
  "number": 333,
  property: true,
  "array": [
    "http://x.com",
    "http://y.com"
  ]
}`

interface Match {
  match: string;
  range: [number, number];
}

function findAllMatches(inputString: string, regex: RegExp): Match[] {
  const globalRegex = new RegExp(
    regex,
    regex.flags.includes('g') ? regex.flags : `${regex.flags}g`,
  );
  let match;
  const matches: Match[] = [];

  while (true) {
    match = globalRegex.exec(inputString);
    if (!match) {
      break;
    }

    if (match.index === globalRegex.lastIndex) {
      globalRegex.lastIndex++;
    }
    matches.push({
      match: match[0],
      range: [match.index, match.index + match[0].length],
    });
  }

  return matches;
}

const transform = (text: Text) => {
  const originalSource = text.toString();
  // eslint-disable-next-line no-useless-escape
  const matches = findAllMatches(originalSource, /\{\{([^\}]*)\}\}/g);

  if (matches.length > 0) {
    matches.forEach(({ range }) => {
      text.replaceRange(range[0], range[1], 'null');
    });
  }

  return text;
}

const transformer = transformerCreator(transform);

function findFrozenRanges(text: string) {
  const regex = /function/g;
  const matches = text.matchAll(regex);
  const results = [];
  for (const match of matches) {
    results.push({
      from: match.index,
      to: match.index + match[0].length
    });
  }
  return results;
}

const extensions = [
  frozenRanges.of(state => {
    const text = state.doc.toString();
    return findFrozenRanges(text);
  }),
];

function Page() {
  const editorRef = useRef<EditorAPI | null>(null)

  useEffect(() => {
    setTimeout(() => {
      json.languageService.validate(defaultValue, {
        schema,
        transform,
      }).then(result => {
        console.log('validate result', result)
      })
    }, 2000)
  }, [])

  return <>
    <EditorProvider>
      <CodeEditor
        defaultValue={defaultValue}
        options={{
          uri,
          languageId: 'json',
          theme: 'coze-dark',
          height: 300,
          transformer,
        }}
        extensions={extensions}
        didMount={(editor: EditorAPI) => {
          editorRef.current = editor
        }}
      />
    </EditorProvider>

    <br />

    <EditorProvider>
      <CodeEditor
        defaultValue={defaultTSValue}
        options={{
          uri: tsURI,
          languageId: 'typescript',
          theme: 'coze-dark',
          height: 300,
        }}
        extensions={extensions}
      />
    </EditorProvider>
  </>
}

export {
  CodeEditor
}

export default Page
