const btns = {
  delete: (h, params, vm) => {
    return h('Poptip', {
      props: {
        confirm: true,
        title: '你确定要删除吗?'
      },
      on: {
        'on-ok': () => {
          vm.$emit('on-delete', params)
          // vm.$emit('input', params.tableData.filter((item, index) => index !== params.row.initRowIndex))
        }
      }
    }, [
      h('Button', {
        props: {
          type: 'text',
          ghost: true
        }
      }, [
        h('Icon', {
          props: {
            type: 'md-trash',
            size: 18,
            color: '#000000'
          }
        })
      ])
    ])
  },
  edit: (h, params, vm) => {
    return h('Button',{
      props: {
        type: 'text',
        ghost: true
      },
      on: {
        'click': () => {
          vm.$emit('on-edit', params)
          //vm.$emit('input', params.tableData.filter((item, index) => index !== params.row.initRowIndex))
        }
      }
    },  [
        h('Icon', {
          props: {
            type: 'md-create',
            size: 18,
            color: '#000000'
          }
        })
    ])
  },
  create: (h, params, vm) => {
    return h('Button',{
      props: {
        type: 'text',
        ghost: true
      },
      on: {
        'click': () => {
          vm.$emit('on-create', params)
          //vm.$emit('input', params.tableData.filter((item, index) => index !== params.row.initRowIndex))
        }
      }
    },  [
        h('Icon', {
          props: {
            type: 'md-add-circle',
            size: 18,
            color: '#000000'
          }
        })
    ])
  }
}

export default btns
