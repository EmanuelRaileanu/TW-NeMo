export const up = async (knex) => {
    if (!await knex.schema.hasTable('favorite_movies')) {
        await knex.schema.createTable('favorite_movies', table => {
            table.uuid('userId').notNullable()
            table.uuid('movieId').references('movies.id')
            table.unique(['userId', 'movieId'])
        })
    }
    if (!await knex.schema.hasTable('favorite_tv_shows')) {
        await knex.schema.createTable('favorite_tv_shows', table => {
            table.uuid('userId').notNullable()
            table.uuid('tvShowId').references('tv_shows.id')
            table.unique(['userId', 'tvShowId'])
        })
    }
}

export const down = async (knex) => {
    if (await knex.schema.hasTable('favorite_movies')) {
        await knex.schema.dropTable('favorite_movies')
    }
    if (await knex.schema.hasTable('favorite_tv_shows')) {
        await knex.schema.dropTable('favorite_tv_shows')
    }
}
