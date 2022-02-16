//代理路径
const proxy = require('./build/proxy.js').proxyObj;
const TerserPlugin = require('terser-webpack-plugin')
const path = require("path");
//打包分析工具
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
const IS_PROD = process.env.NODE_ENV === 'production'
const resolve = dir => path.join(__dirname, dir)
module.exports = {
    publicPath: './',
    productionSourceMap: false,
    pluginOptions: {
        electronBuilder: {
            builderOptions: {
                extraResources: ['prisma/**/*', 'node_modules/.prisma/**/*', 'node_modules/@prisma/client/**/*'],
                publish: ['github']
            },
            externals: ['@prisma/client'],
            nodeIntegration: true,
            preload: 'src/preload.js',
        },
    },
    chainWebpack: config => {
        config.resolve.alias
            .set('@', resolve('src'))
            .set('@temp', resolve('src/components'))
            .set('@api', resolve('src/api'))
            .set('@charts', resolve('src/plugins/charts'))
    },
    configureWebpack: config => {
        /**
         * element-plus 报错处理
         */
        config.module.rules.push({
            test: /\.mjs$/,
            include: /node_modules/,
            type: "javascript/auto"
        })
        config.module.rules.push( {
            test: /\.sql$/,
            use: [
                'sql-webpack-loader'
            ]
        })
    },
    devServer: {
        host: '0.0.0.0',
        port: 9000, // 端口号
        https: false, // https:{type:Boolean}
        open: true, //配置自动启动浏览器
        hotOnly: true, // 热更新
        overlay: {
            warnings: false,
            errors: false,
        },
        proxy: proxy
    },
}
