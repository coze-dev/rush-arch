import React, { ForwardedRef, useContext } from 'react';

import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozBoxShadowComponent(
  props: OriginIconProps,
  ref: ForwardedRef<SVGSVGElement>,
) {
  const { prefix: prefixFromContext } = useContext(Context);
  const {
    className = '',
    prefix: prefixFromProps,
    width = '1em',
    height = '1em',
    useCurrentColor = false,
    spin,
    ...rest
  } = props;

  const prefix = prefixFromProps || prefixFromContext || 'icon';
  const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
  return (
    <svg
      className={`${prefix}-icon ${prefix}-icon-coz_box_shadow${loadingKls} ${className}`}
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...rest}
      ref={ref}
    >
      <path
        d="M18.7061 19.002C18.9807 18.5641 19.5585 18.4303 19.9971 18.7041C20.4358 18.9784 20.5697 19.5572 20.2959 19.9961L20.2939 19.998L20.293 20.001C20.2919 20.0026 20.2893 20.0049 20.2881 20.0068C20.2854 20.0111 20.2829 20.0169 20.2793 20.0225C20.2718 20.0338 20.2615 20.0486 20.25 20.0654C20.227 20.0989 20.1952 20.1427 20.1553 20.1953C20.0747 20.3014 19.9591 20.4446 19.8037 20.6104C19.4926 20.9422 19.023 21.3681 18.3652 21.7891C17.0408 22.6367 14.9896 23.4375 12 23.4375C9.01061 23.4375 6.96017 22.6367 5.63574 21.7891C4.97805 21.3681 4.50841 20.9422 4.19727 20.6104C4.04192 20.4446 3.92627 20.3014 3.8457 20.1953C3.80564 20.1425 3.77308 20.099 3.75 20.0654C3.73846 20.0486 3.72816 20.0338 3.7207 20.0225C3.71709 20.0169 3.71457 20.011 3.71191 20.0068C3.71073 20.005 3.70911 20.0026 3.70801 20.001L3.70605 19.999L3.70508 19.9961C3.43099 19.5571 3.56497 18.9784 4.00391 18.7041C4.44244 18.4306 5.01935 18.5642 5.29395 19.002C5.30103 19.0123 5.31623 19.033 5.33789 19.0615C5.38181 19.1194 5.45734 19.2118 5.56543 19.3271C5.78165 19.5577 6.13286 19.8812 6.64648 20.21C7.66578 20.8623 9.36483 21.5625 12 21.5625C14.6354 21.5625 16.3352 20.8623 17.3545 20.21C17.8682 19.8812 18.2194 19.5577 18.4355 19.3271C18.5436 19.2119 18.6182 19.1194 18.6621 19.0615L18.7061 19.002ZM12 1.0498C16.9706 1.0498 21 5.07924 21 10.0498C21 15.0204 16.9706 19.0498 12 19.0498C7.02944 19.0498 3 15.0204 3 10.0498C3 5.07924 7.02944 1.04981 12 1.0498ZM12 2.9248C8.06497 2.92481 4.875 6.11478 4.875 10.0498C4.875 13.9848 8.06497 17.1748 12 17.1748C15.935 17.1748 19.125 13.9848 19.125 10.0498C19.125 6.11478 15.935 2.9248 12 2.9248Z"
        fill={useCurrentColor ? 'currentColor' : '#080D1E'}
        fillOpacity=".9"
      />
    </svg>
  );
}

const IconCozBoxShadow = React.forwardRef(IconCozBoxShadowComponent);
export default IconCozBoxShadow;
