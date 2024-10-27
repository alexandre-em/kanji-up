const path = require('path');

const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const WorkboxPlugin = require('workbox-webpack-plugin');
const { ModuleFederationPlugin } = require('webpack').container;

const isWatchMode = process.env.WEBPACK_WATCH === 'true'; // Check if watch mode is enabled

module.exports = {
  mode: 'development', // Change to 'production' for production builds
  entry: './src/index.ts',
  devtool: 'source-map',
  output: {
    filename: '[name].[contenthash].js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: 'http://localhost:3004/', // or '/' based on your server setup
    clean: true,
  },
  resolve: {
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
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'postcss-loader'],
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
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: './public/index.html',
      filename: 'index.html',
    }),
    new MiniCssExtractPlugin({
      filename: 'generatedStyle.css',
    }),
    !isWatchMode &&
      new WorkboxPlugin.GenerateSW({
        clientsClaim: true,
        skipWaiting: true,
      }),
    new ModuleFederationPlugin({
      name: 'wordDetailApp',
      filename: 'remoteEntry.js',
      exposes: {
        './WordDetailAppPage': './src/pages/WordDetailAppPage',
      },
      remotes: {
        shared: 'gatewayApp@http://localhost:3000/remoteEntry.js',
      },
      shared: {
        react: { singleton: true, eager: true, requiredVersion: require('./package.json').dependencies.react },
        'react-dom': { singleton: true, eager: true, requiredVersion: require('./package.json').dependencies['react-dom'] },
      },
    }),
  ],
  devServer: {
    hot: true,
    static: {
      directory: path.join(__dirname, 'dist'), // Use 'static' instead of 'contentBase'
    },
    // compress: true,
    port: 3004,
    open: true,
    historyApiFallback: true, // To manage clients routes
  },
  optimization: {
    runtimeChunk: false,
  },
};
