export const examples = [
  {
    code: `
<template>
  <div>
    <h1>Hello World</h1>
  </div>
</template>
`,
    path: 'a.vue',
  },
  {
    code: `
import React from 'react';

function App() {
  return (
    <div>
      <h1>Hello World</h1>
      {/* hello() */}
    </div>
  );
}

export default App;
`,
    path: 'a.tsx',
  },
  {
    code: `import React from 'react';

function App() {
  return (
    <div>
      {/* hello() */}
      <h1>Hello World</h1>
    </div>
  );
}

export default App;
`,
    path: 'a.jsx',
  },
  {
    code: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
</head>
<body>
  <h1>Hello World</h1>
  <!-- hello() -->
</body>
</html>
`,
    path: 'a.html',
  },
  {
    code: `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <circle cx="50" cy="50" r="40" stroke="green" stroke-width="4" fill="yellow" />
</svg>
`,
    path: 'a.svg',
  },
  {
    code: `
body {
  background-color: #f0f0f0;
}
`,
    path: 'a.scss',
  },
  {
    code: `
{
  "name": "John Doe",
  "age": 30,
  "city": "New York"
}
`,
    path: 'a.json',
  },
  {
    code: `
## Markdown Example

This is a markdown example.
`,
    path: 'a.md',
  },
  {
    code: 'const a = (1);',
    path: 'a.js',
  },
  {
    code: 'const b = 2;',
    path: 'b.ts',
  },
  {
    code: `#!/bin/bash
echo 'hello world'
`,
    path: 'c.sh',
  },
  {
    code: `
-- d.sql
SELECT * FROM table;
`,
    path: 'd.sql',
  },
  {
    code: `
/* e.css */
body {
  background-color: #f0f0f0;
}
`,
    path: 'e.css',
  },
  {
    code: `
def main():
    print('hello world')

if __name__ == '__main__':
    main()
`,
    path: 'f.py',
  },
];
