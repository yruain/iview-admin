import axios from 'axios'
import {Spin, Modal, Message} from 'iview'
class HttpRequest {
  constructor (baseUrl = baseURL) {
    this.baseUrl = baseUrl
    this.queue = {}
  }
  getInsideConfig () {
    const config = {
      baseURL: this.baseUrl,
      headers: {
        //
      }
    }
    return config
  }
  distroy (url) {
    delete this.queue[url]
    if (!Object.keys(this.queue).length) {
      // Spin.hide()
    }
  }
  interceptors (instance, url) {
    // 请求拦截
    instance.interceptors.request.use(config => {
      // 添加全局的loading...
      if (!Object.keys(this.queue).length) {
        // Spin.show() // 不建议开启，因为界面不友好
      }
      this.queue[url] = true
      return config
    }, error => {
      return Promise.reject(error)
    })
    // 响应拦截
    instance.interceptors.response.use(response => {
      this.distroy(url)
      
      /**
      * code为非20000是抛错 可结合自己业务进行修改
      */
     const res = response.data
     if (res.code != 0) {
      if (res.code === -1) {
        Message.error({
           content: res.msg,
           type: 'error',
           duration: 5
         })
      }
       // 50008:非法的token; 50012:其他客户端登录了;  50014:Token 过期了;
       if (res.code === 50008 || res.code === 50012 || res.code === 50014) {
        Modal.confirm({
            title: '确定登出',
            content:'你已被登出，可以取消继续留在该页面，或者重新登录',
            okText: '重新登录',
            cancelText:  '取消',
            onOk:function(){
              store.dispatch('handleLogOut').then(() => {
                location.reload()// 为了重新实例化vue-router对象 避免bug
              })
            }
          })
       }
       return Promise.reject(new Error('错误的code ' + code));
     } else {
       return response.data
     }

  }, error => {
    this.distroy(url)
    Message.error({
      content: error.message,
      type: 'error',
      duration: 5
    })
    return Promise.reject(error);
  })
    
  }


  request (options) {
    const instance = axios.create()
    options = Object.assign(this.getInsideConfig(), options)
    this.interceptors(instance, options.url)
    return instance(options)
  }
}
export default HttpRequest
