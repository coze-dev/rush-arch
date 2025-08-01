import React, { ForwardedRef, useContext } from 'react';

import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozBattleFillComponent(
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
      className={`${prefix}-icon ${prefix}-icon-coz_battle_fill${loadingKls} ${className}`}
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill={useCurrentColor ? 'currentColor' : '#000'}
      xmlns="http://www.w3.org/2000/svg"
      {...rest}
      ref={ref}
    >
      <path d="M2.44869 2.19388C2.30734 2.19151 2.19215 2.30671 2.19452 2.44805L2.26816 6.82842C2.27033 6.95811 2.32282 7.08186 2.41453 7.17357L14.7089 19.468 14.4733 19.7036C14.2781 19.8988 14.2781 20.2154 14.4733 20.4107L15.1804 21.1178C15.3757 21.313 15.6923 21.313 15.8875 21.1178L17.7956 19.2097 18.7258 20.1399C18.6194 20.6993 18.7827 21.2998 19.2156 21.7327 19.9107 22.4278 21.0376 22.4278 21.7327 21.7327 22.4277 21.0377 22.4277 19.9107 21.7327 19.2157 21.2998 18.7828 20.6994 18.6195 20.1401 18.7258L19.2098 17.7955 21.1178 15.8875C21.3131 15.6923 21.3131 15.3757 21.1178 15.1804L20.4107 14.4733C20.2154 14.278 19.8988 14.278 19.7036 14.4733L19.4686 14.7083 7.17421 2.41389C7.0825 2.32218 6.95874 2.2697 6.82906 2.26752L2.44869 2.19388zM22.212 2.48698C22.2144 2.34564 22.0992 2.23044 21.9578 2.23282L17.5775 2.30645C17.4478 2.30863 17.324 2.36111 17.2323 2.45283L13.6418 6.04335 18.4015 10.803 21.992 7.21251C22.0837 7.1208 22.1362 6.99704 22.1384 6.86736L22.212 2.48698zM4.93793 14.7472L6.0337 13.6514 10.7934 18.4111 9.69761 19.5069 9.9332 19.7425C10.1285 19.9378 10.1285 20.2543 9.9332 20.4496L9.2261 21.1567C9.03083 21.352 8.71425 21.352 8.51899 21.1567L6.61093 19.2487 5.68073 20.1789C5.78714 20.7382 5.62388 21.3387 5.19092 21.7717 4.49586 22.4667 3.36894 22.4667 2.67388 21.7717 1.97882 21.0766 1.97882 19.9497 2.67388 19.2546 3.10677 18.8217 3.70715 18.6584 4.2664 18.7648L5.19672 17.8344 3.28874 15.9265C3.09347 15.7312 3.09347 15.4146 3.28874 15.2193L3.99584 14.5122C4.1911 14.317 4.50769 14.317 4.70295 14.5122L4.93793 14.7472z" />
    </svg>
  );
}

const IconCozBattleFill = React.forwardRef(IconCozBattleFillComponent);
export default IconCozBattleFill;
