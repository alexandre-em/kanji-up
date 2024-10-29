const path = require('path');

const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const WorkboxPlugin = require('workbox-webpack-plugin');
const { ModuleFederationPlugin } = require('webpack').container;
const webpack = require('webpack');
const dotenv = require('dotenv');
const Dotenv = require('dotenv-webpack');

dotenv.config();

const env = process.env.NODE_ENV || 'development';

module.exports = {
  mode: env, // Change to 'production' for production builds
  entry: './src/index.ts',
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
    new Dotenv({ path: `./.env${process.env.NODE_ENV ? '.' + process.env.NODE_ENV : ''}`, safe: true }),
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: './public/index.html',
      filename: 'index.html',
      favicon: './public/favicon.ico',
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
      name: 'gatewayApp',
      filename: 'remoteEntry.js',
      remotes: {
        homeApp: `homeApp@${process.env.HOME_APP_WEB}/remoteEntry.js`,
        // kanjiApp: 'kanjiApp@http://localhost:3001/remoteEntry.js',
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
      'process.env.PUBLIC_URL': JSON.stringify(process.env.PUBLIC_URL || ''),
    }),
  ].filter(Boolean),
  devtool: 'source-map',
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
