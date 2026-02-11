//  Copyright (c) 2025 coze-dev
//  SPDX-License-Identifier: MIT

import fse from 'fs-extra'
import path from 'node:path'
import { reorient } from 'svg-reorient'
import { generateFonts, FontAssetType, OtherAssetType } from 'fantasticon'
import icons from './icons.mjs'

const cwd = process.cwd()
const iconsDir = path.join(cwd, `icons`)

await fse.ensureDir(iconsDir)

for (const icon of icons) {
  await fse.writeFile(
    path.join(iconsDir, `${icon.name}.svg`),
    reorient(icon.svg)
  )
}

const codepoint = 57345
const codepoints = icons.reduce((memo, icon, i) => {
  return {
    ...memo,
    [icon.name]: codepoint + i,
  }
}, {})

const result = await generateFonts({
  name: 'iconfont',
  fontTypes: [FontAssetType.WOFF],
  inputDir: iconsDir,
  assetTypes: [],
  codepoints,
})

const woff = `data:application/font-woff;base64,${result.assetsOut.woff.toString('base64') }`

const template = await fse.readFile(path.join(cwd, 'scripts/index.template.css'), 'utf-8')

await fse.writeFile(
  path.join(cwd, 'src/index.css'),
  template.replace(/{{WOFF}}/g, woff),
  'utf8',
)
