import React, { useEffect } from 'react';

import Theme from 'rspress/theme';
import { useDark, useLocation } from 'rspress/runtime';
import { Button, LocaleProvider } from '@douyinfe/semi-ui';
import { zh_CN, en_US } from '@coze-arch/coze-design/locales';
import { CDLocaleProvider, zhCN, enUS } from '@coze-arch/coze-design';
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- 保证css样式顺序和bot一致
const a = Button;

// 以下展示所有的 Props
const Layout = () => {
  // for semi dark mode
  const dark = useDark();

  const currentLocale = navigator.language ?? 'en-US';

  useEffect(() => {
    if (dark) {
      document.body.setAttribute('theme-mode', 'dark');
    } else {
      document.body.removeAttribute('theme-mode');
    }
  }, [dark]);

  const { pathname } = useLocation();

  return (
    <CDLocaleProvider locale={currentLocale === 'en-US' ? en_US : zh_CN}>
      <LocaleProvider locale={currentLocale === 'en-US' ? enUS : zhCN}>
        <Theme.Layout
          bottom={
            pathname.startsWith('/resource/') ? (
              <div className="text-xs text-gray-500 text-center p-1">
                部分内容为AI自动生成，注意甄别，如有错误请及时反馈
              </div>
            ) : null
          }
        />
      </LocaleProvider>
    </CDLocaleProvider>
  );
};

export default {
  ...Theme,
  Layout,
};

export * from 'rspress/theme';
