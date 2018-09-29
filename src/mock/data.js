import Mock from 'mockjs'
import { doCustomTimes } from '@/libs/util'
const Random = Mock.Random

const data = {code: 0, data: "", msg:"成功"}

export const getTableData = req => {
  let tableData = []
  doCustomTimes(5, () => {
    tableData.push(Mock.mock({
      name: '@name',
      email: '@email',
      createTime: '@date'
    }))
  })

  data.data =tableData
  return data
}

export const getDragList = req => {
  let dragList = []
  doCustomTimes(5, () => {
    dragList.push(Mock.mock({
      name: Random.csentence(10, 13),
      id: Random.increment(10)
    }))
  })

  data.data =dragList
  return data
}

const total = 34
export const getPageTableData = req => {
  req = JSON.parse(req.body)
  let index = req.index || 1
  let size = req.size || 10
  let returnCount = total - size * (index - 1)
  returnCount = returnCount > size ? size : returnCount
  let tableData = []
  doCustomTimes(returnCount, () => {
    tableData.push(Mock.mock({
      name: '@name',
      email: '@email',
      createTime: '@date'
    }))
  })
  
  data.data ={ total: total, items: tableData }
  return data
}
