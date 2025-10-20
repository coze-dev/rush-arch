import React, { ForwardedRef, useContext } from 'react';

import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozOpenComponent(
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
      className={`${prefix}-icon ${prefix}-icon-coz_open${loadingKls} ${className}`}
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill={useCurrentColor ? 'currentColor' : '#000'}
      xmlns="http://www.w3.org/2000/svg"
      {...rest}
      ref={ref}
    >
      <path d="M22 3.00002C22 2.44774 21.5523 2.00003 21 2.00003L14 2C13.4478 2 13 2.44771 13 3C13 3.55228 13.4477 4 14 4L18.5858 4.00002L12.2929 10.2929C11.9024 10.6834 11.9024 11.3166 12.2929 11.7071C12.6834 12.0977 13.3166 12.0977 13.7071 11.7071L20 5.41422L20.0001 10C20.0001 10.5523 20.4478 11 21.0001 11C21.5524 11 22.0001 10.5523 22.0001 10L22 3.00002Z" />
      <path d="M4 5H10V7H4V20H20V14.5H22V20C22 21.1046 21.1046 22 20 22H4C2.89543 22 2 21.1046 2 20V7C2 5.89543 2.89543 5 4 5Z" />
    </svg>
  );
}

const IconCozOpen = React.forwardRef(IconCozOpenComponent);
export default IconCozOpen;
