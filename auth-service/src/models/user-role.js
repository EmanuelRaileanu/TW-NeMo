import BaseModel from './base-model.js'
import User from './user.js'

export default class UserRole extends BaseModel {
    get tableName () {
        return 'user_roles'
    }

    users () {
        return this.hasMany(User, 'roleId', 'id')
    }
}

export const ROLES = {
    NORMAL: 'Normal',
    ADMIN: 'Admin',
    OWNER: 'Owner'
}