import React, { ForwardedRef, useContext } from 'react';

import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozSingleOperateComponent(
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
      className={`${prefix}-icon ${prefix}-icon-coz_single_operate${loadingKls} ${className}`}
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill={useCurrentColor ? 'currentColor' : '#000'}
      xmlns="http://www.w3.org/2000/svg"
      {...rest}
      ref={ref}
    >
      <path d="M22.3828 8.56721C22.9139 8.41603 23.4668 8.72364 23.6182 9.25471C23.867 10.128 24 11.0494 24 11.9998C23.9998 17.5225 19.5227 21.9998 14 21.9998H10C8.93405 21.9998 7.9061 21.832 6.94141 21.5223L6.2334 22.7498C6.04086 23.0826 5.56069 23.0826 5.36816 22.7498L2.76953 18.2498C2.57717 17.9165 2.81826 17.4998 3.20312 17.4998H8.39844C8.78332 17.4998 9.02442 17.9165 8.83203 18.2498L7.97168 19.7381C8.61911 19.9073 9.29836 19.9998 10 19.9998H14C18.4182 19.9998 21.9998 16.4179 22 11.9998C22 11.2366 21.8929 10.4994 21.6943 9.80256C21.5432 9.27152 21.8518 8.71856 22.3828 8.56721ZM12.6943 7.49983C13.2465 7.5 13.6943 7.94765 13.6943 8.49983V15.5994C13.6942 16.1515 13.2464 16.5993 12.6943 16.5994H12.1074C11.5552 16.5994 11.1075 16.1516 11.1074 15.5994V10.0086L10.1904 10.5545C9.77445 10.8021 9.23502 10.6267 9.04492 10.1815L8.93164 9.91487C8.72832 9.43834 8.92219 8.88503 9.37891 8.64045L11.0674 7.73616C11.3578 7.58069 11.6824 7.49983 12.0117 7.49983H12.6943ZM17.7666 1.24983C17.9591 0.916733 18.4394 0.916715 18.6318 1.24983L21.2305 5.74983C21.4226 6.08311 21.1816 6.49983 20.7969 6.49983H15.6016C15.2168 6.49983 14.9759 6.08311 15.168 5.74983L16.0273 4.26057C15.3802 4.09161 14.7012 3.99983 14 3.99983H10C5.58172 3.99983 2 7.58155 2 11.9998C2.00003 12.7631 2.10711 13.5002 2.30566 14.1971C2.45663 14.7281 2.14815 15.2812 1.61719 15.4324C1.08625 15.5835 0.533272 15.2758 0.381836 14.7449C0.133009 13.8716 3.20023e-05 12.9503 0 11.9998C2.57703e-07 6.47698 4.47715 1.99983 10 1.99983H14C15.0656 1.99983 16.0932 2.16689 17.0576 2.47639L17.7666 1.24983Z" />
    </svg>
  );
}

const IconCozSingleOperate = React.forwardRef(IconCozSingleOperateComponent);
export default IconCozSingleOperate;
