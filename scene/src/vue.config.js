module.exports = {
  configureWebpack: {
    resolve: {
      alias: {
        "assets": "@/assets",
        "components": "@/components",
        "network": "@/network",
        "views": "@/views",
        "router": "@/router",
        "api": "@/api"
      }
    }
  },
  devServer: {  // webpack devserver的proxy用法解决开发环境的跨域问题(不用在去配置nginx和host)
    // 请求到 /api/xxx 现在会被代理到请求 http://localhost:8090/api/xxx
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:3000',
        ws: true,//是否代理websockets
        changeOrigin: true  // 设置同源 默认false，是否需要改变原始主机头为目标URL
      }
    }
  }
}