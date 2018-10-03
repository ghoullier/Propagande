var path = require('path');
var webpack = require('webpack');

module.exports = {
    entry: {
        main: './src/client/propagandeClient.ts',
    },
    resolve: {
        extensions: [".webpack.js", ".web.js", ".js", ".ts"]
    },
    output: {
        publicPath: "/js/",
        path: path.join(__dirname, '/browser/'),
        filename: '[name].build.js',
        library : 'PropagandeClient'
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                loader: 'ts-loader'
            }
        ]
    }
};