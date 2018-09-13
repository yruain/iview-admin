<template>
  <div>
    <Card class="page-container">
      <div class="page-container-head">
        <EditForm 
          ref="searchForm"
          :inline="true"
          :formData="queryEntity"
          :forms="queryForms"
          show-submit="true"
          submit-text="查询"
          show-reset="true"
          reset-text="重置"
          @on-after-validate="doFilter"
        />
      </div>
      <tables 
        ref="dataTables"
        border
        v-model="tableData" 
        :loading="loading"
        :columns="columns" 
        @on-delete="submitDelete"
        @on-edit="handleStartEdit"
        @on-create="handleCreate"
      >
        <template slot="statusRender" slot-scope="scope">
          {{scope.row.enable | statusFilter}}
        </template>
      </tables>

      <div class="page-container-foot">
        <Button type="primary" @click="exportExcel">导出为Csv文件</Button>
        <Page 
          show-total
          show-elevator 
          show-sizer
          :current="pageData.current"
          :total="pageData.total" 
          :page-size="pageData.size" 
          :page-size-opts="[5,10,20,40]" 
          @on-change="handleCurrentChange"
          @on-page-size-change="handleSizeChange"
          ></Page>
      </div>
    </Card>
      
    <Modal
      v-model="editDialogVisible"
      title="编辑"
      :loading="true"
      @on-ok="handleEditModalOk"
    >
    <EditForm 
        ref="editForm"
        :formData="formData"
        :forms="forms"
        :edit="isEdit"
        @on-after-validate="submitData"
      />
    
    </Modal>
     
  </div>
</template>

<script>
import Tables from '_c/tables'
import EditForm from '_c/edit-form'
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
    Tables,
    EditForm
  },
  data () {
    const _this = this;
    return {
      // 模态窗口状态 edit, show,create
      editDialogType: 'edit',
      // Dialog 隐藏还是显示
      editDialogVisible: false,
      loading:true,
      pageData: {
        total: 0,
        size: 10,
        current: 1,
        pages: 1
      },
      queryEntity: {
        userName: '',
        enable: ''
      },
      queryForms:[
        {label: '用户名', prop: 'userName'},
        {label: '状态', prop: 'enable', type: 'select', options:status}
      ],

      
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
        {title: '状态', key: 'enable',
           render:(h,params) =>{
             return h('span', this.$refs.dataTables.$scopedSlots.statusRender(params));
          }
        },
        {title: '描述', key: 'mark'},
        { title: '操作',  key: 'handle', options: ['delete','edit', 'create']  }
      ],
      tableData: []
    }
  },
  created () {
    this.fetchData()
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
    fetchData() {
      this.loading = true;
      const {total, ...tempPageData} = this.pageData
      //  ,"size":10,"current":1,"
      const tmpParam = Object.assign({}, this.queryEntity, tempPageData)
      const param = {};

      // 过滤空数据
      new Map(Object.entries(tmpParam)).forEach( (value, key)  => {
        if(value === null || value === undefined || value === ''){
            return;
        }
        param[key] = value
      })
    
      return user.pageData(param).then(response => {
        const {records, ...pageData} = response.data
        this.pageData= pageData
        this.tableData = records
        this.loading = false
      })
    },
     exportExcel () {
      this.$refs.dataTables.exportCsv({
        filename: `table-${(new Date()).valueOf()}.csv`
      })
    },

    doFilter(params) {
      // 页面数据改变重新统计数据数量和当前页
      this.pageData.current = 1
      this.fetchData()
    },
    handleStartEdit(params) {
      this.editDialogType = 'edit'
      this.editDialogVisible = true
      this.formData = Object.assign({}, params.row)
      this.temp = Object.assign({}, params.row)
      console.log('更新页面', params)
    },
    handleCreate() {
       this.editDialogType = 'create'
      this.editDialogVisible = true
      this.formData = Object.assign({}, defaultForm)
    },
    submitDelete(params) {
      this.formData = params.row;
      user.deleteById(this.formData).then(() => {
        for (const v of this.tableData) {
          if (v[user.id] === this.formData[user.id]) {
            const index = this.tableData.indexOf(v)
            this.tableData.splice(index, 1)
            break
          }
        }
        this.$Message.success('删除成功')
      })
    },
    // 模态窗口OK被点击
    handleEditModalOk(){
      this.$refs.editForm.handleSubmit();
    },
    // 提交编辑数据
    submitData() {
      if (this.editDialogType === 'show') {
        return ;
      }
      if (this.editDialogType === 'create') {
        this.submitCreateData()
      }
      if (this.editDialogType === 'edit') {
        this.submitUpdateData()
      }
    },
    submitUpdateData(){
        const tempData = Object.assign({}, this.formData)
        // 过滤掉相等的数据
        new Map(Object.entries(tempData)).forEach( (value, key) => {
          if( key != user.id &&  this.temp[key] === value){
              delete this.temp[key];
          } else {
            this.temp[key] = value
          }
        })
       
          // 更新，除ID外要有一个属性
          user.updateData(this.temp).then(() => {
            for (const v of this.tableData) {
              if (v.id === this.formData.id) {
                const index = this.tableData.indexOf(v)
                this.tableData.splice(index, 1, this.formData)
                break
              }
            }
            this.$Message.success('更新成功')
            this.editDialogVisible = false
          })
        
    },
    submitCreateData(){
      const tempData = Object.assign({}, this.formData)
      user.insertData(tempData).then((response) => {
          const data = response.data
          this.tableData.splice(this.tableData.length, 0, data)
          this.$Message.success('插入成功')
          this.editDialogVisible = false
      })
    },
    handleSizeChange(val) {
      this.pageData.size = val
      console.log(this.pageData)
      this.fetchData()
    },
    handleCurrentChange(val) {
      this.pageData.current = val
      console.log(this.pageData)
      this.fetchData()
    }
  }
}
</script>
<style lang="less">
.page-container{
  &-head{
    width: 100%;
    display: inline-block;
    padding: 5px;
  }
  &-foot{
    width: 100%;
    display: inline-block;
    padding: 5px;
  }
}

.ivu-page{
  //display: inline-block;
  float: right;
}
</style>

