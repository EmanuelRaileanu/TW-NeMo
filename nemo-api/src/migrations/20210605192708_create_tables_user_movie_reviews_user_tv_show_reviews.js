export const up = async (knex) => {
    if (!await knex.schema.hasTable('user_movie_reviews')) {
        await knex.schema.createTable('user_movie_reviews', table => {
            table.uuid('id').primary()
            table.uuid('userId')
            table.uuid('movieId').references('movies.id')
            table.decimal('score', 2, 2).notNullable()
            table.string('text', 2000).nullable()
            table.timestamp('createdAt').defaultTo(knex.fn.now())
            table.timestamp('updatedAt').nullable()
            table.unique(['userId', 'movieId'])
        })
    }
    if (!await knex.schema.hasTable('user_tv_show_reviews')) {
        await knex.schema.createTable('user_tv_show_reviews', table => {
            table.uuid('id').primary()
            table.uuid('userId')
            table.uuid('tvShowId').references('tv_shows.id')
            table.decimal('score', 2, 2).notNullable()
            table.string('text', 2000).nullable()
            table.timestamp('createdAt').defaultTo(knex.fn.now())
            table.timestamp('updatedAt').nullable()
            table.unique(['userId', 'tvShowId'])
        })
    }
}

export const down = async (knex) => {
    if (await knex.schema.hasTable('user_movie_reviews')) {
        await knex.schema.dropTable('user_movie_reviews')
    }
    if (await knex.schema.hasTable('user_tv_show_reviews')) {
        await knex.schema.dropTable('user_tv_show_reviews')
    }
}
