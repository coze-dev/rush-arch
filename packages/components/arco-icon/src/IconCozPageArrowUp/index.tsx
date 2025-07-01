import React, { ForwardedRef, useContext } from 'react';

import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozPageArrowUpComponent(
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
      className={`${prefix}-icon ${prefix}-icon-coz_page_arrow_up${loadingKls} ${className}`}
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill={useCurrentColor ? 'currentColor' : '#000'}
      xmlns="http://www.w3.org/2000/svg"
      {...rest}
      ref={ref}
    >
      <path d="M6.2 3H13.6745C13.8165 3 13.9199 3.00014 14 3.00096V5.12001C14 6.1281 14 6.63215 14.1962 7.01719C14.3688 7.35588 14.6441 7.63124 14.9828 7.80381C15.3679 8 15.8719 8 16.88 8H18.999C18.9998 8.08008 18.9999 8.18351 18.9999 8.32546V11.5C19.3362 11.5 19.6571 11.5664 19.9499 11.6868C20.2474 11.8088 20.5262 11.9906 20.7678 12.2322L20.9999 12.4644V8.32546C20.9999 7.83628 20.9999 7.59169 20.9447 7.36151C20.8957 7.15744 20.8149 6.96235 20.7052 6.7834C20.5815 6.58157 20.4086 6.40862 20.0627 6.06272L15.9372 1.93726C15.5913 1.59136 15.4184 1.4184 15.2165 1.29472C15.0376 1.18506 14.8425 1.10425 14.6384 1.05526C14.4082 1 14.1636 1 13.6745 1H6.2C5.0799 1 4.51984 1 4.09202 1.21799C3.71569 1.40973 3.40973 1.71569 3.21799 2.09202C3 2.51984 3 3.0799 3 4.2V19.8C3 20.9201 3 21.4802 3.21799 21.908C3.40973 22.2843 3.71569 22.5903 4.09202 22.782C4.51984 23 5.07989 23 6.2 23H16.708C16.5742 22.6938 16.5 22.3556 16.5 22V21H6.2C5.60694 21 5.28244 20.9984 5.04927 20.9794L5.0229 20.9771L5.02061 20.9507C5.00156 20.7176 5 20.3931 5 19.8V4.2C5 3.60695 5.00156 3.28244 5.02061 3.04927L5.0229 3.0229L5.04927 3.02061C5.28244 3.00156 5.60695 3 6.2 3Z" />
      <path d="M19 13C19.1334 13 19.2608 13.0261 19.3772 13.0736C19.4972 13.1224 19.6097 13.1955 19.7071 13.2929L23.2427 16.8284C23.6332 17.219 23.6332 17.8521 23.2427 18.2426C22.8521 18.6332 22.219 18.6332 21.8284 18.2426L20 16.4142V22C20 22.5523 19.5523 23 19 23C18.4477 23 18 22.5523 18 22V16.4142L16.1716 18.2426C15.7811 18.6332 15.1479 18.6332 14.7574 18.2426C14.3668 17.8521 14.3668 17.219 14.7574 16.8284L18.29 13.2957C18.299 13.2867 18.3081 13.2779 18.3174 13.2692C18.4961 13.1022 18.7361 13 19 13Z" />
    </svg>
  );
}

const IconCozPageArrowUp = React.forwardRef(IconCozPageArrowUpComponent);
export default IconCozPageArrowUp;
