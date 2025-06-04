//  Copyright (c) 2025 coze-dev
//  SPDX-License-Identifier: MIT

import '@testing-library/jest-dom';

import { describe, it } from 'vitest';
import { render, screen } from '@testing-library/react';

import { Modal } from '..';

describe('Popconfirm', () => {
  it('should render', () => {
    render(<Modal visible>modal</Modal>);

    expect(screen.queryByText('modal')).toHaveClass('coz-common-content');
  });

  it('custom footer', () => {
    render(
      <Modal visible footer={<div>footer</div>}>
        modal
      </Modal>,
    );

    expect(screen.queryAllByText('footer').length).toEqual(1);
  });

  it('custom children', () => {
    render(
      <Modal visible>
        <Modal.SubTitle>subtitle</Modal.SubTitle>
        <Modal.Description>description</Modal.Description>
      </Modal>,
    );

    expect(screen.queryByText('subtitle')).toHaveClass('coz-common-subtitle');
    expect(screen.queryByText('description')).toHaveClass(
      'coz-common-description',
    );
  });

  it('getOrderModal', () => {
    const { destroy, update } = Modal.confirm({});
    expect(destroy).not.toBeUndefined();
    expect(update).not.toBeUndefined();
  });
});
