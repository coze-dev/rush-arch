//  Copyright (c) 2025 coze-dev
//  SPDX-License-Identifier: MIT

import React from 'react';

import { cn } from '@/utils';
import { Tooltip } from '@/components/tooltip';

import { ReadColor } from './read-color';

export const mgColumns = [
  {
    title: 'Color',
    dataIndex: 'variable',
    render: (text: string, { useAge, useBorder = false }) => (
      <Tooltip content={useAge}>
        <div
          className={cn(['flex', 'ml-2px', 'h-32px', 'w-32px', 'rounded-xl'])}
          style={{
            background: `var(--${text})`,
            border: useBorder ? '1px solid var(--coz-stroke-primary)' : 'none',
          }}
        ></div>
      </Tooltip>
    ),
  },
  {
    title: 'Value',
    dataIndex: 'variable',
    render: (text: string) => <ReadColor text={text} />,
  },
  {
    title: 'Token',
    dataIndex: 'token',
    render: (text: string) => (
      <div className="font-mono font-medium text-base leading-6 text-sky-500">
        {text}
      </div>
    ),
  },
  {
    title: 'Base Color',
    dataIndex: 'origin',
    render: (text: string) => (
      <div className="font-mono font-medium text-base leading-6 text-indigo-600">
        {text}
      </div>
    ),
  },
  {
    title: 'ClassName',
    dataIndex: 'variable',
    render: (text: string) => (
      <Tooltip content={`className=“${text}”`}>
        <div className="font-mono font-medium text-base leading-6 text-slate-500">
          <span>{text}</span>
        </div>
      </Tooltip>
    ),
  },
  {
    title: 'CSS Variable',
    dataIndex: 'variable',
    render: (text: string) => (
      <Tooltip content={`background-color: var(--${text})`}>
        <div className="font-mono font-medium text-base leading-6 text-slate-500">
          <span>{`var(--${text})`}</span>
        </div>
      </Tooltip>
    ),
  },
  {
    title: 'Tailwind Properties',
    dataIndex: 'variable',
    render: (text: string) => (
      <div className="font-mono font-medium text-base leading-6 text-slate-500">
        <span>{`@apply ${text}`}</span>
      </div>
    ),
  },
  {
    title: 'Preview',
    dataIndex: 'variable',
    render: (text: string) => (
      <div
        className={cn([
          'mx-auto',
          'h-auto',
          'text-2xl',
          'text-center',
          'font-medium',
          'coz-fg-hglt-plus',
          text,
        ])}
      >
        Aa
      </div>
    ),
  },
];
