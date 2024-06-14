const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const Dotenv = require('dotenv-webpack');
const { GenerateSW } = require('workbox-webpack-plugin');
const sharp = require('sharp');
const fs = require('fs');

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
    new CleanWebpackPlugin(),
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
    new Dotenv(),
    new GenerateSW({
      clientsClaim: true,
      skipWaiting: true,
      maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5 MB
      runtimeCaching: [
        {
          urlPattern: ({ request }) => request.destination === 'image',
          handler: 'CacheFirst',
          options: {
            cacheName: 'images-cache',
            expiration: {
              maxEntries: 20,
              maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
            },
          },
        },
        {
          urlPattern: ({ request }) => request.destination === 'script' || request.destination === 'style',
          handler: 'StaleWhileRevalidate',
          options: {
            cacheName: 'static-resources',
          },
        },
      ],
    }),
  ],
};
if (process.env.NODE_ENV === 'production') {
  const { exec } = require('child_process');
  exec('node scripts/resizeImages.js', (err, stdout, stderr) => {
    if (err) {
      // console.error('Error resizing images:', err);
      return;
    }
    // console.log('Resized images:', stdout);
  });
}