import QueryModule from '@/api/queryModule'

class User extends QueryModule {
  constructor() {
    super('user', 'id')
  }
}

export default new User()