import React, { ForwardedRef, useContext } from 'react';

import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozArrowEnterComponent(
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
      className={`${prefix}-icon ${prefix}-icon-coz_arrow_enter${loadingKls} ${className}`}
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill={useCurrentColor ? 'currentColor' : '#000'}
      xmlns="http://www.w3.org/2000/svg"
      {...rest}
      ref={ref}
    >
      <path d="M6.99963 20.9495C7.39013 21.3399 8.02317 21.3399 8.4137 20.9495C8.80421 20.5589 8.80421 19.9259 8.4137 19.5354L5.87854 17.0002H15.4996C19.3656 17.0002 22.4996 13.8662 22.4996 10.0002C22.4996 6.13424 19.3656 3.00023 15.4996 3.00023H11.6266C11.0799 3.00039 10.6373 3.44378 10.6373 3.99047C10.6375 4.53703 11.08 4.98055 11.6266 4.9807H15.2653C17.1983 4.98076 20.2653 6.98095 20.2653 10.0002C20.2652 13.0195 17.1982 15.0002 15.2653 15.0002H5.87854L8.41272 12.4534C8.79988 12.0643 8.79987 11.4352 8.41174 11.0471C8.02304 10.6584 7.39235 10.6586 7.00354 11.0471L2.75745 15.2932C2.56222 15.4885 2.46448 15.7443 2.46448 16.0002C2.46451 16.2561 2.56221 16.512 2.75745 16.7073L6.99963 20.9495Z" />
    </svg>
  );
}

const IconCozArrowEnter = React.forwardRef(IconCozArrowEnterComponent);
export default IconCozArrowEnter;
