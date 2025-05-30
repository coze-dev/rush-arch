//  Copyright (c) 2025 coze-dev
//  SPDX-License-Identifier: MIT

import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozTrayArrowUpComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_tray_arrow_up${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M8 6C7.44772 6 7 6.44772 7 7C7 7.55228 7.44772 8 8 8H16C16.5523 8 17 7.55228 17 7C17 6.44772 16.5523 6 16 6H8Z"/><path fillRule="evenodd" clipRule="evenodd" d="M3 21H16.4999V19.8117C15.5783 20.2308 14.4546 20.0613 13.6966 19.3033C13.6009 19.2076 13.5146 19.1062 13.4377 19H3L3 12H6.84639L7.13685 12.5021C7.67307 13.4291 8.66278 14 9.7337 14H14.2762C14.917 14 15.5286 13.7956 16.0313 13.4331L17.2276 12.2368C17.2419 12.2224 17.2564 12.2082 17.2711 12.1941C17.7201 11.7642 18.3291 11.5 18.9999 11.5C19.3362 11.5 19.6569 11.5664 19.9498 11.6868C20.2473 11.8088 20.5261 11.9906 20.7677 12.2322L23 14.4646V10.5239C23 10.1804 22.9115 9.84274 22.7432 9.54338L19.0735 3.01948C18.7192 2.38972 18.0529 2 17.3303 2H6.66969C5.94715 2 5.28078 2.38972 4.92654 3.01948L1.25685 9.54338C1.08846 9.84274 1 10.1804 1 10.5239V19C1 20.1046 1.89543 21 3 21ZM6.66969 4H17.3303L20.7053 10H16.5801C16.2214 10 15.8901 10.1922 15.712 10.5036L15.1443 11.4964C14.9662 11.8078 14.635 12 14.2762 12H9.7337C9.37672 12 9.04682 11.8097 8.86808 11.5007L8.28881 10.4993C8.11007 10.1903 7.78017 10 7.4232 10H3.29469L6.66969 4Z"/><path d="M18.9999 13C19.1333 13 19.2606 13.0261 19.377 13.0736C19.4971 13.1224 19.6096 13.1955 19.707 13.2929L23.2425 16.8284C23.6331 17.219 23.6331 17.8521 23.2425 18.2426C22.852 18.6332 22.2188 18.6332 21.8283 18.2426L19.9999 16.4142V22C19.9999 22.5523 19.5522 23 18.9999 23C18.4476 23 17.9999 22.5523 17.9999 22V16.4142L16.1715 18.2426C15.7809 18.6332 15.1478 18.6332 14.7572 18.2426C14.3667 17.8521 14.3667 17.219 14.7572 16.8284L18.2899 13.2957C18.2989 13.2867 18.308 13.2779 18.3173 13.2692C18.496 13.1022 18.736 13 18.9999 13Z"/></svg>;
}

const IconCozTrayArrowUp = React.forwardRef(IconCozTrayArrowUpComponent);
export default IconCozTrayArrowUp;
