//  Copyright (c) 2025 coze-dev
//  SPDX-License-Identifier: MIT

import { CompletionItemKind } from 'vscode-languageserver-types';

/**
 * Copied from TypeScript 5.8.2
 */
enum ScriptElementKind {
  unknown = '',
  warning = 'warning',
  /** predefined type (void) or keyword (class) */
  keyword = 'keyword',
  /** top level script node */
  scriptElement = 'script',
  /** module foo {} */
  moduleElement = 'module',
  /** class X {} */
  classElement = 'class',
  /** var x = class X {} */
  localClassElement = 'local class',
  /** interface Y {} */
  interfaceElement = 'interface',
  /** type T = ... */
  typeElement = 'type',
  /** enum E */
  enumElement = 'enum',
  enumMemberElement = 'enum member',
  /**
   * Inside module and script only
   * const v = ..
   */
  variableElement = 'var',
  /** Inside function */
  localVariableElement = 'local var',
  /** using foo = ... */
  variableUsingElement = 'using',
  /** await using foo = ... */
  variableAwaitUsingElement = 'await using',
  /**
   * Inside module and script only
   * function f() { }
   */
  functionElement = 'function',
  /** Inside function */
  localFunctionElement = 'local function',
  /** class X { [public|private]* foo() {} } */
  memberFunctionElement = 'method',
  /** class X { [public|private]* [get|set] foo:number; } */
  memberGetAccessorElement = 'getter',
  memberSetAccessorElement = 'setter',
  /**
   * class X { [public|private]* foo:number; }
   * interface Y { foo:number; }
   */
  memberVariableElement = 'property',
  /** class X { [public|private]* accessor foo: number; } */
  memberAccessorVariableElement = 'accessor',
  /**
   * class X { constructor() { } }
   * class X { static { } }
   */
  constructorImplementationElement = 'constructor',
  /** interface Y { ():number; } */
  callSignatureElement = 'call',
  /** interface Y { []:number; } */
  indexSignatureElement = 'index',
  /** interface Y { new():Y; } */
  constructSignatureElement = 'construct',
  /** function foo(*Y*: string) */
  parameterElement = 'parameter',
  typeParameterElement = 'type parameter',
  primitiveType = 'primitive type',
  label = 'label',
  alias = 'alias',
  constElement = 'const',
  letElement = 'let',
  directory = 'directory',
  externalModuleName = 'external module name',
  /**
   * <JsxTagName attribute1 attribute2={0} />
   * @deprecated
   */
  jsxAttribute = 'JSX attribute',
  /** String literal */
  string = 'string',
  /** Jsdoc @link: in `{@link C link text}`, the before and after text "{@link " and "}" */
  link = 'link',
  /** Jsdoc @link: in `{@link C link text}`, the entity name "C" */
  linkName = 'link name',
  /** Jsdoc @link: in `{@link C link text}`, the link text "link text" */
  linkText = 'link text',
}

/*
 * Copyright (C) 2018 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */
function asCompletionItemKind(kind: ScriptElementKind): CompletionItemKind {
  switch (kind) {
    case ScriptElementKind.primitiveType:
    case ScriptElementKind.keyword:
      return CompletionItemKind.Keyword;
    case ScriptElementKind.constElement:
    case ScriptElementKind.letElement:
    case ScriptElementKind.variableElement:
    case ScriptElementKind.localVariableElement:
    case ScriptElementKind.alias:
    case ScriptElementKind.parameterElement:
      return CompletionItemKind.Variable;
    case ScriptElementKind.memberVariableElement:
    case ScriptElementKind.memberGetAccessorElement:
    case ScriptElementKind.memberSetAccessorElement:
      return CompletionItemKind.Field;
    case ScriptElementKind.functionElement:
    case ScriptElementKind.localFunctionElement:
      return CompletionItemKind.Function;
    case ScriptElementKind.memberFunctionElement:
    case ScriptElementKind.constructSignatureElement:
    case ScriptElementKind.callSignatureElement:
    case ScriptElementKind.indexSignatureElement:
      return CompletionItemKind.Method;
    case ScriptElementKind.enumElement:
      return CompletionItemKind.Enum;
    case ScriptElementKind.enumMemberElement:
      return CompletionItemKind.EnumMember;
    case ScriptElementKind.moduleElement:
    case ScriptElementKind.externalModuleName:
      return CompletionItemKind.Module;
    case ScriptElementKind.classElement:
    case ScriptElementKind.typeElement:
      return CompletionItemKind.Class;
    case ScriptElementKind.interfaceElement:
      return CompletionItemKind.Interface;
    case ScriptElementKind.warning:
      return CompletionItemKind.Text;
    case ScriptElementKind.scriptElement:
      return CompletionItemKind.File;
    case ScriptElementKind.directory:
      return CompletionItemKind.Folder;
    case ScriptElementKind.string:
      return CompletionItemKind.Constant;
  }
  return CompletionItemKind.Property;
}

export { asCompletionItemKind };
