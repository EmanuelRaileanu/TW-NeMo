import Bookshelf from '../bookshelf.js'
import UserRole, { ROLES } from '../models/user-role.js'

export const seed = async (knex) => {
    await Bookshelf.transaction(async t => {
        // Delete ALL existing entries
        await knex('user_roles').transacting(t).del()

        await Promise.all(Object.values(ROLES).map(async role => {
            await new UserRole({ name: role }).save(null, { method: 'insert', transacting: t })
        }))
    })
}
