# Changelog

> coze-design项目的更改维护都将记录在此文件中。

- 文档格式参考 [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
- 组件依赖版本管理 [Semantic Versioning](https://semver.org/spec/v2.0.0.html).


## [2025-03-03] - 组件样式修复与功能增强 [#13390](https://code.byted.org/obric/bot-studio-monorepo/merge_requests/13390)

### Added
- COZInputNumber 支持鼠标横向滑动调整数值
- DatePicker 支持 CustomRenderDate
- Select 支持 chip 样式
- COZTag 支持右侧配置 info 图标

### Changed
- 调整 switch 尺寸
- 调整 menu dropdown 间距
- 调整 avatar mini 尺寸
- 调整 Avatar group 切边处理
- 调整 COZCheckbox 和 COZRadioButton 边框颜色
- 调整 Dark 模式部分 token

### Fixed
- 修复 date 选择器样式问题
- 修复 forminput 样式问题
- 修复 singleselect size 为 small 的样式问题
- 修复 typography ellipsis 配置可传入 coze tooltip 配置问题
- 修复 文档站样式问题


## [2025-01-27] - 组件样式修复与功能增强 [#13390](https://code.byted.org/obric/bot-studio-monorepo/merge_requests/13390)

### Fixed
- 修复 Cascader 图标间距问题
- 修复 Cascader & InputNumber size 为 small 的颜色问题
- 修复 Cascader size 为 small 的圆角问题

### Added
- 支持 PopConfirm 异步状态关闭 [#13746](https://code.byted.org/obric/bot-studio-monorepo/merge_requests/13746)


## [2025-01-15] - 依赖升级与问题修复

### Changed
- 升级 semi-design 到最新版本 [#13412](https://code.byted.org/obric/bot-studio-monorepo/merge_requests/13412)

### Fixed
- 修复升级后导致的 IconButton 问题 [#13541](https://code.byted.org/obric/bot-studio-monorepo/merge_requests/13541)


## [2025-01-08] - 组件功能增强 [#13269](https://code.byted.org/obric/bot-studio-monorepo/merge_requests/13269)

### Added
- 新增 COZPagination 翻页器
- table 序号与 checkbox 切换的能力


## [2025-01-02] - 组件问题修复与功能增强 [#13269](https://code.byted.org/obric/bot-studio-monorepo/merge_requests/13269)

### Fixed
- 修复 COZSwitch 组件 disable 和 loading token 问题
- 修复 COZInputNumber disabled 状态的底色问题

### Added
- COZSingleSelect 支持 small size


## [2024-12-25] - 组件问题修复 [#12976](https://code.byted.org/obric/bot-studio-monorepo/merge_requests/12976)

### Fixed
- 修复 switch 状态为 loading + disabled 状态下，背景色还原不准确的问题


## [2024-12-16] - 开发任务合入 [#12812](https://code.byted.org/obric/bot-studio-monorepo/merge_requests/12812)

### Changed
- 图标库版本升级至`0.0.66`;
- 增加`mg-plus`色彩token;


## [2024-11-19] - 开发任务合入 [#11610](https://bits.bytedance.net/code/obric/bot-studio-monorepo/merge_requests/11610)

### Changed
- 图标库版本升级至`0.0.62`;

### Fixed
- 修复`Input`中输入小尺寸左边距不生效

## [2024-11-06] - 图标库升级 [#10715](https://code.byted.org/obric/bot-studio-monorepo/merge_requests/11139)

### Changed
- 图标库版本升级至`0.0.59`;
- 插画库版本升级至`0.0.9`;

### Fixed
- 修复`Input`中输入文字不垂直居中显示
- 修复`npm run dev`环境下ts类型检测问题
- `tsconfig.js` 支持 references

## [2024-10-21] - 图标库升级 [#10715](https://code.byted.org/obric/bot-studio-monorepo/merge_requests/10763)

### Changed
- 图标库版本升级至`0.0.56`;

### Fixed
- 修复`Table`组件fixed样式异常

## [2024-10-16] - 图标库升级 [#10715](https://code.byted.org/obric/bot-studio-monorepo/merge_requests/10715)

### Changed
- 图标库版本升级至`0.0.54`;

## [2024-10-08] - 修复select组件兼容inputGroup样式问题 [#10326](https://code.byted.org/obric/bot-studio-monorepo/merge_requests/10326)

### Changed
- `Select`兼容`InputGroup`下使用的样式问题

### Fixed
- 修复`Select`传入filter属性，`Input`暗黑模式存在背景色问题
- 移除`Menu.item`无效样式导致的样式异常问题



## [2024-08-28] - 补充组件文档，完善组件功能 [#9559](https://code.byted.org/obric/bot-studio-monorepo/merge_requests/9559)

### Changed
- 补充`progress`,`color`的使用说明;
- 优化`progress`单测实现；
- 补充`collapse`组件单测；

### Fixed
- 微调`progress`组件的`height`传参。


## [2024-08-20] - 补充组件文档和修复部分组件样式 [#9305](https://code.byted.org/obric/bot-studio-monorepo/merge_requests/9305)

### Changed
- 补充`badge`,`banner`,`avatar`, `icons`, `illustrations` 的使用说明;
- 调整Segment-tab组件说明文档;
- 图标库版本升级至`0.0.43`;

### Fixed
- 微调cascader、toast的样式
- 修复input在group下的组合disabled下的样式;


## [2024-08-15] - 增加文档暗黑模式预览和组件样式微调 [#9128](https://code.byted.org/obric/bot-studio-monorepo/merge_requests/9128)

### Changed
- 重写COZLoading组件;
- 调整Segment-tab组件说明文档;
- 图标库版本升级至`0.0.41`;

### Fixed
- 增加站点MDX DOC 暗黑主题切换；
- 脚手架支持自动生成index.mdx;


## [2024-08-13] - 增加MDX预览和组件样式微调 [#9084](https://code.byted.org/obric/bot-studio-monorepo/merge_requests/9084)

### Changed
- 增加站点MDX预览能力，支持和storybook组件引用；
- 增加站点组件`changlog`记录变更;
- 图标库版本升级至`0.0.40`

### Fixed
- 调整segment-tab的组件样式
- 补充button、segment-tab的组件文档内容。
