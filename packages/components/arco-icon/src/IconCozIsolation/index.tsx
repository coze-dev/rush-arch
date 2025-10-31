import React, { ForwardedRef, useContext } from 'react';

import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozIsolationComponent(
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
      className={`${prefix}-icon ${prefix}-icon-coz_isolation${loadingKls} ${className}`}
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill={useCurrentColor ? 'currentColor' : '#000'}
      xmlns="http://www.w3.org/2000/svg"
      {...rest}
      ref={ref}
    >
      <path d="M12 2C11.4477 2 11 2.44772 11 3V4C11 4.55228 11.4477 5 12 5 12.5523 5 13 4.55228 13 4V3C13 2.44772 12.5523 2 12 2zM1 4C1 3.44772 1.44772 3 2 3H5C6.65685 3 8 4.34315 8 6V18C8 19.6569 6.65685 21 5 21H2C1.44772 21 1 20.5523 1 20 1 19.4477 1.44772 19 2 19H5C5.55228 19 6 18.5523 6 18V6C6 5.44772 5.55228 5 5 5H2C1.44772 5 1 4.55228 1 4zM23 4C23 3.44772 22.5523 3 22 3H19C17.3431 3 16 4.34315 16 6V18C16 19.6569 17.3431 21 19 21H22C22.5523 21 23 20.5523 23 20 23 19.4477 22.5523 19 22 19H19C18.4477 19 18 18.5523 18 18V6C18 5.44772 18.4477 5 19 5H22C22.5523 5 23 4.55228 23 4zM11 7.5C11 6.94772 11.4477 6.5 12 6.5 12.5523 6.5 13 6.94772 13 7.5V8.5C13 9.05229 12.5523 9.5 12 9.5 11.4477 9.5 11 9.05228 11 8.5V7.5zM12 10.5C11.4477 10.5 11 10.9477 11 11.5V12.5C11 13.0523 11.4477 13.5 12 13.5 12.5523 13.5 13 13.0523 13 12.5V11.5C13 10.9477 12.5523 10.5 12 10.5zM11 15.5C11 14.9477 11.4477 14.5 12 14.5 12.5523 14.5 13 14.9477 13 15.5V16.5C13 17.0523 12.5523 17.5 12 17.5 11.4477 17.5 11 17.0523 11 16.5V15.5zM12 19C11.4477 19 11 19.4477 11 20V21C11 21.5523 11.4477 22 12 22 12.5523 22 13 21.5523 13 21V20C13 19.4477 12.5523 19 12 19z" />
    </svg>
  );
}

const IconCozIsolation = React.forwardRef(IconCozIsolationComponent);
export default IconCozIsolation;
