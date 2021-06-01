export const up = async (knex) => {
    if (!await knex.schema.hasTable('user_roles')) {
        await knex.schema.createTable('user_roles', table => {
            table.uuid('id').primary()
            table.string('name').unique()
            table.timestamp('createdAt').defaultTo(knex.fn.now())
            table.timestamp('updatedAt').nullable()
        })
    }
    if (!await knex.schema.hasTable('users')) {
        await knex.schema.createTable('users', table => {
            table.uuid('id').primary()
            table.uuid('roleId').references('user_roles.id').notNullable()
            table.string('username').unique()
            table.string('email').unique()
            table.string('password')
            table.boolean('isEmailConfirmed').defaultTo(false)
            table.string('confirmationToken', 2000)
            table.timestamp('createdAt').defaultTo(knex.fn.now())
            table.timestamp('updatedAt').nullable()
        })
    }
    if (!await knex.schema.hasTable('token_blacklist')) {
        await knex.schema.createTable('token_blacklist', table => {
            table.uuid('id').primary()
            table.string('token', 5000)
            table.timestamp('createdAt').defaultTo(knex.fn.now())
            table.timestamp('updatedAt').nullable()
        })
    }
}

export const down = async (knex) => {
    if (await knex.schema.hasTable('users')) {
        await knex.schema.dropTable('users')
    }
    if (await knex.schema.hasTable('user_roles')) {
        await knex.schema.dropTable('user_roles')
    }
    if (await knex.schema.hasTable('token_blacklist')) {
        await knex.schema.dropTable('token_blacklist')
    }
}
