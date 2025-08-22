import React, { ForwardedRef, useContext } from 'react';

import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozVolcengineComponent(
  props: OriginIconProps,
  ref: ForwardedRef<SVGSVGElement>,
) {
  const { prefix: prefixFromContext } = useContext(Context);
  const {
    className = '',
    prefix: prefixFromProps,
    width = '1em',
    height = '1em',
    useCurrentColor = false,
    spin,
    ...rest
  } = props;

  const prefix = prefixFromProps || prefixFromContext || 'icon';
  const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
  return (
    <svg
      className={`${prefix}-icon ${prefix}-icon-coz_volcengine${loadingKls} ${className}`}
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...rest}
      ref={ref}
    >
      <path
        d="M17.5077 11.6819L15.2815 21.3232C15.2352 21.4836 15.3732 21.6216 15.5113 21.6216H19.9638C20.1242 21.6216 20.2391 21.4844 20.1936 21.3232L17.9666 11.6819C17.9211 11.429 17.554 11.429 17.5077 11.6819ZM5.20513 15.3547L3.8055 21.3449C3.75925 21.506 3.89726 21.6433 4.03455 21.6433H6.78902C6.94943 21.6433 7.06432 21.506 7.0188 21.3456L5.64157 15.3547C5.61844 15.1018 5.25137 15.1018 5.20513 15.3547V15.3547Z"
        fill={useCurrentColor ? 'currentColor' : '#37E2E2'}
      />
      <path
        d="M8.2343 8.03245L5.15901 21.3452C5.11277 21.5056 5.25078 21.6429 5.38807 21.6429H11.517C11.6774 21.6429 11.7916 21.5056 11.746 21.3452L8.67074 8.03245C8.64762 7.77955 8.28055 7.77955 8.2343 8.03245V8.03245Z"
        fill={useCurrentColor ? 'currentColor' : '#1664FF'}
      />
      <path
        d="M13.3787 2.54612L9.04036 21.3447C8.99411 21.5051 9.13213 21.6424 9.27014 21.6424H17.923C18.0834 21.6424 18.1983 21.5051 18.1528 21.3447L13.8376 2.54612C13.7913 2.29322 13.4242 2.29322 13.3787 2.54612Z"
        fill={useCurrentColor ? 'currentColor' : '#1664FF'}
      />
      <path
        d="M10.5076 9.84462L7.868 21.3199C7.82175 21.4803 7.95976 21.6183 8.09777 21.6183H13.3769C13.5373 21.6183 13.6515 21.481 13.606 21.3199L10.9664 9.84318C10.9209 9.61412 10.5531 9.61412 10.5076 9.84318V9.84462Z"
        fill={useCurrentColor ? 'currentColor' : '#37E2E2'}
      />
    </svg>
  );
}

const IconCozVolcengine = React.forwardRef(IconCozVolcengineComponent);
export default IconCozVolcengine;
