import {
  IconCozArrowRight,
  IconCozArrowDown,
  IconCozCross,
} from '@/components/icons';

import { Collapse, Typography, IconButton } from '../../../semi';
import { type CozSideNavProps } from './types';
import './style.css';

const { Text } = Typography;

/**
 * 当前元素默认支持嵌套一层，不考虑多层情况
 */
export const CozSideNav = (props: CozSideNavProps) => {
  const {
    width,
    items,
    selectedItems = [],
    itemRender,
    onItemClick,
    onDeleteClick,
  } = props;

  return (
    <div className="coz-side-nav" style={{ width }}>
      <Collapse
        expandIcon={<IconCozArrowRight />}
        collapseIcon={<IconCozArrowDown />}
        expandIconPosition="left"
        collapseIconPosition="left"
      >
        {items.map(item => {
          if (itemRender) {
            return itemRender(item);
          }
          const { key, text, items: childItems } = item;
          return (
            <Collapse.Panel header={text} itemKey={key}>
              <div className="coz-side-nav-list">
                {childItems?.map(i => {
                  const selected = selectedItems.some(
                    selectItem =>
                      selectItem[0] === key && selectItem[1] === i.key,
                  );

                  return (
                    <div
                      className={`coz-side-nav-list-item ${selected ? 'selected' : ''}`}
                      key={i.key}
                      onClick={() => onItemClick(i, [key, i.key])}
                    >
                      <Text
                        ellipsis={{
                          showTooltip: true,
                        }}
                      >
                        {i.text}
                      </Text>
                      {selected ? (
                        <IconButton
                          theme="borderless"
                          className="close-icon"
                          icon={<IconCozCross />}
                          onClick={e => {
                            e.stopPropagation();
                            onDeleteClick(i, [key, i.key]);
                          }}
                        />
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </Collapse.Panel>
          );
        })}
      </Collapse>
    </div>
  );
};
