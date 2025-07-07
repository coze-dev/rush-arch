import { type IComponentBaseProps } from '@/typings';

interface Item {
  /**
   * 唯一 key
   */
  key: string;
  /**
   * item text
   */
  text: string;
  /**
   * 内部元素，支持嵌套
   */
  items?: Item[];
}

export interface CozSideNavProps extends IComponentBaseProps {
  /**
   * 组件宽度
   */
  width: number;
  /**
   * value 数据树结构
   */
  items: Item[];
  /**
   * 选中项二维数组
   * [[parent, child]]
   * 为什么是二维数组：可能存在父 key 为 a，子 key 为 bc，和 父 key 为 ab，子 key 为 c 的场景
   * 如果字符串拼接就会判断不了这两项的区别
   */
  selectedItems: string[][];
  /**
   * onItemClick 点击回调
   */
  onItemClick: (value: Item, path: string[]) => void;
  /**
   * onDeleteItem 点击 close 按钮删除
   */
  onDeleteClick: (value: Item, path: string[]) => void;
  /**
   * 单项自定义渲染
   */
  itemRender?: (item: Item) => React.ReactNode;
}
