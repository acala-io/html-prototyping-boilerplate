import autoprefixer from 'autoprefixer';
import BrotliPlugin from 'brotli-webpack-plugin';
import browserslist from 'browserslist';
import cssnano from 'cssnano';
import CompressionPlugin from 'compression-webpack-plugin';
import ExtractTextPlugin from 'extract-text-webpack-plugin';
import glob from 'glob';
import merge from 'webpack-merge';
import PurifyCSSPlugin from 'purifycss-webpack';

import {paths} from './webpack.constants';

const loadAndExtractCSS = () => {
  return {
    module: {
      rules: [
        {
          test: /\.scss$/,
          use: ExtractTextPlugin.extract({
            fallback: 'style-loader',
            use: [
              {
                loader: 'css-loader',
                options: {
                  importLoaders: 1,
                },
              },
              {
                loader: 'postcss-loader',
                options: {
                  plugins: [
                    autoprefixer({
                      browsers: browserslist(),
                    }),
                    cssnano({
                      discardComments: {
                        removeAll: true,
                      },
                      options: {
                        safe: true,
                        sourcemap: false,
                      },
                      svgo: false, // trying to run svgo breaks for unknown reasons and we don't need it anyway, so just switch it off
                    }),
                  ],
                },
              },
              {
                loader: 'fast-sass-loader',
                options: {
                  errLogToConsole: true,
                  includePaths: [
                    paths.scss,
                    paths.node_modules,
                  ],
                },
              },
            ],
          }),
        },
      ],
    },
    plugins: [
      // output extracted CSS to a file
      new ExtractTextPlugin('[name].css'),
    ],
  };
};

export default merge(
  {
    entry: {
      'main': paths.mainCSS,
    },
    output: {
      // chunkFilename: 'chunk_[name].[chunkhash].js',
      filename: '[name].css',
      path: paths.build,
      publicPath: '/assets/',
    },
    devtool: 'source-map',
    target: 'web',
    plugins: [
    //   // output extracted CSS to a file
    //   new ExtractTextPlugin('[name].css'),
    //   // remove CSS from output that is not used by the files in the given path
    //   // n.b. ExtractTextPlugin has to be run before PurifyCSSPlugin!
    //   new PurifyCSSPlugin({
    //     paths: glob.sync(`${paths.html}/index.html`, {nodir: true}),
    //   }),
      new BrotliPlugin({
        asset: '[path].br',
        test: /\.(js|css|html|svg)$/,
        minRatio: 0.8,
      }),
      new CompressionPlugin({
        asset: '[path].gz[query]',
        algorithm: 'zopfli',
        test: /\.(js|css|html|svg)$/,
        minRatio: 0.8,
      }),
    ],
    node: {
      child_process: 'empty',
    },
    resolve: {
      modules: [
        'node_modules',
        'src',
      ],
    },
    devServer: {
      // contentBase: paths.indexHTML,
      historyApiFallback: true,
      stats: 'errors-only',
      host: 'localhost',
      https: false,
      port: 8080,
    },
  },
  loadAndExtractCSS()
);
