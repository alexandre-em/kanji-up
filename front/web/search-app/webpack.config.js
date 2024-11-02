const path = require('path');

const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const WorkboxPlugin = require('workbox-webpack-plugin');
const { ModuleFederationPlugin } = require('webpack').container;
const dotenv = require('dotenv');
const Dotenv = require('dotenv-webpack');

dotenv.config();

const env = process.env.NODE_ENV; // Check if watch mode is enabled

module.exports = {
  mode: env, // Change to 'production' for production builds
  entry: './src/index.ts',
  devtool: 'source-map',
  output: {
    filename: '[name].[contenthash].js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: process.env.SEARCH_APP_WEB, // or '/' based on your server setup
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
        test: /\.(png|jpe?g|gif|svg)$/i,
        type: 'asset/resource',
      },
    ],
  },
  plugins: [
    new Dotenv({ path: `./.env${process.env.NODE_ENV ? '.' + process.env.NODE_ENV : ''}`, safe: true }),
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: './public/index.html',
      filename: 'index.html',
      inject: true,
    }),
    new MiniCssExtractPlugin({
      filename: 'generatedStyle.css',
    }),
    env === 'production' &&
      new WorkboxPlugin.GenerateSW({
        clientsClaim: true,
        skipWaiting: true,
      }),
    new ModuleFederationPlugin({
      name: 'searchApp',
      filename: 'remoteEntry.js',
      exposes: {
        './SearchAppPage': './src/pages/SearchAppPage',
        './SearchBar': './src/components/SearchBar',
      },
      remotes: {
        gatewayApp: `gatewayApp@${process.env.KANJI_UP_WEB}/remoteEntry.js`,
      },
      shared: {
        react: { singleton: true, eager: true, requiredVersion: require('./package.json').dependencies.react },
        'react-dom': { singleton: true, eager: true, requiredVersion: require('./package.json').dependencies['react-dom'] },
      },
    }),
  ].filter(Boolean),
  devServer: {
    hot: true,
    static: {
      directory: path.join(__dirname, 'dist'), // Use 'static' instead of 'contentBase'
    },
    // compress: true,
    port: 3005,
    open: true,
    historyApiFallback: true, // To manage clients routes
  },
  optimization: {
    runtimeChunk: false,
  },
};
