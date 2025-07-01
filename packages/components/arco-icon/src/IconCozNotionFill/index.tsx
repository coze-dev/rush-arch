import React, { ForwardedRef, useContext } from 'react';

import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozNotionFillComponent(
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
      className={`${prefix}-icon ${prefix}-icon-coz_notion_fill${loadingKls} ${className}`}
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill={useCurrentColor ? 'currentColor' : '#000'}
      xmlns="http://www.w3.org/2000/svg"
      {...rest}
      ref={ref}
    >
      <path d="M2.4936 1.97416L15.9449 1.06951C16.5294 1.02939 17.1109 1.18244 17.597 1.5044L22.3231 4.64993C22.711 4.90805 22.9438 5.33049 22.9438 5.78199V20.4224C22.9438 21.1511 22.3475 21.7545 21.5826 21.8009L6.65127 22.7056C6.27821 22.7297 5.9047 22.6656 5.56196 22.5186C5.21923 22.3717 4.91723 22.1461 4.68123 21.8607L1.78013 18.3043C1.31736 17.7396 1.06446 17.0363 1.06329 16.3108V3.43405C1.06329 2.66551 1.68737 2.02894 2.4936 1.97416ZM3.2973 3.19834C3.06201 3.21494 2.97346 3.49879 3.16068 3.6349L5.03458 5.00017C5.35927 5.23671 5.76239 5.35539 6.17056 5.33298L19.6606 4.61092C19.7812 4.60511 19.8268 4.45904 19.7298 4.39099L17.1728 2.60907C16.8414 2.37929 16.4394 2.2696 16.0351 2.29867L3.2973 3.19834ZM6.34429 6.7854C5.89142 6.80947 5.53806 7.16552 5.53806 7.5971V20.2207C5.53806 20.6888 5.9513 21.0606 6.44296 21.0332L20.6161 20.239C21.0673 20.2141 21.4207 19.858 21.4207 19.4273V6.75138C21.4207 6.33059 21.0496 5.99695 20.6077 6.02102L6.34429 6.7854ZM7.99555 9.70933V9.87782L9.14418 9.94089V18.2247L8.70312 18.2703C8.26711 18.316 7.9517 18.6869 7.99555 19.1019L11.3512 18.9542C11.7611 18.9368 12.0993 18.6446 12.1583 18.2587L12.1768 18.1359L10.8275 17.8819V11.6689L15.2112 18.1782C15.6396 18.8156 16.4745 19.087 17.2242 18.8339L18.1215 18.5301V9.22962L18.8359 9.11094C18.9336 9.0962 19.0228 9.04783 19.0877 8.97442C19.1525 8.90102 19.1888 8.80734 19.1901 8.71007V8.28928L16.219 8.43867C15.7653 8.46191 15.4094 8.81879 15.4094 9.2512V9.33087L16.5715 9.48359V15.2269L12.0562 8.68351L8.79167 8.89764C8.34385 8.92752 7.99555 9.28191 7.99555 9.70933Z" />
    </svg>
  );
}

const IconCozNotionFill = React.forwardRef(IconCozNotionFillComponent);
export default IconCozNotionFill;
