import React, { ForwardedRef, useContext } from 'react';

import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozCommunityFillComponent(
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
      className={`${prefix}-icon ${prefix}-icon-coz_community_fill${loadingKls} ${className}`}
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill={useCurrentColor ? 'currentColor' : '#000'}
      xmlns="http://www.w3.org/2000/svg"
      {...rest}
      ref={ref}
    >
      <path d="M22.3878 8.65363C22.4707 8.9624 22.1665 9.35672 21.5551 9.79834 20.6511 5.3488 16.7168 2 12.0005 2 6.6157 2 2.25049 6.36521 2.25049 11.75 2.25049 12.8013 2.41689 13.8138 2.72478 14.7624 2.08515 14.6741 1.69378 14.4914 1.61806 14.2093 1.56929 14.0276 1.65455 13.8163 1.85757 13.5831 1.77265 13.1906 1.71013 12.7897 1.67142 12.382.441079 13.379-.176437 14.362.0447808 15.1862.609183 17.2889 6.41946 17.5617 13.0224 15.7955 19.6253 14.0293 24.5205 10.8929 23.9561 8.79016 23.7503 8.0234 22.847 7.49996 21.462 7.22998 21.6051 7.5525 21.732 7.88369 21.8419 8.22255 22.1492 8.32365 22.3377 8.46684 22.3878 8.65363zM13.4816 17.4321C16.9111 16.5749 19.6365 15.0477 21.616 13.6777 20.8748 18.4746 17.1496 21.9998 12.0004 21.9998 9.12896 21.9998 6.54747 20.6163 4.76318 18.5084 7.04453 18.5492 10.0521 18.2893 13.4816 17.4321z" />
    </svg>
  );
}

const IconCozCommunityFill = React.forwardRef(IconCozCommunityFillComponent);
export default IconCozCommunityFill;
