const path = require('path');

module.exports = {
  stories: ['../**/*.stories.mdx', '../stories/**/*.story.@(js|jsx|ts|tsx)'],
  addons: ['@storybook/addon-links', '@storybook/addon-essentials'],
  webpackFinal: (config) => {
    config.module.rules = [
      ...config.module.rules,
      {
        test: /\.module\.less$/,
        use: [
          {
            loader: 'style-loader',
            options: {},
          },
          {
            loader: 'css-loader',
            options: {
              modules: true,
            },
          },
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                plugins: ['postcss-nested'],
              },
            },
          },
          {
            loader: 'less-loader',
            options: {
              lessOptions: {
                sourceMap: true,
              },
            },
          },
        ],
        include: path.resolve(__dirname, '../stories'),
      },
    ];
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, '../src'),
    };
    config.resolve.extensions.push('.ts', '.tsx');
    return config;
  },
};
