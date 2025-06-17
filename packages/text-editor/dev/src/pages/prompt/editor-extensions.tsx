import { ActiveLinePlaceholder, FoldGutter } from '@coze-editor/editor/react';
import Variable from './extensions/variable';
import EditBlock from './extensions/edit-block';
import LanguageSupport from './extensions/language-support'
import JinjaHighlight from './extensions/jinja';
import MarkdownHighlight from './extensions/markdown';
import SelectionPopup from './extensions/selection-popup';
import Tools, { ToolRenderer } from './extensions/tools';
import Validation from './extensions/validation';

function EditorExtensions() {
  return <>
    {/* 输入 @ 唤起工具选择 */}
    <ToolRenderer />
    <Tools />

    {/* 输入 { 唤起变量选择 */}
    <Variable />

    {/* 变量有效性校验，悬浮展示操作 */}
    <Validation />

    {/* 语言特性相关 */}
    <LanguageSupport />

    {/* Jinja 语法高亮 */}
    <JinjaHighlight />

    {/* Markdown 语法高亮 */}
    <MarkdownHighlight />

    {/* 选区浮动工具条 */}
    <SelectionPopup />

    {/* 编辑块 */}
    <EditBlock />

    {/* 激活行为空时的占位提示 */}
    <ActiveLinePlaceholder>
      {`输入 { 插入变量，输入 @ 插入工具`}
    </ActiveLinePlaceholder>

    {/* Heading 折叠 */}
    <FoldGutter />
  </>
}

export default EditorExtensions
