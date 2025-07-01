import React, { ForwardedRef, useContext } from 'react';

import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozTagFillComponent(
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
      className={`${prefix}-icon ${prefix}-icon-coz_tag_fill${loadingKls} ${className}`}
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill={useCurrentColor ? 'currentColor' : '#000'}
      xmlns="http://www.w3.org/2000/svg"
      {...rest}
      ref={ref}
    >
      <path d="M20.074 2C21.1785 2.0001 22.074 2.8955 22.074 4V10.8125C22.074 11.6079 21.7584 12.371 21.1961 12.9336L12.3016 21.8281C11.5206 22.6087 10.2544 22.6088 9.47345 21.8281L2.24688 14.6006C1.4659 13.8195 1.46586 12.5535 2.24688 11.7725L11.1404 2.87891C11.703 2.31641 12.466 2.00006 13.2615 2H20.074ZM16.8758 7.19922C16.16 6.4834 14.9989 6.48346 14.283 7.19922C13.5673 7.91502 13.5674 9.07519 14.283 9.79102C14.9989 10.5068 16.16 10.5068 16.8758 9.79102C17.591 9.07527 17.5911 7.91495 16.8758 7.19922Z" />
    </svg>
  );
}

const IconCozTagFill = React.forwardRef(IconCozTagFillComponent);
export default IconCozTagFill;
