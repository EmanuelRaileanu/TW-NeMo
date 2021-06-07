export const up = async (knex) => {
    if (await knex.schema.hasTable('tv_seasons')) {
        if (await knex.schema.hasColumn('tv_seasons', 'tmdbId')) {
            await knex.schema.alterTable('tv_seasons', table => {
                table.dropUnique(['tmdbId'])
            })
        }
    }
}

export const down = async (knex) => {
    if (await knex.schema.hasTable('tv_seasons')) {
        if (await knex.schema.hasColumn('tv_seasons', 'tmdbId')) {
            await knex.schema.alterTable('tv_seasons', table => {
                table.string('tmdbId').unique().alter()
            })
        }
    }
}
