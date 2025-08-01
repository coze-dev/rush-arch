import React, { ForwardedRef, useContext } from 'react';

import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozProperSupersetComponent(
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
      className={`${prefix}-icon ${prefix}-icon-coz_proper_superset${loadingKls} ${className}`}
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill={useCurrentColor ? 'currentColor' : '#000'}
      xmlns="http://www.w3.org/2000/svg"
      {...rest}
      ref={ref}
    >
      <path d="M20 12C20 7.85786 16.6421 4.5 12.5 4.5H6C5.44771 4.5 5 4.94772 5 5.5C5 6.05228 5.44771 6.5 6 6.5H12.5C15.5376 6.5 18 8.96243 18 12C18 15.0376 15.5376 17.5 12.5 17.5H6C5.44771 17.5 5 17.9477 5 18.5C5 19.0523 5.44771 19.5 6 19.5H12.5C16.6421 19.5 20 16.1421 20 12Z" />
    </svg>
  );
}

const IconCozProperSuperset = React.forwardRef(IconCozProperSupersetComponent);
export default IconCozProperSuperset;
