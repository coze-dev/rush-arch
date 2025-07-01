import React, { ForwardedRef, useContext } from 'react';

import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozStoreComponent(
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
      className={`${prefix}-icon ${prefix}-icon-coz_store${loadingKls} ${className}`}
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
        d="M2.19712 4.54361C2.43258 3.06105 3.71097 1.9697 5.2121 1.96973L18.7952 1.96995C20.2977 1.96997 21.5767 3.06329 21.8106 4.54746L22.5112 8.99302C22.5488 9.23134 22.5845 9.5385 22.5549 9.87226C22.3608 12.0617 20.5912 13.8526 18.3467 13.8526C17.0656 13.8526 15.9403 13.2705 15.1736 12.3632C14.4074 13.2704 13.2826 13.8526 12.0013 13.8526C10.7201 13.8526 9.59463 13.2703 8.82796 12.3629C8.06129 13.2703 6.9358 13.8526 5.65457 13.8526C3.41115 13.8526 1.64213 12.0634 1.44667 9.87538C1.41662 9.53906 1.45289 9.22953 1.49102 8.98943L2.19712 4.54361ZM7.77523 9.46632H9.88067C9.88067 10.7755 10.8784 11.7472 12.0013 11.7472C13.1237 11.7472 14.1206 10.7761 14.1206 9.46632H16.226C16.226 10.7755 17.2237 11.7472 18.3467 11.7472C19.4065 11.7472 20.3514 10.8855 20.4577 9.68636C20.4649 9.60472 20.4588 9.49439 20.4314 9.32077L19.7309 4.87521C19.6583 4.41466 19.2614 4.0754 18.7951 4.07539L5.21206 4.07517C4.74625 4.07516 4.34956 4.41381 4.27649 4.87386L3.5704 9.31969C3.54261 9.49462 3.53641 9.6058 3.54375 9.68804C3.65081 10.8864 4.59529 11.7472 5.65457 11.7472C6.77752 11.7472 7.77523 10.7755 7.77523 9.46632Z"
      />
      <path d="M19.0038 15.3124V20.0093H15V18C15 16.8954 14.1046 16 13 16H11C9.89543 16 9 16.8954 9 18V20.0093H5.00385V15.311C4.28801 15.2285 3.61285 15.0059 3.00385 14.67V20.0093C3.00385 21.1139 3.89928 22.0093 5.00385 22.0093H9V22H10C10.5523 22 11 21.5523 11 21V18H13V21C13 21.5523 13.4477 22 14 22H15V22.0093H19.0038C20.1084 22.0093 21.0038 21.1139 21.0038 20.0093V14.6765C20.3946 15.0106 19.7194 15.2314 19.0038 15.3124Z" />
    </svg>
  );
}

const IconCozStore = React.forwardRef(IconCozStoreComponent);
export default IconCozStore;
