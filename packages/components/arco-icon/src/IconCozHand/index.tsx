import React, { ForwardedRef, useContext } from 'react';

import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozHandComponent(
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
      className={`${prefix}-icon ${prefix}-icon-coz_hand${loadingKls} ${className}`}
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill={useCurrentColor ? 'currentColor' : '#000'}
      xmlns="http://www.w3.org/2000/svg"
      {...rest}
      ref={ref}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12.5849 1.17871C13.6334 1.17871 14.5453 1.7633 15.0126 2.6243C16.335 2.48693 17.6286 3.27525 18.1062 4.52081C19.7916 4.42273 21.2606 5.80239 21.2606 7.4944L21.2609 14.466C21.2609 16.6124 20.4773 18.677 19.0703 20.2783V20.3213C19.0703 21.702 17.951 22.8213 16.5703 22.8213H9.80767C8.42696 22.8213 7.30767 21.702 7.30767 20.3213V20.1416L3.01204 15.6148C1.73518 14.2693 2.09593 12.0765 3.73655 11.211C4.57646 10.7678 5.51373 10.6121 6.44 10.8723V5.80202C6.44 4.03813 7.86991 2.60822 9.63379 2.60822C9.80751 2.60822 9.97799 2.62209 10.1442 2.64877C10.6073 1.77439 11.5266 1.17871 12.5849 1.17871ZM13.842 4.08575V10.6345C13.842 10.937 14.0872 11.1822 14.3896 11.1822C14.6921 11.1822 14.9373 10.937 14.9373 10.6345V4.15929C15.6279 3.97271 16.3823 4.32801 16.6753 4.98572C16.7572 5.1694 16.8026 5.37284 16.8026 5.58691C16.8032 7.4088 16.8039 9.2307 16.8039 11.0526C16.8039 11.3551 17.0491 11.6003 17.3515 11.6003C17.654 11.6003 17.8992 11.3551 17.8992 11.0526V6.06573C18.8073 5.82303 19.7606 6.54228 19.7606 7.4944V14.5269C19.7445 16.4673 18.9569 18.3226 17.5703 19.6824V20.3213C17.5703 20.8736 17.1225 21.3213 16.5703 21.3213H9.80767C9.25539 21.3213 8.80767 20.8736 8.80767 20.3213V19.5431L4.10011 14.5823C3.50728 13.9576 3.67477 12.9395 4.43649 12.5377C5.07135 12.2027 5.78872 12.1298 6.44 12.4802C7.00196 12.7824 7.46432 13.309 7.94 13.7249V5.80202C7.94 4.63425 9.155 3.81207 10.2297 4.216V10.6345C10.2297 10.937 10.4748 11.1822 10.7773 11.1822C11.0798 11.1822 11.325 10.937 11.325 10.6345V4.08575L11.3247 4.06876C11.3247 3.33804 11.7969 2.67871 12.5849 2.67871C13.3854 2.67871 13.842 3.34789 13.842 4.08575Z"
      />
    </svg>
  );
}

const IconCozHand = React.forwardRef(IconCozHandComponent);
export default IconCozHand;
