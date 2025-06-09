//  Copyright (c) 2025 coze-dev
//  SPDX-License-Identifier: MIT

/* eslint-disable */
import { Scanner, TokenType } from './scanner'
import { Parser } from './parser'

const source = `
hello{# 注释 #}world

{{{a: foo + bar * 1}}}

text

{% if foo is None %}
  if
{% elif %}

  elif

  {% if True %}
    nest if
  {% else %}
    nest else
  {% endif %}

{% else %}
  else
{% endif %}

end
`

const parser = new Parser()

const ast = parser.parse(source)
console.log(ast)

// const scanner = new Scanner()
// scanner.setSource(source)

// let i = 0
// while(true) {
//   const token = scanner.scan()

//   console.log('token', token)

//   i++

//   if (i > 10) {
//     break
//   }

//   if (token.type === TokenType.EOS) {
//     break
//   }
// }

