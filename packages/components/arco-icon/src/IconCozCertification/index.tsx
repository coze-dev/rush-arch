import React, { ForwardedRef, useContext } from 'react';

import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozCertificationComponent(
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
      className={`${prefix}-icon ${prefix}-icon-coz_certification${loadingKls} ${className}`}
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill={useCurrentColor ? 'currentColor' : '#000'}
      xmlns="http://www.w3.org/2000/svg"
      {...rest}
      ref={ref}
    >
      <path d="M7.83727 14.9609V4.2C7.83727 3.53726 7.30001 3 6.63727 3H3.28305C2.83916 3 2.63311 3.55079 2.968 3.84214L3.14946 4V19.8C3.14946 20.4627 3.68672 21 4.34946 21H8.55788C8.94254 21 9.30389 20.8156 9.5296 20.5041L21 4.6739L21.4883 4L21.6697 3.90982C22.1238 3.68409 21.9632 3 21.456 3H17.119C16.7344 3 16.3731 3.18435 16.1474 3.49576L7.83727 14.9609Z" />
    </svg>
  );
}

const IconCozCertification = React.forwardRef(IconCozCertificationComponent);
export default IconCozCertification;
