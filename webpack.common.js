const path = require('path');
const fs = require('fs');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

function parseEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return {};
  }

  return fs
    .readFileSync(filePath, 'utf8')
    .split(/\r?\n/)
    .reduce((accumulator, line) => {
      const trimmedLine = line.trim();

      if (!trimmedLine || trimmedLine.startsWith('#')) {
        return accumulator;
      }

      const separatorIndex = trimmedLine.indexOf('=');
      if (separatorIndex === -1) {
        return accumulator;
      }

      const key = trimmedLine.slice(0, separatorIndex).trim();
      let value = trimmedLine.slice(separatorIndex + 1).trim();

      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      } else {
        value = value.replace(/\s+#.*$/, '').trim();
      }

      value = value.replace(/^"(.*)"$/, '$1').replace(/^'(.*)'$/, '$1');
      accumulator[key] = value;
      return accumulator;
    }, {});
}

const fileEnv = {
  ...parseEnvFile(path.resolve(__dirname, '.env.example')),
  ...parseEnvFile(path.resolve(__dirname, '.env')),
};

const mergedEnv = {
  ...fileEnv,
  ...Object.fromEntries(
    Object.entries(process.env).filter(([, value]) => typeof value === 'string')
  ),
};

const clientEnvKeys = [
  'API_DAILYBMKG',
  'API_DALYBMKG',
  'API_LISTBMKG',
  'API_MFIVEBMKG',
  'API_ALLPARAMSHIBA',
  'API_DAILYSHIBA',
  'API_LISTSHIBA',
  'API_MFIVESHIBA',
  'API_NEWSHIBA',
  'API_NEWS',
  'NEWS_KEY',
];

const defineEnv = clientEnvKeys.reduce((accumulator, key) => {
  accumulator[`process.env.${key}`] = JSON.stringify(mergedEnv[key] || '');
  return accumulator;
}, {});

module.exports = {
  entry: {
    app: path.resolve(__dirname, 'src/scripts/index.js'),
  },
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist'),
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.css$/i,
        include: path.resolve(__dirname, 'src'),
        use: ['style-loader', 'css-loader', 'postcss-loader'],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: path.resolve(__dirname, 'src/dist/index.html'),
    }),
    new HtmlWebpackPlugin({
      filename: 'earthquakeMonthly.html',
      template: path.resolve(__dirname, 'src/dist/earthquakeMonthly.html'),
    }),
    new HtmlWebpackPlugin({
      filename: 'newsList.html',
      template: path.resolve(__dirname, 'src/dist/newsList.html'),
    }),
    new HtmlWebpackPlugin({
      filename: 'listHighm.html',
      template: path.resolve(__dirname, 'src/dist/listHighm.html'),
    }),
    new HtmlWebpackPlugin({
      filename: 'article.html',
      template: path.resolve(__dirname, 'src/dist/article.html'),
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, 'public'),
          to: path.resolve(__dirname, 'dist'),
        },
      ],
    }),
    new webpack.DefinePlugin(defineEnv),
  ],
};
