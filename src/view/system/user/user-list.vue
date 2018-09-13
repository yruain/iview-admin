<template>
  <div>
    <search-page-table
      ref="searchPageTable"
      :api="api"
      :search="search"

      :default-entity="formData"
      :edit-forms="forms"

      :tableData="tableData"
      :columns="columns"
      :remoteDataFilter="handelremoteData"
    >

      <template slot-scope="scope"  slot="statusRender">
        {{  scope.row.enable | statusFilter}}
      </template>
    </search-page-table>
  </div>
</template>

<script>
import SearchPageTable from '_c/search-page-table'
import user from '@/api/user'

const defaultForm = {
  id: '',
  userName: '',
  displayname: '',
  enable: 0,
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
  name: 'userList',
  components: {
    SearchPageTable
  },
  data () {
    const _this = this;
    
    return {
      api: user,
      search: {
        entity: {
          userName: '',
          enable: ''
        },
        forms:[
          {label: '用户名', prop: 'userName'},
          {label: '状态', prop: 'enable', type: 'select', options:status}
        ],
      },
      
      formData: defaultForm,
      forms:[
        {label: '用户名', prop: 'userName'},
        {label: '显示名', prop: 'displayname'},
        {label: '状态', prop: 'enable', type: 'select', 
          options: function() {
            const temp = status.filter(e => e.isEdit)
            return temp
          }},
        {label: '描述', prop: 'mark'}
      ],
      columns: [
        {title: '编号', type: 'index', key: 'handle'},
        {title: '用户名', key: 'userName', sortable: true},
        {title: '显示名', key: 'displayname', editable: true},
        {title: '创建者', key: 'createOperator'},
        {title: '创建时间', key: 'createDate'},
        {title: '状态', key: 'enable', slotName: "statusRender"},
        {title: '描述', key: 'mark'},
        { title: '操作',  key: 'handle', options: ['delete','edit', 'create']  }
      ],
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

