import request from '@/libs/api.request'

export const getTableData = () => {
  return request({
    url: 'get_table_data',
    method: 'get'
  })
}

export const getDragList = () => {
  return request({
    url: 'get_drag_list',
    method: 'get'
  })
}

export const getPageTableData = ({ index, size }) => {
 
  const data = {
    index,
    size
  }
  return request({
    url: 'get_page_table_data',
    data,
    method: 'get'
  })
}
