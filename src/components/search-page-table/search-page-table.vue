<template>
  <div>
    <Card class="page-container">
      <div class="page-container-head">
        <EditForm 
          ref="searchForm"
          :inline="true"
          :formData="search.entity"
          :forms="search.forms"
          :rules="search.rules"
          :show-message="search.showMessage"
          :autocomplete="search.autocomplete"
          :label-width="search.labelWidth"
          show-submit="true"
          submit-text="查询"
          show-reset="true"
          reset-text="重置"
          @on-after-validate="doFilter"
        />
        <slot name="searchFormFooter" />
      </div>
      <tables 
        ref="dataTables"
        border
        v-model="tableData" 
        :loading="loading"
        :columns="handleColumns" 
        @on-delete="submitDelete"
        @on-edit="handleStartEdit"
        @on-create="handleCreate"
      >
        
       
       <slot 
            v-for="(row) in columns"
            v-if="row.slot"
            :name="row.slot"
            :slot="row.slot"
         />
      </tables>

      <div class="page-container-foot">
        <slot name="pageContainerHeader" />
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
      :loading="editLoading"
      @on-ok="handleEditModalOk"
    >
    <EditForm 
        ref="editForm"
        :rules="edit.rules"
        :formData="edit.entity"
        :forms="edit.forms"
        :show-message="edit.showMessage"
        :autocomplete="edit.autocomplete"
        :label-width="edit.labelWidth"
        :edit="isEdit"
        @on-validate-ok="submitData"
        @on-validate-error="validateError"
      />
    
    </Modal>
     
  </div>
</template>

<script>
import Tables from '_c/tables'
import EditForm from '_c/edit-form'

const formDefault= {
      entity:{
        type: Object,
        default () {
          return {}
        }
      },
      forms:{
        type: Array,
        default () {
          return []
        }
      },
      showMessage: {
        type: Boolean,
        default () {
          return true
        }
      },
      autocomplete:{
        type: String,
        default () {
          return 'off'
        }
      }
    }
export default {
  name: 'SearchPageTable',
  components: {
    Tables,
    EditForm
  },
  props: {
    /**查询api对象 */
    api:Object,

    /** 查询相关数据 */
    search: formDefault,
    /** 实体默认参数，创建时使用 */
    defaultEntity:{},
    edit:formDefault,
    columns:Array,
    /**过滤返回数据 */
    remoteDataFilter: Function
    
  },
  data () {
    const _this = this;
    return {
      // 模态窗口状态 edit, show,create
      editDialogType: 'edit',
      // Dialog 隐藏还是显示
      editDialogVisible: false,
      loading:true,
      editLoading:true,
      pageData: {
        total: 0,
        size: 10,
        current: 1,
        pages: 1
      },
      tableData:[]
    }
  },
  created () {
    this.edit.entity= Object.assign({}, this.defaultEntity)
    this.fetchData()
  },
  computed: {
    isEdit(){
      return  this.editDialogType === 'edit' || this.editDialogType === 'create'
    },
    handleColumns: function(){
     let cols = this.columns.map((item, index) => {
        let res = item
        if (res.slotName) res = this.suportSlot(res, index)
        return res
      })
      return cols
    }
  },
  filters: {
    
  },
  methods: {
    fetchData() {
      this.loading = true;
      const {total, ...tempPageData} = this.pageData
      //  ,"size":10,"current":1,"
      const tmpParam = Object.assign({}, this.search.entity, tempPageData)
      const param = {};

      // 过滤空数据
      new Map(Object.entries(tmpParam)).forEach( (value, key)  => {
        if(value === null || value === undefined || value === ''){
            return;
        }
        param[key] = value
      })
    
      return this.api.pageData(param).then(response => {
        const {records, ...pageData} =  this.remoteDataFilter === 'function' ? Reflect.apply(this.remoteDataFilter, this.$parent, response.data)  : response.data
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
      this.edit.entity = Object.assign({}, params.row)
      this.temp = Object.assign({}, params.row)
      console.log('更新页面', params)
    },
    handleCreate() {
       this.editDialogType = 'create'
      this.editDialogVisible = true
      this.edit.entity = Object.assign({}, defaultEntity)
    },
    submitDelete(params) {
      this.edit.entity = params.row;
      this.api.deleteById(this.edit.entity).then(() => {
        for (const v of this.tableData) {
          if (v[this.api.id] === this.edit.entity[this.api.id]) {
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
    validateError(){
        this.editLoading=false ;
    },
    submitUpdateData(){
        const tempData = Object.assign({}, this.edit.entity)
        // 过滤掉相等的数据
        new Map(Object.entries(tempData)).forEach( (value, key) => {
          if( key != this.api.id &&  this.temp[key] === value){
              delete this.temp[key];
          } else {
            this.temp[key] = value
          }
        })

        if (Object.keys(this.temp).length <= 1){
          console.log('没有需要更新的属性')
          this.editDialogVisible = false
          return true;
        }
        // 更新，最少要有一个属性,ID除外
        this.api.updateData(this.temp).then(() => {
          for (const v of this.tableData) {
            if (v.id === this.edit.entity.id) {
              const index = this.tableData.indexOf(v)
              this.tableData.splice(index, 1, this.edit.entity)
              break
            }
          }
          this.$Message.success('更新成功')
          this.editDialogVisible = false
        })
    },
    submitCreateData(){
      const tempData = Object.assign({}, this.edit.entity)
      this.api.insertData(tempData).then((response) => {
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
    },
    
    suportSlot(res, index){ 
      var _self_ = this
      this.$set(res, 'render',(h,param) => h('span', _self_.$scopedSlots[res.slotName](param)) )
      return res
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

