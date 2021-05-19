export const up = async (knex) => {
    if (!await knex.schema.hasTable('countries')) {
        await knex.schema.createTable('countries', table => {
            table.uuid('id').primary()
            table.string('code').unique()
            table.timestamp('createdAt').defaultTo(knex.fn.now())
            table.timestamp('updatedAt')
        })
    }
    if (!await knex.schema.hasTable('languages')) {
        await knex.schema.createTable('languages', table => {
            table.uuid('id').primary()
            table.string('code').unique()
            table.timestamp('createdAt').defaultTo(knex.fn.now())
            table.timestamp('updatedAt')
        })
    }
    if (!await knex.schema.hasTable('ratings')) {
        await knex.schema.createTable('ratings', table => {
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
            table.string('description', 2000)
            table.string('headquarters')
            table.string('logoPath')
            table.uuid('countryId').references('countries.id')
            table.integer('tmdbId').unique()
            table.timestamp('createdAt').defaultTo(knex.fn.now())
            table.timestamp('updatedAt')
        })
    }
    if (!await knex.schema.hasTable('movie_genres')) {
        await knex.schema.createTable('movie_genres', table => {
            table.uuid('id').primary()
            table.string('name').unique()
            table.integer('tmdbId').unique()
            table.timestamp('createdAt').defaultTo(knex.fn.now())
            table.timestamp('updatedAt')
        })
    }
    if (!await knex.schema.hasTable('tv_show_genres')) {
        await knex.schema.createTable('tv_show_genres', table => {
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
            table.uuid('ratingId').references('ratings.id')
            table.string('title').unique()
            table.string('tagline')
            table.string('description', 2000)
            table.decimal('voteAverage', 10, 2).defaultTo(0)
            table.integer('numberOfVotes').defaultTo(0)
            table.decimal('tmdbVoteAverage', 10, 2).defaultTo(0)
            table.integer('tmdbNumberOfVotes').defaultTo(0)
            table.string('status')
            table.date('releaseDate')
            table.integer('runtimeInMinutes')
            table.string('budget')
            table.decimal('revenue', 16, 2)
            table.string('posterPath')
            table.string('backdropPath')
            table.integer('tmdbId').unique()
            table.string('imdbId').unique()
            table.timestamp('createdAt').defaultTo(knex.fn.now())
            table.timestamp('updatedAt')
        })
    }
    if (!await knex.schema.hasTable('tv_shows')) {
        await knex.schema.createTable('tv_shows', table => {
            table.uuid('id').primary()
            table.uuid('ratingId').references('ratings.id')
            table.string('title').unique()
            table.string('tagline')
            table.string('description', 2000)
            table.decimal('voteAverage', 10, 2).defaultTo(0)
            table.integer('numberOfVotes').defaultTo(0)
            table.decimal('tmdbVoteAverage', 10, 2).defaultTo(0)
            table.integer('tmdbNumberOfVotes').defaultTo(0).defaultTo(0)
            table.string('status')
            table.date('firstAirDate')
            table.date('lastAirDate').nullable()
            table.boolean('inProduction').defaultTo(false)
            table.integer('runtimeInMinutes')
            table.string('posterPath')
            table.string('backdropPath')
            table.integer('tmdbId').unique()
            table.timestamp('createdAt').defaultTo(knex.fn.now())
            table.timestamp('updatedAt')
        })
    }
    if (!await knex.schema.hasTable('tv_seasons')) {
        await knex.schema.createTable('tv_seasons', table => {
            table.uuid('id').primary()
            table.uuid('tvShowId').references('tv_shows.id')
            table.date('airDate')
            table.string('title')
            table.string('description', 2000)
            table.integer('seasonNumber')
            table.string('posterPath')
            table.decimal('voteAverage', 10, 2).defaultTo(0)
            table.integer('numberOfVotes').defaultTo(0)
            table.integer('tmdbId').unique()
            table.timestamp('createdAt').defaultTo(knex.fn.now())
            table.timestamp('updatedAt')
        })
    }
    if (!await knex.schema.hasTable('tv_episodes')) {
        await knex.schema.createTable('tv_episodes', table => {
            table.uuid('id').primary()
            table.uuid('seasonId').references('tv_seasons.id')
            table.date('airDate')
            table.integer('episodeNumber')
            table.string('name')
            table.string('description', 2000)
            table.string('posterPath')
            table.decimal('voteAverage', 10, 2).defaultTo(0)
            table.integer('numberOfVotes').defaultTo(0)
            table.decimal('tmdbVoteAverage', 10, 2).defaultTo(0)
            table.integer('tmdbNumberOfVotes').defaultTo(0)
            table.integer('tmbdId')
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
    if (!await knex.schema.hasTable('tv_shows_languages')) {
        await knex.schema.createTable('tv_shows_languages', table => {
            table.uuid('tvShowId').references('tv_shows.id')
            table.uuid('languageId').references('languages.id')
        })
    }
    if (!await knex.schema.hasTable('movies_genres')) {
        await knex.schema.createTable('movies_genres', table => {
            table.uuid('movieId').references('movies.id')
            table.uuid('genreId').references('movie_genres.id')
        })
    }
    if (!await knex.schema.hasTable('tv_shows_genres')) {
        await knex.schema.createTable('tv_shows_genres', table => {
            table.uuid('tvShowId').references('tv_shows.id')
            table.uuid('genreId').references('tv_show_genres.id')
        })
    }
    if (!await knex.schema.hasTable('actors')) {
        await knex.schema.createTable('actors', table => {
            table.uuid('id').primary()
            table.string('name').unique()
            table.boolean('gender')
            table.string('placeOfBirth')
            table.string('biography')
            table.string('profilePhotoPath')
            table.string('tmdbId').unique()
            table.integer('imdbId').unique()
            table.timestamp('createdAt').defaultTo(knex.fn.now())
            table.timestamp('updatedAt')
        })
    }
    if (!await knex.schema.hasTable('directors')) {
        await knex.schema.createTable('directors', table => {
            table.uuid('id').primary()
            table.string('name').unique()
            table.boolean('gender')
            table.string('placeOfBirth')
            table.string('biography')
            table.string('profilePhotoPath')
            table.string('tmdbId').unique()
            table.integer('imdbId').unique()
            table.timestamp('createdAt').defaultTo(knex.fn.now())
            table.timestamp('updatedAt')
        })
    }
    if (!await knex.schema.hasTable('movies_actors')) {
        await knex.schema.createTable('movies_actors', table => {
            table.uuid('movieId').references('movies.id')
            table.uuid('actorId').references('actors.id')
        })
    }
    if (!await knex.schema.hasTable('movies_directors')) {
        await knex.schema.createTable('movies_directors', table => {
            table.uuid('movieId').references('movies.id')
            table.uuid('directorId').references('directors.id')
        })
    }
    if (!await knex.schema.hasTable('tv_shows_actors')) {
        await knex.schema.createTable('tv_shows_actors', table => {
            table.uuid('tvShowId').references('tv_shows.id')
            table.uuid('actorId').references('actors.id')
        })
    }
    if (!await knex.schema.hasTable('tv_shows_directors')) {
        await knex.schema.createTable('tv_shows_directors', table => {
            table.uuid('tvShowId').references('tv_shows.id')
            table.uuid('directorId').references('directors.id')
        })
    }
    if (!await knex.schema.hasTable('tv_episodes_actors')) {
        await knex.schema.createTable('tv_episodes_actors', table => {
            table.uuid('tvEpisodeId').references('tv_episodes.id')
            table.uuid('actorId').references('actors.id')
        })
    }
    if (!await knex.schema.hasTable('tv_episodes_directors')) {
        await knex.schema.createTable('tv_episodes_directors', table => {
            table.uuid('tvEpisodeId').references('tv_episodes.id')
            table.uuid('directorId').references('directors.id')
        })
    }
    if (!await knex.schema.hasTable('tv_shows_production_companies')) {
        await knex.schema.createTable('tv_shows_production_companies', table => {
            table.uuid('tvShowId').references('tv_shows.id')
            table.uuid('productionCompanyId').references('production_companies.id')
        })
    }
}

export const down = async (knex) => {
    if (await knex.schema.hasTable('tv_shows_production_companies')) {
        await knex.schema.dropTable('tv_shows_production_companies')
    }
    if (await knex.schema.hasTable('tv_episodes_directors')) {
        await knex.schema.dropTable('tv_episodes_directors')
    }
    if (await knex.schema.hasTable('tv_episodes_actors')) {
        await knex.schema.dropTable('tv_episodes_actors')
    }
    if (await knex.schema.hasTable('tv_shows_directors')) {
        await knex.schema.dropTable('tv_shows_directors')
    }
    if (await knex.schema.hasTable('tv_shows_actors')) {
        await knex.schema.dropTable('tv_shows_actors')
    }
    if (await knex.schema.hasTable('movies_directors')) {
        await knex.schema.dropTable('movies_directors')
    }
    if (await knex.schema.hasTable('movies_actors')) {
        await knex.schema.dropTable('movies_actors')
    }
    if (await knex.schema.hasTable('directors')) {
        await knex.schema.dropTable('directors')
    }
    if (await knex.schema.hasTable('actors')) {
        await knex.schema.dropTable('actors')
    }
    if (await knex.schema.hasTable('tv_shows_genres')) {
        await knex.schema.dropTable('tv_shows_genres')
    }
    if (await knex.schema.hasTable('movies_genres')) {
        await knex.schema.dropTable('movies_genres')
    }
    if (await knex.schema.hasTable('tv_shows_languages')) {
        await knex.schema.dropTable('tv_shows_languages')
    }
    if (await knex.schema.hasTable('movies_languages')) {
        await knex.schema.dropTable('movies_languages')
    }
    if (await knex.schema.hasTable('movies_production_companies')) {
        await knex.schema.dropTable('movies_production_companies')
    }
    if (await knex.schema.hasTable('tv_episodes')) {
        await knex.schema.dropTable('tv_episodes')
    }
    if (await knex.schema.hasTable('tv_seasons')) {
        await knex.schema.dropTable('tv_seasons')
    }
    if (await knex.schema.hasTable('tv_shows')) {
        await knex.schema.dropTable('tv_shows')
    }
    if (await knex.schema.hasTable('movies')) {
        await knex.schema.dropTable('movies')
    }
    if (await knex.schema.hasTable('tv_show_genres')) {
        await knex.schema.dropTable('tv_show_genres')
    }
    if (await knex.schema.hasTable('movie_genres')) {
        await knex.schema.dropTable('movie_genres')
    }
    if (await knex.schema.hasTable('production_companies')) {
        await knex.schema.dropTable('production_companies')
    }
    if (await knex.schema.hasTable('ratings')) {
        await knex.schema.dropTable('ratings')
    }
    if (await knex.schema.hasTable('languages')) {
        await knex.schema.dropTable('languages')
    }
    if (await knex.schema.hasTable('countries')) {
        await knex.schema.dropTable('countries')
    }
}
