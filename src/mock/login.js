import { getParams } from '@/libs/util'
const USER_MAP = {
  super_admin: {
    name: 'super_admin',
    userId: '1',
    access: ['super_admin', 'admin'],
    token: 'super_admin',
    avator: 'https://file.iviewui.com/dist/a0e88e83800f138b94d2414621bd9704.png'
  },
  admin: {
    name: 'admin',
    userId: '2',
    access: ['admin'],
    token: 'admin',
    avator: 'https://avatars0.githubusercontent.com/u/20942571?s=460&v=4'
  }
}

const data = {code: "1", data: "", msg:"成功"}
export const login = req => {
  req = JSON.parse(req.body)
  data.data= {token: USER_MAP[req.userName].token}
  return data
}

export const getUserInfo = req => {
  const params = getParams(req.url)
  data.data= USER_MAP[params.token]
  return data
}

export const logout = req => {
  return data
}
