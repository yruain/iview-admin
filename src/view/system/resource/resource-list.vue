<template>
  <div>
        <search-tree
          ref="searchTreePage"
          :api="api"
          :search="search"

          :default-entity="defaultEntity"
          :edit="edit"

          :tableData="tableData"
          :remoteDataFilter="handelremoteData"
        >
        </search-tree>
  </div>
</template>

<script>
import SearchTree from '_c/search-tree'
import api from '@/api/resource'

const defaultEntity = {
  id: '',
  pid: '',
  code: '',
  name: '',
  /** 1启用，0禁用 */
  enable: 1,
  mark: ''
}

const status = [
  {
    value: '',
    label: '请选择',
    isEdit: false
  },
  {
    value: 1,
    label: '启用',
    isEdit: true
  },
  {
    value: 0,
    label: '禁用',
    isEdit: true
  }
]

const statusCss = ['', 'success']

export default {
  name: 'resourceList',
  components: {
    SearchTree
  },
  data () {
    const _this = this;
    
    return {
      api: api,
      defaultEntity,
      search: {
        entity: {
          roleCode: '',
          roleName: '',
          enable: ''
        },
        forms:[
          {label: '编码', prop: 'roleCodePath'},
          {label: '名称', prop: 'roleNamePath'},
          {label: '状态', prop: 'enable', tag: 'select', options:status}
        ],
      },
      edit:{
        labelWidth: 75,
         forms:[
            {label: 'pid', prop: 'pid'},
            {label: 'id', prop: 'id'},
            {label: '编码', prop: 'code'},
            {label: '名称', prop: 'name'},
            {label: '状态', prop: 'enable', tag: 'select', 
              options: function() {
                const temp = status.filter(e => e.isEdit)
                return temp
              }},
            {label: '描述', prop: 'mark'}
          ],
          rules:{
              userName: [
                  { required: true, message: '编码不能为空', trigger: 'blur' },
                  { pattern: "^[a-zA-Z0-9\-]{3,20}$", message: '必须是3到20个英文数字或’-‘', trigger: 'blur' }
              ],
              displayname: [
                  { required: true, message: '名称不能为空', trigger: 'blur' }
              ],
              mark: [
                  { type: 'string', max: 20, message: '最大不能超过20个字符', trigger: 'blur' }
              ]
          },
      },
      treeKey:{
        id: 'id',
        pid: 'pid',
        title: 'name',
      },
      tableData: []
    }
  },
 
  computed: {
    editStatus: function() {
      const temp = status.filter(e => e.isEdit)
      console.log('计算属性', temp)
      return temp
    },
    isEdit(){
      return  this.editDialogType === 'edit' || this.editDialogType === 'create'
    }
  },
  filters: {
    statusCssFilter(enable) {
      return statusCss[enable]
    },
    statusFilter(enable) {
      
      const temp = status.filter(e => e.value === enable)
      return temp[0].label
    }
  },
  methods: {
    selectOptionsFilter(options){
      alert(options);
      return options;
    },
    handelremoteData( data){
      console.log("过滤远程数据", data);
      return data
    }
  }
}

</script>


