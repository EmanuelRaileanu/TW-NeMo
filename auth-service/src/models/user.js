import BaseModel from './base-model.js'
import UserRole from './user-role.js'

export default class User extends BaseModel {
    get tableName () {
        return 'users'
    }

    role () {
        return this.belongsTo(UserRole, 'roleId', 'id')
    }
}