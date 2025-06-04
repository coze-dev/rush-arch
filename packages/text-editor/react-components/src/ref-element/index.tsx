import { forwardRef, useImperativeHandle } from 'react';

import { useLatest } from '@text-editor/react-hooks';

interface Props {
  element: HTMLElement;
}

const RefElement = forwardRef<HTMLElement, Props>(({ element }, ref) => {
  const domRef = useLatest(element);
  useImperativeHandle(ref, () => domRef.current);
  return null;
});

RefElement.displayName = 'RefElement';

export { RefElement };
