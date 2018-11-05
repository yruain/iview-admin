import request from '@/libs/api.request'
import qs from 'qs'
class QueryModule {
  constructor(moduleName, id) {
    this.moduleName = moduleName
    this.id = id
  }

  pageData(params) {
    return request({
      url: '/' + this.moduleName + '/page',
      method: 'get',
      params
    })
  }

  listData(params) {
    params = Object.assign({}, params)
    return request({
      url: '/' + this.moduleName + '/list',
      method: 'get',
      params
    })
  }

  insertData(data) {
    return request({
      url: '/' + this.moduleName,
      method: 'put',
      data
    })
  }

  updateData(data, obj) {
    return request({
      url: '/' + this.moduleName,
      method: 'post',
      data
    })
  }

  getOne(params) {
    return request({
      url: '/' + this.moduleName + '/getOne',
      method: 'get',
      params
    })
  }

  getById(data) {
    const path = Array.isArray(data) ? '/ids' : '/'
    data = this.paserToPathVariableSuffix(data, this.id)
    return request({
      url: '/' + this.moduleName + path + data,
      method: 'get'
    })
  }

  deleteById(data) {
    const path = Array.isArray(data) ? '/ids' : '/'
    data = this.paserToPathVariableSuffix(data, this.id)
    return request({
      url: '/' + this.moduleName + path + data,
      method: 'delete',
      data
    })
  }

  // 生成 PathVariable 格式URL后缀 可以是 array 或 object （33） （[33,44]） （{id:33}, 'id'） （[{id:33},{id:33}], 'id'）
  paserToPathVariableSuffix(obj, porp) {
    let temp = []
    const isArray = Array.isArray(obj)
    
    if (isArray) {
      // Array object [{},{}]解析
      temp = (typeof porp === 'string') ? Array.getArrays(obj, porp) : obj
    } else {
      if (typeof obj === 'object' && typeof porp === 'string'){
        temp.push(obj[porp])
      } else {
        temp.push(obj)
      }
    }
    return temp.join(",").toString()
  }
}

export default QueryModule
