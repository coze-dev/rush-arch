import { CompletionItemKind } from 'vscode-languageserver-types';
import { ScriptElementKind } from 'typescript';

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
