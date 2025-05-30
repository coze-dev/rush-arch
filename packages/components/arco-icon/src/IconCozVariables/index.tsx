//  Copyright (c) 2025 coze-dev
//  SPDX-License-Identifier: MIT

import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozVariablesComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_variables${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M21.9353 3.64341C21.7384 3.12744 21.1605 2.86882 20.6445 3.06577 20.1285 3.26273 19.8699 3.84067 20.0668 4.35664 21.0466 6.92349 21.3139 10.1521 20.5985 13.5178 20.1211 15.7638 19.2677 17.7798 18.1732 19.4525 17.8708 19.9146 18.0003 20.5344 18.4625 20.8368 18.9246 21.1392 19.5444 21.0097 19.8468 20.5476 21.0816 18.6605 22.0278 16.4127 22.5548 13.9337 23.3425 10.2278 23.0654 6.60391 21.9353 3.64341zM5.06081 3.13704C5.53742 3.41606 5.6976 4.02863 5.41858 4.50525 4.52125 6.03801 3.82041 7.81986 3.40474 9.77544 2.62659 13.4363 3.01142 16.9312 4.20742 19.5898 4.434 20.0934 4.20938 20.6854 3.70572 20.912 3.20206 21.1386 2.61007 20.914 2.38349 20.4103.993297 17.3201.592544 13.3863 1.44845 9.35961 1.90742 7.20031 2.68437 5.21699 3.6926 3.4948 3.97162 3.01819 4.58419 2.85801 5.06081 3.13704zM16.5 7.50003C17.0523 7.50003 17.5 7.94774 17.5 8.50003 17.5 9.05231 17.0523 9.50003 16.5 9.50003H14.986L12.8775 12.1837 13.7047 14.5H15C15.5523 14.5 16 14.9477 16 15.5 16 16.0523 15.5523 16.5 15 16.5H13.7047C12.8595 16.5 12.1055 15.9687 11.8212 15.1727L11.4174 14.0419 10.0866 15.7357C9.70744 16.2183 9.1277 16.5 8.51398 16.5H7.00001C6.44773 16.5 6.00001 16.0523 6.00001 15.5 6.00001 14.9477 6.44773 14.5 7.00001 14.5H8.51398L10.6226 11.8164 9.79529 9.50003H8.50001C7.94773 9.50003 7.50001 9.05231 7.50001 8.50003 7.50001 7.94774 7.94773 7.50003 8.50001 7.50003H9.79529C10.6405 7.50003 11.3945 8.03137 11.6788 8.82735L12.0826 9.95812 13.4134 8.26438C13.7926 7.7818 14.3723 7.50003 14.986 7.50003H16.5z"/></svg>;
}

const IconCozVariables = React.forwardRef(IconCozVariablesComponent);
export default IconCozVariables;
