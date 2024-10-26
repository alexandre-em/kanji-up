const path = require('path');

const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const WorkboxPlugin = require('workbox-webpack-plugin');
const { ModuleFederationPlugin } = require('webpack').container;

module.exports = {
  mode: 'development', // Change to 'production' for production builds
  entry: './src/index.ts',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: 'http://localhost:3000/', // or '/' based on your server setup
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
        test: /\.(png|jpe?g|gif|svg)$/i, // Règles pour les images
        type: 'asset/resource', // Traitement des images comme ressources
      },
    ],
  },
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: './public/index.html',
      filename: 'index.html',
      favicon: './public/favicon.ico',
    }),
    new MiniCssExtractPlugin({
      filename: 'generatedStyle.css',
    }),
    new WorkboxPlugin.GenerateSW({
      clientsClaim: true,
      skipWaiting: true,
      // options supplémentaires pour le service worker
    }),
    new ModuleFederationPlugin({
      name: 'gatewayApp',
      remotes: {
        kanjiApp: 'kanjiApp@http://localhost:3001/remoteEntry.js',
      },
      exposes: {
        './shared': path.resolve(__dirname, 'src/shared'), // Expose tout le dossier shared
      },
      shared: {
        react: { singleton: true, eager: true, requiredVersion: '^17.0.0' },
        'react-dom': { singleton: true, eager: true, requiredVersion: '^17.0.0' },
      },
    }),
  ],
  devtool: 'source-map',
  devServer: {
    static: {
      directory: path.join(__dirname, 'dist'), // Use 'static' instead of 'contentBase'
    },
    compress: true,
    port: 3000,
    historyApiFallback: true, // To manage clients routes
  },
  optimization: {
    runtimeChunk: false,
  },
};
