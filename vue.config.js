const path = require('path')

const resolve = dir => {
  return path.join(__dirname, dir)
}

// 项目部署基础
// 默认情况下，我们假设你的应用将被部署在域的根目录下,
// 例如：https://www.my-app.com/
// 默认：'/'
// 如果您的应用程序部署在子路径中，则需要在这指定子路径
// 例如：https://www.foobar.com/my-app/
// 需要将它改为'/my-app/'
 const BASE_URL = process.env.NODE_ENV === 'production'  ? '/iview-admin/'   : '/'


module.exports = {
  // Project deployment base
  // By default we assume your app will be deployed at the root of a domain,
  // e.g. https://www.my-app.com/
  // If your app is deployed at a sub-path, you will need to specify that
  // sub-path here. For example, if your app is deployed at
  // https://www.foobar.com/my-app/
  // then change this to '/my-app/'
  baseUrl: BASE_URL,
  lintOnSave:true,
  // tweak internal webpack configuration.
  // see https://github.com/vuejs/vue-cli/blob/dev/docs/webpack.md
  chainWebpack: config => {
    config.resolve.alias
      .set('@', resolve('src')) // key,value自行定义，比如.set('@@', resolve('src/components'))
      .set('_c', resolve('src/components'))
      .set('_conf', resolve('config'))
  },
  // 打包时不生成.map文件
  productionSourceMap: false,
  // 这里写你调用接口的基础路径，来解决跨域，如果设置了代理，那你本地开发环境的axios的baseUrl要写为 '' ，即空字符串
   devServer: {
    //  proxy: 'http://localhost:8800/uuap/'
    proxy: {
      '/uuap': {// '/uuap':匹配项
        target: 'http://localhost:8800/',// 接口的域名
　　　　 secure: false,// 如果是https接口，需要配置这个参数
        changeOrigin: true,// 如果接口跨域，需要进行这个参数配置
　　　　 // pathRewrite: {// 如果接口本身没有/api需要通过pathRewrite来重写了地址
　　　　//　   '^/uuap': '/uuap'
        // }

      }
    }
  }
}
