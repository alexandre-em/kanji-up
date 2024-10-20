const ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin');

module.exports = {
  mode: 'development',
  devServer: {
    port: 3001, // Change port for each micro front-end
  },
  plugins: [
    new ModuleFederationPlugin({
      name: 'kanjiApp',
      filename: 'remoteEntry.js',
      exposes: {
        './KanjiUpAppPage': './src/pages/KanjiUpAppPage',
      },
      shared: { react: { singleton: true }, 'react-dom': { singleton: true } },
    }),
  ],
};
