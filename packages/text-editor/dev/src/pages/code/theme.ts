import { createTheme } from '@coze-editor/editor/preset-code'

const colors = {
  background: '#151B27',
}
const darkTheme = createTheme({
  variant: 'dark',
  settings: {
    background: colors.background,
    foreground: '#fff',
    caret: '#AEAFAD',
    selection: '#d9d9d942',
    gutterBackground: colors.background,
    gutterForeground: '#FFFFFF63',
    gutterBorderColor: 'transparent',
    gutterBorderWidth: 0,
    lineHighlight: '#272e3d36',
    bracketColors: ['#FFEF61', '#DD99FF', '#78B0FF'],
    tooltip: {
      backgroundColor: '#363D4D',
      color: '#fff',
      border: 'none',
    },
    link: {
      color: '#4daafc',
    },
    completionItemHover: {
      backgroundColor: '#FFFFFF0F',
    },
    completionItemSelected: {
      backgroundColor: '#FFFFFF17',
    },
    completionItemIcon: {
      color: '#FFFFFFC9',
    },
    completionItemLabel: {
      color: '#FFFFFFC9',
    },
    completionItemInfo: {
      color: '#FFFFFFC9',
    },
    completionItemDetail: {
      color: '#FFFFFF63',
    },
  },
  styles: []
})

export {
  darkTheme,
}
