import Mock from 'mockjs'
import { login, logout, getUserInfo } from './login'
import { getTableData, getDragList, getPageTableData } from './data'

 import { page } from './user'

// 登录相关和获取用户信息
Mock.mock(/\/login/, login)
Mock.mock(/\/getUserInfo/, getUserInfo)
Mock.mock(/\/logout/, logout)
Mock.mock(/\/get_table_data/, getTableData)
Mock.mock(/\/get_drag_list/, getDragList)
Mock.mock(/\/get_page_table_data/, getPageTableData)

 Mock.mock(/\/user\/page/, page)

export default Mock
