//  Copyright (c) 2025 coze-dev
//  SPDX-License-Identifier: MIT

import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozFileVideoComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = false, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'illustration';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_file_video${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M3 4.8C3 3.11984 3 2.27976 3.32698 1.63803C3.6146 1.07354 4.07354 0.614601 4.63803 0.32698C5.27976 0 6.11984 0 7.8 0H21.0118C21.7455 0 22.1124 0 22.4577 0.0828902C22.7638 0.15638 23.0564 0.277593 23.3249 0.442079C23.6276 0.627605 23.887 0.887032 24.4059 1.40589L31.5941 8.59411C32.113 9.11297 32.3724 9.3724 32.5579 9.67515C32.7224 9.94356 32.8436 10.2362 32.9171 10.5423C33 10.8876 33 11.2545 33 11.9882V31.2C33 32.8802 33 33.7202 32.673 34.362C32.3854 34.9265 31.9265 35.3854 31.362 35.673C30.7202 36 29.8802 36 28.2 36H7.8C6.11984 36 5.27976 36 4.63803 35.673C4.07354 35.3854 3.6146 34.9265 3.32698 34.362C3 33.7202 3 32.8802 3 31.2V4.8Z" fill={useCurrentColor ? 'currentColor' : '#4080FF'}/><path d="M23 1.15882C23 0.795333 23 0.613588 23.0719 0.52943C23.1342 0.456407 23.2278 0.417654 23.3235 0.425189C23.4339 0.433872 23.5624 0.562385 23.8194 0.819411L32.1806 9.18059C32.4376 9.43761 32.5661 9.56613 32.5748 9.67646C32.5823 9.7722 32.5436 9.86575 32.4706 9.92812C32.3864 10 32.2047 10 31.8412 10H27.8C26.1198 10 25.2798 10 24.638 9.67302C24.0735 9.3854 23.6146 8.92646 23.327 8.36197C23 7.72024 23 6.88016 23 5.2V1.15882Z" fill={useCurrentColor ? 'currentColor' : '#fff'} fillOpacity=".3"/><path d="M9.66699 15.917C9.66699 15.2266 10.2266 14.667 10.917 14.667H19.667C20.3573 14.667 20.917 15.2266 20.917 15.917V17.4014L22.8042 16.3398C23.6374 15.8711 24.667 16.4733 24.667 17.4293V23.1547C24.667 24.1107 23.6374 24.7129 22.8042 24.2442L20.917 23.1826V24.667C20.917 25.3573 20.3573 25.917 19.667 25.917H10.917C10.2266 25.917 9.66699 25.3573 9.66699 24.667V15.917ZM13.417 19.667C14.1073 19.667 14.667 19.1073 14.667 18.417C14.667 17.7266 14.1073 17.167 13.417 17.167C12.7266 17.167 12.167 17.7266 12.167 18.417C12.167 19.1073 12.7266 19.667 13.417 19.667Z" fill={useCurrentColor ? 'currentColor' : '#fff'}/></svg>;
}

const IconCozFileVideo = React.forwardRef(IconCozFileVideoComponent);
export default IconCozFileVideo;
