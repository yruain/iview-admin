import QueryModule from '@/api/queryModule'

class Role extends QueryModule {
  constructor() {
    super('role', 'id')
  }
}

export default new Role()