import request from '@/libs/api.request'

export function login(data) {
  return request({
    url: 'login',
    method: 'post',
    data
  })
}

export function getUserInfo(token) {
  return request({
    url: 'getUserInfo',
    method: 'get',
    params: {token}
  })
}

export function logout(token) {
  return request({
    url: 'logout',
    method: 'post',
    params: {token}
  })
}
