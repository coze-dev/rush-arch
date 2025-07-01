import React, { ForwardedRef, useContext } from 'react';

import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozBeautyEnhanceComponent(
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
      className={`${prefix}-icon ${prefix}-icon-coz_beauty_enhance${loadingKls} ${className}`}
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill={useCurrentColor ? 'currentColor' : '#000'}
      xmlns="http://www.w3.org/2000/svg"
      {...rest}
      ref={ref}
    >
      <path d="M4.92298 4.6743C4.46713 4.52235 4.46713 3.87756 4.92298 3.72561L5.73325 3.45552C6.33046 3.25645 6.7991 2.78782 6.99817 2.19061L7.26826 1.38034C7.42021.92449 8.06499.92449 8.21694 1.38034L8.48703 2.19061C8.6861 2.78782 9.15473 3.25645 9.75194 3.45552L10.5622 3.72561C11.0181 3.87756 11.0181 4.52235 10.5622 4.6743L9.75194 4.94439C9.15473 5.14346 8.6861 5.61209 8.48703 6.2093L8.21694 7.01957C8.06499 7.47542 7.42021 7.47542 7.26826 7.01957L6.99817 6.2093C6.7991 5.61209 6.33046 5.14346 5.73325 4.94439L4.92298 4.6743zM2.63838 9.4489C2.2737 9.57046 2.2737 10.0863 2.63838 10.2078L3.14694 10.3774C3.44554 10.4769 3.67986 10.7112 3.77939 11.0098L3.94891 11.5184C4.07047 11.8831 4.5863 11.8831 4.70786 11.5184L4.87738 11.0098C4.97691 10.7112 5.21123 10.4769 5.50983 10.3774L6.01839 10.2078C6.38307 10.0863 6.38307 9.57046 6.01839 9.4489L5.50983 9.27938C5.21123 9.17984 4.97691 8.94553 4.87738 8.64692L4.70786 8.13836C4.5863 7.77369 4.07047 7.77369 3.94891 8.13836L3.77939 8.64692C3.67986 8.94553 3.44554 9.17984 3.14694 9.27938L2.63838 9.4489zM10.9957 9.80244L17.9176 13.7988C18.3873 12.8598 18.0493 11.7056 17.128 11.1737L13.6639 9.17368C12.7426 8.64177 11.574 8.92616 10.9957 9.80244zM16.9208 15.5327L9.99255 11.5327 6.10392 18.268C5.55163 19.2246 5.87938 20.4478 6.83597 21L10.3001 23C11.2567 23.5523 12.4798 23.2246 13.0321 22.268L16.9208 15.5327zM19.541 1.88123C16.3988 2.51757 14.5832 5.58277 13.9488 7.32696L18.3792 9.88485 18.4125 9.90102C19.1212 8.91971 19.5025 8.26877 20.4477 6.3756 20.8541 4.43861 20.0254 2.41975 19.541 1.88123z" />
    </svg>
  );
}

const IconCozBeautyEnhance = React.forwardRef(IconCozBeautyEnhanceComponent);
export default IconCozBeautyEnhance;
