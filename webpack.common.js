const path = require('path');
const fs = require('fs');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const Dotenv = require('dotenv-webpack');

const dotenvPath = fs.existsSync(path.resolve(__dirname, '.env'))
  ? path.resolve(__dirname, '.env')
  : path.resolve(__dirname, '.env.example');

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
    new Dotenv({
      path: dotenvPath,
      systemvars: true,
      silent: true,
    }),
  ],
};
