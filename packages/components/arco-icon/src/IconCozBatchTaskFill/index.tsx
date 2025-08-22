import React, { ForwardedRef, useContext } from 'react';

import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozBatchTaskFillComponent(
  props: OriginIconProps,
  ref: ForwardedRef<SVGSVGElement>,
) {
  const { prefix: prefixFromContext } = useContext(Context);
  const {
    className = '',
    prefix: prefixFromProps,
    width = '1em',
    height = '1em',
    useCurrentColor = true,
    spin,
    ...rest
  } = props;

  const prefix = prefixFromProps || prefixFromContext || 'icon';
  const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
  return (
    <svg
      className={`${prefix}-icon ${prefix}-icon-coz_batch_task_fill${loadingKls} ${className}`}
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill={useCurrentColor ? 'currentColor' : '#000'}
      xmlns="http://www.w3.org/2000/svg"
      {...rest}
      ref={ref}
    >
      <path d="M20 7C21.1046 7 22 7.89543 22 9V20C22 21.1046 21.1046 22 20 22H4C2.89543 22 2 21.1046 2 20V9C2 7.89543 2.89543 7 4 7H20ZM16.0479 10.7803C15.605 10.4504 14.9784 10.5416 14.6484 10.9844L10.9922 15.8936L9.25684 14.1582C8.86632 13.7677 8.2333 13.7677 7.84277 14.1582C7.45235 14.5487 7.4523 15.1818 7.84277 15.5723L10.3965 18.126C10.6018 18.3311 10.8863 18.437 11.1758 18.416C11.4652 18.3949 11.7318 18.2493 11.9053 18.0166L16.2529 12.1797C16.5827 11.7369 16.4904 11.1102 16.0479 10.7803ZM18.5 4.5C19.3284 4.5 20 5.17157 20 6H4C4 5.17157 4.67157 4.5 5.5 4.5H18.5ZM15.5 2C16.3284 2 17 2.67157 17 3.5H7C7 2.67157 7.67157 2 8.5 2H15.5Z" />
    </svg>
  );
}

const IconCozBatchTaskFill = React.forwardRef(IconCozBatchTaskFillComponent);
export default IconCozBatchTaskFill;
