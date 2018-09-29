import { getParams } from '@/libs/util'

const data = {code: 0, data: "", msg:"成功"}

export const page = req => {
 
  return {code:0 ,data:{records:[
    {id:1,createOperator:"system",createDate:"2018-08-10T23:47:04",updateOperator:null,updateDate:"2018-08-23T11:22:00",userName:"admin",enable:1,displayname:"系统管理11",mark:null},
    {id:1,createOperator:"system",createDate:"2018-08-10T23:47:04",updateOperator:null,updateDate:"2018-08-23T11:22:00",userName:"admin",enable:1,displayname:"系统管理11",mark:null}
   
    ],total:9,size:10,current:1,pages:1},msg:"成功"}
}
