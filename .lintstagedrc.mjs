export default {
  '*.{js,ts,vue}': [
    'eslint --fix',
  ],
  '*.{js,ts,vue,scss,css,html}': [
    'prettier --ignore-unknown --stdin --stdin-filepath "{}"',
  ],
};
