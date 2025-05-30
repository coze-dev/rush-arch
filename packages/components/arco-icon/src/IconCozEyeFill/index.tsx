//  Copyright (c) 2025 coze-dev
//  SPDX-License-Identifier: MIT

import React, { ForwardedRef, useContext } from 'react';
import { OriginIconProps } from '../type';
import { Context } from '../context';

function IconCozEyeFillComponent(props: OriginIconProps, ref: ForwardedRef<SVGSVGElement>) {
    const { prefix: prefixFromContext } = useContext(Context);
    const { className = '', prefix: prefixFromProps, width = '1em', height = '1em', useCurrentColor = true, spin, ...rest } = props;

    const prefix = prefixFromProps || prefixFromContext || 'icon';
    const loadingKls = spin ? ` ${prefix}-icon-loading` : '';
    return <svg className={`${prefix}-icon ${prefix}-icon-coz_eye_fill${loadingKls} ${className}`} width={width} height={height} viewBox="0 0 24 24" fill={useCurrentColor ? 'currentColor' : '#000'} xmlns="http://www.w3.org/2000/svg" {...rest} ref={ref}><path d="M11.9822 3.5C16.0687 3.5 19.5762 6.038 22.5057 11.114C22.5652 11.2165 22.6397 11.349 22.7297 11.511C22.8128 11.6609 22.856 11.8296 22.8551 12.0009C22.8542 12.1722 22.8093 12.3405 22.7247 12.4895C22.6447 12.63 22.5777 12.7455 22.5247 12.8365C19.5172 17.9455 16.0037 20.5 11.9817 20.5C7.97474 20.5 4.48124 17.9635 1.50074 12.89C1.441 12.7879 1.382 12.6854 1.32374 12.5825L1.26974 12.4875C1.18595 12.339 1.14151 12.1716 1.14064 12.0012C1.13976 11.8307 1.18248 11.6628 1.26474 11.5135C1.36974 11.3235 1.45574 11.169 1.52324 11.052C4.42674 6.017 7.91324 3.5 11.9822 3.5ZM11.9987 8C10.9379 8 9.92046 8.42143 9.17031 9.17157C8.42017 9.92172 7.99874 10.9391 7.99874 12C7.99874 13.0609 8.42017 14.0783 9.17031 14.8284C9.92046 15.5786 10.9379 16 11.9987 16C13.0596 16 14.077 15.5786 14.8272 14.8284C15.5773 14.0783 15.9987 13.0609 15.9987 12C15.9987 10.9391 15.5773 9.92172 14.8272 9.17157C14.077 8.42143 13.0596 8 11.9987 8ZM11.9987 10C12.2614 10 12.5215 10.0517 12.7641 10.1522C13.0068 10.2528 13.2272 10.4001 13.413 10.5858C13.5987 10.7715 13.746 10.992 13.8465 11.2346C13.947 11.4773 13.9987 11.7374 13.9987 12C13.9987 12.2626 13.947 12.5227 13.8465 12.7654C13.746 13.008 13.5987 13.2285 13.413 13.4142C13.2272 13.5999 13.0068 13.7472 12.7641 13.8478C12.5215 13.9483 12.2614 14 11.9987 14C11.4683 14 10.9596 13.7893 10.5845 13.4142C10.2095 13.0391 9.99874 12.5304 9.99874 12C9.99874 11.4696 10.2095 10.9609 10.5845 10.5858C10.9596 10.2107 11.4683 10 11.9987 10Z"/></svg>;
}

const IconCozEyeFill = React.forwardRef(IconCozEyeFillComponent);
export default IconCozEyeFill;
