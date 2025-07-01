import React, { ForwardedRef, useContext } from 'react';

import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozWechatFillComponent(
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
      className={`${prefix}-icon ${prefix}-icon-coz_wechat_fill${loadingKls} ${className}`}
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill={useCurrentColor ? 'currentColor' : '#000'}
      xmlns="http://www.w3.org/2000/svg"
      {...rest}
      ref={ref}
    >
      <path d="M16.05 7.98334C16.3166 7.98334 16.575 7.99584 16.8333 8.02918C16.1416 4.76251 12.6375 2.33334 8.65413 2.33334C4.18746 2.33334 0.541626 5.36668 0.541626 9.22501C0.541626 11.45 1.76246 13.2875 3.78746 14.7083L2.98329 17.15L5.81663 15.7292C6.83329 15.9292 7.64163 16.1333 8.65829 16.1333C8.91663 16.1333 9.16246 16.1208 9.42079 16.1C9.25413 15.5625 9.16246 14.9917 9.16246 14.4C9.15829 10.8625 12.2 7.98334 16.05 7.98334ZM11.6958 5.77918C12.3 5.77918 12.7041 6.18334 12.7041 6.79584C12.7041 7.40001 12.3 7.80418 11.6958 7.80418C11.0791 7.80418 10.475 7.40001 10.475 6.79584C10.4791 6.18334 11.0833 5.77918 11.6958 5.77918ZM6.01246 7.80418C5.40829 7.80418 4.79163 7.40001 4.79163 6.79584C4.79163 6.17918 5.40829 5.77918 6.01246 5.77918C6.62913 5.77918 7.02913 6.18334 7.02913 6.79584C7.02913 7.40418 6.62913 7.80418 6.01246 7.80418ZM23.4583 14.3083C23.4583 11.0625 20.2125 8.42084 16.5666 8.42084C12.7041 8.42084 9.67496 11.0625 9.67496 14.3083C9.67496 17.5542 12.7083 20.1958 16.5666 20.1958C17.3708 20.1958 18.1875 19.9833 19.0083 19.7833L21.2333 21.0042L20.6166 18.9792C22.25 17.7542 23.4583 16.1333 23.4583 14.3083ZM14.3291 13.2875C13.925 13.2875 13.525 12.8833 13.525 12.4708C13.525 12.0667 13.9291 11.6667 14.3291 11.6667C14.9458 11.6667 15.3458 12.0708 15.3458 12.4708C15.3458 12.8875 14.9416 13.2875 14.3291 13.2875ZM18.7916 13.2875C18.3875 13.2875 17.9875 12.8833 17.9875 12.4708C17.9875 12.0667 18.3916 11.6667 18.7916 11.6667C19.3958 11.6667 19.8083 12.0708 19.8083 12.4708C19.8125 12.8875 19.3958 13.2875 18.7916 13.2875Z" />
    </svg>
  );
}

const IconCozWechatFill = React.forwardRef(IconCozWechatFillComponent);
export default IconCozWechatFill;
