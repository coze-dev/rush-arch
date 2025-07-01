import React, { ForwardedRef, useContext } from 'react';

import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozRotationFillComponent(
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
      className={`${prefix}-icon ${prefix}-icon-coz_rotation_fill${loadingKls} ${className}`}
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill={useCurrentColor ? 'currentColor' : '#000'}
      xmlns="http://www.w3.org/2000/svg"
      {...rest}
      ref={ref}
    >
      <path d="M13.3624 2.71924H16.8639C20.1774 2.71924 22.8639 5.40574 22.8639 8.71924V9.21924C22.8639 9.2849 22.851 9.34992 22.8259 9.41058 22.8007 9.47124 22.7639 9.52636 22.7175 9.57279 22.671 9.61922 22.6159 9.65605 22.5553 9.68118 22.4946 9.70631 22.4296 9.71924 22.3639 9.71924H21.3639C21.2983 9.71924 21.2332 9.70631 21.1726 9.68118 21.1119 9.65605 21.0568 9.61922 21.0104 9.57279 20.9639 9.52636 20.9271 9.47124 20.902 9.41058 20.8769 9.34992 20.8639 9.2849 20.8639 9.21924V8.71924C20.8639 7.65837 20.4425 6.64096 19.6924 5.89081 18.9422 5.14067 17.9248 4.71924 16.8639 4.71924H13.3624V5.71924C13.3624 5.81209 13.3366 5.90312 13.2877 5.9821 13.2389 6.06109 13.1691 6.12493 13.086 6.16645 13.003 6.20798 12.91 6.22556 12.8175 6.21722 12.725 6.20888 12.6367 6.17495 12.5624 6.11924L9.89592 4.11924C9.83382 4.07266 9.78342 4.01227 9.74871 3.94285 9.714 3.87342 9.69592 3.79686 9.69592 3.71924 9.69592 3.64162 9.714 3.56506 9.74871 3.49563 9.78342 3.4262 9.83382 3.36581 9.89592 3.31924L12.5624 1.31924C12.6367 1.26352 12.725 1.2296 12.8175 1.22126 12.91 1.21292 13.003 1.2305 13.086 1.27202 13.1691 1.31355 13.2389 1.37738 13.2877 1.45637 13.3366 1.53536 13.3624 1.62638 13.3624 1.71924V2.71924zM2.86243 10.2191C2.86243 9.11912 3.76243 8.21912 4.86243 8.21912H15.3624C16.4624 8.21912 17.3624 9.11912 17.3624 10.2191V18.7191C17.3624 19.8191 16.4624 20.7191 15.3624 20.7191H4.86243C3.76243 20.7191 2.86243 19.8191 2.86243 18.7191V10.2191z" />
    </svg>
  );
}

const IconCozRotationFill = React.forwardRef(IconCozRotationFillComponent);
export default IconCozRotationFill;
