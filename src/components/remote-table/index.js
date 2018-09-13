
/**
 * 增加可加载远程表格组件remote-table，继承page-table，新增属性dataRemote，类型为Function，返回值为Promise，为加载远程数据方法，
 * 增加on-before-load事件和on-loaded事件，远程表格组件中data不再有效，但是可以通过data.sync来获取当前表格数据
 */
import PageTable from '../page-table'
const TOTAL = 'total'
const ITEMS = 'items'
 export default {
  name: 'remote-table',
  extends: PageTable,
  props: {
    dataRemote: Function
  },
  data () { // 自带属性值
    return {
      mData: []
    }
  },
  methods: {
    load: function () {
      if (this.dataRemote) {
        let pageIndex = this.pageCurrent
        let pageSize = this.mPageSize
        this.$emit('on-before-load', this.mData)
        let promise = this.dataRemote(pageIndex, pageSize)
        promise && promise.then(res => {
          this.loadData(res.data)
        })
      }
    },
    loadData: function (data) {
      this.pageTotal = data[TOTAL]
      this.mData = data[ITEMS]
      this.$emit('update:data', this.mData)
      this.$emit('on-loaded', this.mData)
    },
    bindPageEvent: function () {
      let _this = this
       let page = this.$refs[this.$props.pageRefs]
      page.$on('on-change', function (val) {
        _this.$emit('update:current', val)
        _this.$emit('on-change', ...arguments)
        _this.load()
      })
      page.$on('on-page-size-change', function (val) {
        _this.mPageSize = val
        _this.$emit('on-page-size-change', ...arguments)
        _this.load()
      })
    }
  },
  computed: {
    tableData: function () {
      return this.mData
    }
  },
  mounted () {
    this.load()
  }
}