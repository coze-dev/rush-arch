module.exports = {
  darkMode: 'class',
  presets: [require('@coze-arch/tailwind-config')],
  important: '',
  content: [
    './docs/**/*.{js,ts,jsx,tsx,mdx}',
    '../../components/coze-design/src/**/*.{js,ts,jsx,tsx}',
  ],
  corePlugins: {
    preflight: false, // 关闭@tailwind base默认样式，避免对现有样式影响
  },
  plugins: [
    require('@coze-arch/tailwind-config/coze'),
    require('@tailwindcss/forms'),
  ],
};
