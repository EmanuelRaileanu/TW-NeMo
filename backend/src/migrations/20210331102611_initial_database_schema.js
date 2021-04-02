
export const up = async (knex) => {
    if (!await knex.schema.hasTable('countries')) {
        await knex.schema.createTable('countries', table => {
            table.uuid('id').primary()
            table.string('code').unique()
            table.timestamp('createdAt').defaultTo(knex.fn.now())
            table.timestamp('updatedAt')
        })
    }
    if (!await knex.schema.hasTable('production_companies')) {
        await knex.schema.createTable('production_companies', table => {
            table.uuid('id').primary()
            table.string('name')
            table.string('logoPath')
            table.uuid('countryId').references('countries.id')
            table.integer('tmdbId').unique()
            table.timestamp('createdAt').defaultTo(knex.fn.now())
            table.timestamp('updatedAt')
        })
    }
    if (!await knex.schema.hasTable('genres')) {
        await knex.schema.createTable('genres', table => {
            table.uuid('id').primary()
            table.string('name').unique()
            table.integer('tmdbId').unique()
            table.timestamp('createdAt').defaultTo(knex.fn.now())
            table.timestamp('updatedAt')
        })
    }
    if (!await knex.schema.hasTable('movies')) {
        await knex.schema.createTable('movies', table => {
            table.uuid('id').primary()
            table.string('title').unique()
            table.string('tagline')
            table.string('description')
            table.decimal('voteAverage', 2, 2)
            table.integer('numberOfVotes')
            table.string('status')
            table.date('releaseDate')
            table.integer('runtimeInMinutes')
            table.string('budget')
            table.decimal('revenue', 10, 2)
            table.string('imdbId')
            table.string('posterPath')
            table.integer('tmdbId').unique()
            table.timestamp('createdAt').defaultTo(knex.fn.now())
            table.timestamp('updatedAt')
        })
    }
    if (!await knex.schema.hasTable('movies_production_companies')) {
        await knex.schema.createTable('movies_production_companies', table => {
            table.uuid('movieId').references('movies.id')
            table.uuid('productionCompanyId').references('production_companies.id')
        })
    }
    if (!await knex.schema.hasTable('movies_languages')) {
        await knex.schema.createTable('movies_languages', table => {
            table.uuid('movieId').references('movies.id')
            table.uuid('languageId').references('languages.id')
        })
    }
    if (!await knex.schema.hasTable('movies_genres')) {
        await knex.schema.createTable('movies_genres', table => {
            table.uuid('movieId').references('movies.id')
            table.uuid('genreId').references('genres.id')
        })
    }
    // TODO: Model many-to-many relationship with actors
    // TODO: Create table tv_shows and tv_episodes (tv_episodes.season, tv_episodes.tvShowId references tv_shows.id)
}

export const down = async (knex) => {
    if (await knex.schema.hasTable('movies')) {
        await knex.schema.dropTable('movies')
    }
}
