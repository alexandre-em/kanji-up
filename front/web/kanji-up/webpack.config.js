const path = require('path');

const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const dotenv = require('dotenv');
const Dotenv = require('dotenv-webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const webpack = require('webpack');
const { ModuleFederationPlugin } = require('webpack').container;
const WorkboxPlugin = require('workbox-webpack-plugin');

dotenv.config();

const env = process.env.NODE_ENV || 'development';

console.log('isProd?', env !== 'development');

module.exports = {
  mode: env, // Change to 'production' for production builds
  entry: './src/index.ts',
  devtool: env === 'development' ? 'source-map' : false,
  output: {
    filename: '[name].[contenthash].js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: `${process.env.KANJI_UP_WEB}/`, // or '/' based on your server setup
    clean: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader', 'postcss-loader'],
      },
      {
        test: /\.html$/,
        use: [
          {
            loader: 'html-loader',
            options: { minimize: true },
          },
        ],
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/i, // Règles pour les images
        type: 'asset/resource', // Traitement des images comme ressources
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf|svg)$/,
        use: {
          loader: 'file-loader',
          options: {
            name: '[name].[hash].[ext]', // Customize the output filename
            outputPath: 'fonts/', // Where to place fonts in the output directory
          },
        },
      },
    ],
  },
  plugins: [
    new Dotenv(),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, 'public'), // Source folder to copy from
          to: path.resolve(__dirname, 'dist'), // Destination build folder
          globOptions: {
            ignore: ['**/index.html'],
          },
        },
      ],
    }),
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: './public/index.html',
      filename: 'index.html',
      favicon: './public/favicon.ico',
      inject: true,
      templateParameters: {
        PUBLIC_URL: process.env.PUBLIC_URL || '',
        manifestUrl: process.env.PUBLIC_URL + '/manifest.json',
      },
    }),
    new MiniCssExtractPlugin({
      filename: 'generatedStyle.css',
    }),
    env !== 'development'
      ? new WorkboxPlugin.GenerateSW({
          clientsClaim: true,
          skipWaiting: true,
          cleanupOutdatedCaches: true,
          runtimeCaching: [
            // KanjipUp API
            {
              urlPattern: ({ url }) => url.origin === 'https://api.kanjiup.alexandre-em.fr',
              handler: 'NetworkFirst',
              options: {
                cacheName: 'api-cache',
                expiration: {
                  maxEntries: 20,
                  maxAgeSeconds: 24 * 60 * 60,
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            {
              urlPattern: ({ url }) => url.origin === 'https://auth.kanjiup.alexandre-em.fr',
              handler: 'NetworkFirst',
              options: {
                cacheName: 'api-cache',
                expiration: {
                  maxEntries: 20,
                  maxAgeSeconds: 24 * 60 * 60,
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            {
              urlPattern: ({ url }) => url.origin === 'https://api.word.kanjiup.alexandre-em.fr',
              handler: 'NetworkFirst',
              options: {
                cacheName: 'api-cache',
                expiration: {
                  maxEntries: 20,
                  maxAgeSeconds: 24 * 60 * 60,
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            {
              urlPattern: ({ url }) => url.origin === 'https://rec.kanjiup.alexandre-em.fr',
              handler: 'NetworkFirst',
              options: {
                cacheName: 'api-cache',
                expiration: {
                  maxEntries: 20,
                  maxAgeSeconds: 24 * 60 * 60,
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            // KanjiUP applications
            {
              urlPattern: ({ url }) => url.origin === process.env.KANJI_UP_WEB,
              handler: 'CacheFirst',
              options: {
                cacheName: 'remote-entries',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 24 * 60 * 60,
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            {
              urlPattern: ({ url }) => url.origin === process.env.KANJI_APP_WEB,
              handler: 'CacheFirst',
              options: {
                cacheName: 'remote-entries',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 24 * 60 * 60,
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            {
              urlPattern: ({ url }) => url.origin === process.env.KANJI_APP_DETAIL_WEB,
              handler: 'CacheFirst',
              options: {
                cacheName: 'remote-entries',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 24 * 60 * 60,
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            {
              urlPattern: ({ url }) => url.origin === process.env.SEARCH_APP_WEB,
              handler: 'CacheFirst',
              options: {
                cacheName: 'remote-entries',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 24 * 60 * 60,
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            {
              urlPattern: ({ url }) => url.origin === process.env.HOME_APP_WEB,
              handler: 'CacheFirst',
              options: {
                cacheName: 'remote-entries',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 24 * 60 * 60,
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
          ],
        })
      : null,
    new ModuleFederationPlugin({
      name: 'gatewayApp',
      filename: 'remoteEntry.js',
      remotes: {
        kanjiApp: `kanjiApp@${process.env.KANJI_APP_WEB}/remoteEntry.js`,
        kanjiDetailApp: `kanjiDetailApp@${process.env.KANJI_DETAIL_APP_WEB}/remoteEntry.js`,
        // wordApp: `wordApp@${process.env.WORD_APP_WEB}/remoteEntry.js`,
        // wordDetailApp: `wordDetailApp@${process.env.WORD_DETAIL_APP_WEB}/remoteEntry.js`,
        searchApp: `searchApp@${process.env.SEARCH_APP_WEB}/remoteEntry.js`,
        // flashcardApp: `flashcardApp@${process.env.FLASHCARD_APP_WEB}/remoteEntry.js`,
        // drawingApp: `drawingApp@${process.env.DRAWING_APP_WEB}/remoteEntry.js`,
        // wordGameApp: `wordGameApp@${process.env.WORD_GAME_APP_WEB}/remoteEntry.js`,
        homeApp: `homeApp@${process.env.HOME_APP_WEB}/remoteEntry.js`,
        // userApp: `userApp@${process.env.USER_APP_WEB}/remoteEntry.js`,
      },
      exposes: {
        './shared': './src/shared',
      },
      shared: {
        react: { singleton: true, eager: true, requiredVersion: require('./package.json').dependencies.react },
        'react-dom': { singleton: true, eager: true, requiredVersion: require('./package.json').dependencies['react-dom'] },
      },
    }),
    new webpack.DefinePlugin({
      'process.env.REACT_APP_AUTH_BASE_URL': JSON.stringify(process.env.REACT_APP_AUTH_BASE_URL),
      'process.env.REACT_APP_KANJI_BASE_URL': JSON.stringify(process.env.REACT_APP_KANJI_BASE_URL),
      'process.env.REACT_APP_RECOGNITION_BASE_URL': JSON.stringify(process.env.REACT_APP_RECOGNITION_BASE_URL),
      'process.env.REACT_APP_WORD_BASE_URL': JSON.stringify(process.env.REACT_APP_WORD_BASE_URL),
      'process.env.REACT_APP_USER_APP_WEB': JSON.stringify(process.env.REACT_APP_USER_APP_WEB),
      'process.env.REACT_APP_AUTH_APP_ID_WEB': JSON.stringify(process.env.REACT_APP_AUTH_APP_ID_WEB),
    }),
  ].filter((res) => res !== null),
  devServer: {
    hot: false,
    static: {
      directory: path.join(__dirname, 'public'),
    },
    compress: true,
    port: 3000,
    open: true,
    historyApiFallback: true, // To manage clients routes
  },
  optimization: {
    runtimeChunk: false,
  },
};
