import React, { ForwardedRef, useContext } from 'react';

import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozBatchTaskComponent(
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
      className={`${prefix}-icon ${prefix}-icon-coz_batch_task${loadingKls} ${className}`}
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill={useCurrentColor ? 'currentColor' : '#000'}
      xmlns="http://www.w3.org/2000/svg"
      {...rest}
      ref={ref}
    >
      <path d="M20.2041 7.01074C21.2128 7.113 22 7.96435 22 9V20C22 21.0357 21.2128 21.887 20.2041 21.9893L20 22H4C2.96435 22 2.113 21.2128 2.01074 20.2041L2 20V9C2 7.89543 2.89543 7 4 7H20L20.2041 7.01074ZM4 20H20V9H4V20ZM14.6484 10.9844C14.9784 10.5416 15.605 10.4504 16.0479 10.7803C16.4904 11.1102 16.5827 11.7369 16.2529 12.1797L11.9053 18.0166C11.7318 18.2493 11.4652 18.3949 11.1758 18.416C10.8863 18.437 10.6018 18.3311 10.3965 18.126L7.84277 15.5723C7.4523 15.1818 7.45235 14.5487 7.84277 14.1582C8.2333 13.7677 8.86632 13.7677 9.25684 14.1582L10.9922 15.8936L14.6484 10.9844ZM18.5 4.5C19.3284 4.5 20 5.17157 20 6H4C4 5.17157 4.67157 4.5 5.5 4.5H18.5ZM15.5 2C16.3284 2 17 2.67157 17 3.5H7C7 2.67157 7.67157 2 8.5 2H15.5Z" />
    </svg>
  );
}

const IconCozBatchTask = React.forwardRef(IconCozBatchTaskComponent);
export default IconCozBatchTask;
