export default {
  '*.{js,ts,vue}': [
    'eslint --fix',
    'prettier --ignore-unknown --stdin --stdin-filepath "{}"',
  ],
  '*.{js,ts,vue,scss,html}': [
    'prettier --ignore-unknown --stdin --stdin-filepath "{}"',
  ],
};
