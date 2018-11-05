<template>
  <div class="split-pane-page-wrapper">
    <Card class="page-container" v-if="searchData">
      <div class="page-container-head">
        <EditForm 
          ref="searchForm"
          :inline="true"
          :formData="searchData.entity"
          :forms="searchData.forms"
          :rules="searchData.rules"
          :show-message="searchData.showMessage"
          :autocomplete="searchData.autocomplete"
          :label-width="searchData.labelWidth"
          show-submit="true"
          submit-text="查询"
          show-reset="true"
          reset-text="重置"
          @on-validate-ok="doFilter"
        />
        <slot name="searchFormFooter" />
      </div>
    </Card> 

    <split  ref="split" v-model="offset" @on-moving="handleMoving">
            <div ref="split_left"  slot="left" class="pane left-pane">
              <Tree key="listTreeKey"
                    ref="listTree"
                    
                    :data="treeData" 
                    :load-data="loadData" 
                    :render="renderContent"
                    @on-select-change="handleStartEdit"
                    
                ></Tree>
            </div>
            <div  ref="split_right" slot="right" class="pane right-pane">
                 <Card class="page-container"  v-show="editDialogVisible">
                      <EditForm 
                    
                      ref="editForm"
                      :rules="editData.rules"
                      :formData="editData.entity"
                      :forms="editData.forms"
                      :show-message="editData.showMessage"
                      :autocomplete="editData.autocomplete"
                      :label-width="editData.labelWidth"
                      :edit="isEdit"
                      show-submit="true"
                      submit-text="保存"
                      show-reset="true"
                      reset-text="重置"
                      @on-validate-ok="submitData"
                      @on-validate-error="validateError"
                    >
                      <template slot="formButton" >
                          <Button @click="handleCancelEdit">取消</Button>
                      </template>
                    </EditForm>
                 </Card>
              </div>
        </split>    
  </div>
</template>

<script>
import Tables from '_c/tables'
import EditForm from '_c/edit-form'
import { forEach } from '../../libs/tools';

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
let vm = {
  name: 'SearchTree',
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
    edit: formDefault,
    treeKey: {
        type: Object,
        default () {
          return {
              id: 'id',
              pid: 'pid',
              title: 'name',
              namePath: 'name_path',
              codePath: 'code_path'
            }
        }
      },
    /**过滤返回数据 */
    remoteDataFilter: Function
    
  },
  data () {
    const _this = this;
    return {
      buttonProps: {
              type: 'default',
              size: 'small',
          },
      treeData: [{
          id: '0',
          pid: '-1',
          title: '数据',
          loading: false,
          expand:false,
          children: [],
          render: (h, { root, node, data }) => {
                        return h('span', {
                            style: {
                                display: 'inline-block',
                                width: '90%'
                            }
                        }, [
                            h('span', [
                                h('Icon', {
                                    props: {
                                        type: 'ios-folder-outline'
                                    },
                                    style: {
                                        marginRight: '8px'
                                    }
                                }),
                                h('span', data.title)
                            ]),
                            h('span', {
                                style: {
                                    display: 'inline-block',
                                    float: 'right',
                                    marginRight: '32px'
                                }
                            }, [
                                h('Button', {
                                    props: Object.assign({}, this.buttonProps, {
                                        icon: 'ios-add',
                                        type: 'primary'
                                    }),
                                    style: {
                                        width: '64px'
                                    },
                                    on: {
                                        click: () => { this.handleCreate(data) }
                                    }
                                })
                            ])
                        ]);
                    }
      }],
      searchData: {},
      editData: {},
      offset: 0.3,
      // 模态窗口状态 edit, show,create
      editDialogType: 'edit',
      // Dialog 隐藏还是显示
      editDialogVisible: false,
      loading:true,
      editLoading:true,
      tableData:[]
    }
  },
  created () {
    this.searchData = this.search;
    this.editData = this.edit;
    this.$set(this.editData, 'entity', Object.assign({}, this.defaultEntity));
  },
  watch:{
    
  },
  computed: {
    isEdit(){
      return  this.editDialogType === 'edit' || this.editDialogType === 'create'
    }
  },
  filters: {
    
  },
  methods: {
    // 异步加载数据
    loadData (item, callback) {
      this.searchTmp ={};
      this.searchTmp[this.treeKey.pid] = item[this.treeKey.id];
      let _this = this;
      this.fetchData.apply(this,[]).then(response => {
        let tree = _this.parseTree(item, _this.tableData);
        if (tree.length > 0){
          callback(tree);
        } else {
          // callback(tree);
           item.expand =false;
           item.loading =false;
           this.$delete(item, 'loading');
           this.$delete(item, 'children');
        }
        
      });
      
    },

    // 查询
    doFilter() {
      this.searchTmp =  Object.assign({}, this.searchData.entity);
      this.fetchData().then(response => {
        const item = this.treeData[0]; 
       let tree = this.parseTree(item, this.tableData);
       
        if (tree.length > 0){
          this.$delete(item, 'loading');
          this.$set(item,  'children', tree);
          this.$set(item,  'expand', true);
        } else {
          // callback(tree);
           item.expand =false;
           item.loading =false;
           this.$delete(item, 'loading');
           this.$delete(item, 'children');
        } 
      });
    },

    fetchData() {
      this.loading = true;
      const param = {};

      // 过滤空数据
      new Map(Object.entries(this.searchTmp)).forEach( (value, key)  => {
        if(value === null || value === undefined || value === ''){
          console.debug('查询条件 ' + key + ' is null')
          return;
        }
        param[key] = value
      })
    
      // 没有查询条件则用根的id作为pid查询
      if (Object.entries(param).length == 0){
         const item = this.treeData[0]; 
         param[this.treeKey.pid] = item[this.treeKey.id];
      }

      let _this = this;
      return this.api.listData(param).then(response => {
        _this.tableData  =  _this.remoteDataFilter === 'function' ? Reflect.apply(_this.remoteDataFilter, _this.$parent, response.data)  : response.data
        _this.loading = false;

        if (_this.tableData.length == 0){
          throw new Error('未找到数据');
        }
      }).catch((e)=>{
          this.$Message.success(e.message);
        });
    },
    
    handleCancelEdit(){
      this.editDialogVisible = false;
    },
    handleStartEdit(data) {
      this.editDialogVisible = false;
      let params = data;
      if (!params) return;
      this.editDialogType = 'edit';
      this.editDialogVisible = true;
      
      let pidForm = this.editData.forms.find(el => el.prop == this.treeKey.pid);
      let idForm = this.editData.forms.find(el => el.prop == this.treeKey.id);
      this.$set(pidForm, 'readonly',true) ;
      this.$set(idForm, 'readonly',true) ;

      this.editData.entity =  Object.assign({},params );
      this.temp = Object.assign({}, params);
      
      console.debug('更新页面', params);
    },
    handleCreate(node) {
      this.editDialogType = 'create';
      this.editDialogVisible = true;

      // 构造父对象数据
      let pidForm = this.editData.forms.find(el => el.prop == this.treeKey.pid);
      let idForm = this.editData.forms.find(el => el.prop == this.treeKey.id);

      this.$set(pidForm, 'readonly',true) ;
      this.$set(idForm, 'readonly',false) ;
      
      this.createParentNode = node;
      
      this.editData.entity = Object.assign({}, this.defaultEntity, { [this.treeKey.pid]: node[this.treeKey.id] });
    },
    handleDelete(root, node, data){
     
      this.submitDelete(root, node, data);
    },
    submitDelete(root, node, data) {
      if (this.isFolder(data)){
        this.$Message.error("请先删除子节点");
        return ;
      } 

      if (data.loading == false){
        let param = {};
        param[this.treeKey.pid] = data[this.treeKey.id];
        this.api.getOne(param).then(response =>{
          if (!response.data){
            this.api.deleteById(data).then((response) => {
              this.remove(root, node, data);
              this.$Message.success('删除成功');
            });
          } else {
             this.$Message.error("请先删除子节点");
          }
        });

      } else {
        this.api.deleteById(data).then((response) => {
          this.remove(root, node, data);
          this.$Message.success('删除成功');
        });
      }
  
    },
    // 验证失败
    validateError(){
      this.editLoading=false
      this.$nextTick(() => {
        this.editLoading = true;
      })
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
        const tempData = Object.assign({}, this.editData.entity);
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
          this.update(this.editData.entity);
          this.$Message.success('更新成功')
          this.editLoading=true
          this.editDialogVisible = false
        }).catch(()=>{
          this.editLoading=true
          this.editDialogVisible = false
        });
    },
    submitCreateData(){
      const tempData = Object.assign({}, this.editData.entity)
      this.api.insertData(tempData).then((response) => {
         this.append(this.editData.entity);
          this.$Message.success('插入成功')
          this.editLoading=true
          this.editDialogVisible = false
      }).catch(()=>{
          this.editLoading=true
          this.editDialogVisible = false
        })
    },
    handleMoving (e) {
      console.log(e.atMin, e.atMax)
    },

    // 是否是文件夹 是则返回 true
    isFolder(item){
      console.log(item.children &&  (item.children.length > 0));
      return item.children &&  (item.children.length > 0);
    },

    // 将list解析成Tree
    parseTree(item, tableData){
      let map = {};
      let currt = '';
      for (let i in tableData){
        currt = map[tableData[i][this.treeKey.pid]];
        if (! currt){
          map[tableData[i][this.treeKey.pid]] = [];
        }
        map[tableData[i][this.treeKey.pid]].push(tableData[i]);
      }

      let children  = [];
      if (map[item[this.treeKey.id]]){
        children  = map[item[this.treeKey.id]];
        this._getTreefromMap(map, children);
      }

      return children;
    },
    // 将map解析成tree
    _getTreefromMap(map, children){
        for (const key in children) {
          if (children.hasOwnProperty(key)) {
            const ele = children[key];
           
            this.$set(ele, 'title',ele[this.treeKey.title]);
            this.$set(ele, 'loading',false);
            this.$set(ele, 'children',[]);
           
            if(map[ele[this.treeKey.id]]) {
              let items = map[ele[this.treeKey.id]];
              for (const key in items) {
                if (items.hasOwnProperty(key)) {
                  const item = items[key];
                  this.$set(ele.children, key, item);
                }
              }
              delete map[ele[this.treeKey.id]];
              this._getTreefromMap(map, ele.children);
            }
          }
        }

      return children;
    },


    // 查找元素
    findItem(root, value, pro){
       root = root || this.treeData;
       root = Array.isArray(root) ? root : root.children;
       var node = root.find(el => el[pro] == value);
      if (!node){
        for (const key in root) {
          if (root.hasOwnProperty(key)) {
            const element = root[key];
            node = this.findItem(element.children, value, pro);
            if (node) {
              break;
            }
          }
        }
      } 

      return node;
    },
   append (item) {
      item.title = item[this.treeKey.title];
      const children = this.createParentNode.children || [];
      children.push(item);
      this.$set(this.createParentNode, 'children', children);  
      this.createParentNode.expand =true;
    },
    remove (root, node, data) {
        const parentKey = root.find(el => el === node).parent;
        const parent = root.find(el => el.nodeKey === parentKey).node;
        const index = parent.children.indexOf(data);
        parent.children.splice(index, 1);
    },
    update (item) {
        const parent = this.findItem(null, item[this.treeKey.pid], this.treeKey.id);
        const data = this.findItem(parent, item[this.treeKey.id], this.treeKey.id);
        const index = parent.children.indexOf(data);
        item.title = item[this.treeKey.title];
        parent.children.splice(index, 1, item);
    },
    
    renderContent (h, { root, node, data }) {
                return h('span', {
                    style: {
                        display: 'inline-block',
                        width: '90%'
                    }
                }, [
                    h('span', [
                        h('Icon', {
                            props: {
                                type: 'ios-paper-outline'
                            },
                            style: {
                                marginRight: '8px'
                            }
                        }),
                        h('span', data.title)
                    ]),
                    h('span', {
                        style: {
                            display: 'inline-block',
                            float: 'right',
                            marginRight: '32px'
                        }
                    }, [
                        h('Button', {
                            props: Object.assign({}, this.buttonProps, {
                                icon: 'ios-add'
                            }),
                            style: {
                                marginRight: '8px'
                            },
                            on: {
                                click: () => { this.handleCreate(data) }
                            }
                        }),
                         h('Button', {
                            props: Object.assign({}, this.buttonProps, {
                                icon: 'ios-create-outline'
                            }),
                            style: {
                                marginRight: '8px'
                            },
                            on: {
                                click: () => { this.handleStartEdit(data) }
                            }
                        }),
                        h('Button', {
                            props: Object.assign({}, this.buttonProps, {
                                icon: 'ios-remove'
                            }),
                            on: {
                                click: () => { this.handleDelete(root, node, data) }
                            }
                        })
                    ])
                ]);
            }
  }
}

export default vm;
</script>
<style lang="less">
.page-container{
  &-head{
    width: 100%;
    height: 100%;
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


.center-middle{
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}
.split-pane-page-wrapper{
  height: 600px;
  background: #ffffff;
  border: 1px;
  .pane{
    width: 100%;
    height: 100%;
  }

}
.ivu-split-wrapper{
    background: #ffffff;
    position: relative;
    width: 100%;
    height: 100%;
}
</style>

