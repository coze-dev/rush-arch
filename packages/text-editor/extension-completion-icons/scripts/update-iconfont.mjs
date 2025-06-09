//  Copyright (c) 2025 coze-dev
//  SPDX-License-Identifier: MIT

import fs from 'node:fs/promises'
import path from 'node:path'
import { pack } from '@with/svg-to-fonts'
import icons from '../svg/icons.mjs'

const { files } = await pack(icons)

const cwd = process.cwd()

const woff = `data:application/font-woff;base64,${files.woff.toString('base64') }`

const template = await fs.readFile(path.join(cwd, 'scripts/index.template.css'), 'utf-8')

await fs.writeFile(
  path.join(cwd, 'src/index.css'),
  template.replace(/{{WOFF}}/g, woff),
  'utf8',
)