import QueryModule from '@/api/queryModule'

class Resource extends QueryModule {
  constructor() {
    super('resource', 'id')
  }
}

export default new Resource()