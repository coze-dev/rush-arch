/* eslint-disable */
import { printTree } from "@lezer-unofficial/printer"
import { parser } from './index'

// const source = `a {# 注释 #} a {%- for  xxx  -%}hello{{- foo + 1 +}}world{%+ endfor %}  dasdas bb`
// const source = `{{ '}}' }} {{ '{{' }} {{ "}}" }}`
// const source = `{#
// multiple line
// multiple line
// multiple line
// #} haha {# single line #}
// `
// const source = `a {% for item in items %} {% if a is defined %}`
// const source = `a {% if a is * defined(a + 1, "hello") 'world' if a is %}`
// const source = `
// a {% hello world %} {% if a is * defined(a + 1, "hello") 'world' if a is %} b
// {% raw %}
// {% if a is * defined(a + 1, "hello") 'world' if a is %}
// {% endraw %} b
// `.trim()
// const source = `{% if "hello\\"" x%} foo
// Empty slot: {#slot id="foo" placeholder="请输入"#}{#/slot#}
// `.trim()
// const source = `{% if "a\\"" is true %}`
// const source = `{{a + 1} ???`
// const source = `{% hello + 123 + ??? world {#comment#}aaa{#hello#}`
// 换行处理
// const source = `slot{% if a is none
// {#slot id="foo" placeholder="请输入"#}prefilled value{#/slot#}
// foo
// `
// 多余 {
// const source = `{{#slot id="foo" placeholder="请输入"#}{#/slot#}`
// const source = `{{}{#slot id="foo" placeholder="请输入"#}{#/slot#}`
const source = `{{in}}`
// const source = `{%in%}`

// const source = `{{a + 1 ??? aaa {#comment#}aaa{#hello#}`
// const source = `{{hello|default('hello')}}`
// const source = `foo{#hello {# slot #}`
// const source = `foo{#hell{o#}`

// const source = `{% set designer_type ="`

console.log(
  'tree',
  printTree(parser.parse(source), source)
)