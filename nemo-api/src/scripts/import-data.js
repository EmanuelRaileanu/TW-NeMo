import fs from 'fs'
import csv from 'csv-parser'
import request from '../../../shared-utilities/request.js'
import dotenv from 'dotenv'
import qs from 'querystring'
import cliProgress from 'cli-progress'
import Bookshelf from '../bookshelf.js'
import Movie from '../models/movie.js'
import Rating from '../models/rating.js'
import Actor from '../models/actor.js'
import Director from '../models/director.js'
import TvShow from '../models/tv-show.js'
import TvSeason from '../models/tv-season.js'
import TvEpisode from '../models/tv-episode.js'
import MovieGenre from '../models/movie-genre.js'
import TvShowGenre from '../models/tv-show-genre.js'
import Language from '../models/language.js'
import ProductionCompany from '../models/production-company.js'
import Country from '../models/country.js'

dotenv.config()

const addProductionCompany = async (productionCompany, transaction) => {
    let savedProductionCompany
    try {
        let savedCountry
        if (productionCompany.origin_country) {
            try {
                savedCountry = await new Country({ code: productionCompany.origin_country }).save(null, {
                    method: 'insert',
                    transacting: transaction
                })
            } catch (err) {
                savedCountry = await new Country({ code: productionCompany.origin_country }).fetch({ require: false })
            }
        }
        savedProductionCompany = await new ProductionCompany({
            name: productionCompany.name,
            description: productionCompany.description || null,
            headquarters: productionCompany.headquarters || null,
            logoPath: productionCompany.logo_path || null,
            homepage: productionCompany.homepage || null,
            countryId: savedCountry ? savedCountry.id : null
        }).save(null, {
            method: 'insert',
            transacting: transaction
        })
    } catch {
        savedProductionCompany = await new ProductionCompany({ name: productionCompany.name }).fetch({
            require: false,
            transacting: transaction
        })
    }
    return savedProductionCompany.id
}

const getProductionCompanyIds = async (productionCompanies, transaction) => {
    const productionCompanyIds = []
    await Promise.all(productionCompanies.map(async productionCompany => {
        const savedProductionCompany = await new ProductionCompany({ name: productionCompany.name }).fetch({
            require: false,
            transacting: transaction
        })
        if (savedProductionCompany) {
            productionCompanyIds.push(savedProductionCompany.id)
            return
        }
        let productionCompanyResponse
        try {
            productionCompanyResponse = await request(`${process.env.TMBD_API}/company/${productionCompany.id}?api_key=${process.env.TMDB_API_KEY}`)
            if (!productionCompanyResponse) {
                return
            }
            productionCompanyIds.push(await addProductionCompany(productionCompanyResponse, transaction))
        } catch (err) {
        }
    }))
    return productionCompanyIds
}

const getLanguageIds = async (languages, transaction) => {
    return await Promise.all(languages.map(async language => {
        const existingLanguage = await new Language({ code: language }).fetch({
            require: false,
            transacting: transaction
        })
        if (existingLanguage) {
            return existingLanguage.id
        }
        let newLanguage
        try {
            newLanguage = await new Language({ code: language }).save(null, { transacting: transaction })
        } catch (err) {
            newLanguage = await new Language({ code: language }).fetch({ require: false, transacting: transaction })
        }
        return newLanguage.id
    }))
}

const getMovieGenreIds = async (movieGenres, transaction) => {
    const savedMovieGenres = await new MovieGenre().query(q => {
        q.whereIn('name', movieGenres.map(genre => genre.name))
    }).fetchAll({ require: false, transacting: transaction })
    if (!movieGenres) {
        return []
    }
    return savedMovieGenres.toJSON().map(genre => genre.id)
}

const getTvShowGenreId = async (tvShowGenres, transaction) => {
    const savedTvShowGenres = await new TvShowGenre().query(q => {
        q.whereIn('name', tvShowGenres.map(genre => genre.name))
    }).fetchAll({ require: false, transacting: transaction })
    if (!tvShowGenres) {
        return []
    }
    return savedTvShowGenres.toJSON().map(genre => genre.id)
}

const addDirector = async (director, transaction) => {
    let directorResponse
    try {
        directorResponse = await request(`${process.env.TMBD_API}/person/${director.id}?api_key=${process.env.TMDB_API_KEY}`)
    } catch (err) {
        return
    }
    let savedDirector = await new Director({ name: directorResponse.name }).fetch({
        require: false,
        transacting: transaction
    })
    if (savedDirector) {
        return savedDirector.id
    }
    try {
        savedDirector = await new Director({
            name: directorResponse.name,
            gender: Boolean((directorResponse.gender || 2) - 1),
            birthDate: directorResponse.birthday,
            placeOfBirth: directorResponse.place_of_birth || null,
            biography: directorResponse.biography || null,
            profilePhotoPath: directorResponse.profile_path || null,
            tmdbId: directorResponse.id || null,
            imdbId: directorResponse.imdb_id || null
        }).save(null, { transacting: transaction })
    } catch (err) {
        savedDirector = await new Director({ name: directorResponse.name }).fetch({
            require: false,
            transacting: transaction
        })
    }
    return savedDirector.id
}

const getDirectorIds = async (directors, transaction) => {
    const directorIds = []
    await Promise.all(directors.map(async director => {
        const savedDirector = await new Director({ name: director }).fetch({ require: false, transacting: transaction })
        if (savedDirector) {
            directorIds.push(savedDirector.id)
            return
        }
        let response
        try {
            response = await request(`${process.env.TMBD_API}/search/person?${qs.stringify({
                api_key: process.env.TMDB_API_KEY,
                query: director
            })}`)
            if (!response || !response.results) {
                return
            }
            if (response.results.length) {
                const selectedDirector = response.results.find(fetchedDirector => fetchedDirector.name.toLowerCase() === director.toLowerCase())
                if (selectedDirector) {
                    directorIds.push(await addDirector(selectedDirector, transaction))
                }
            } else {
                directorIds.push(await addDirector({
                    name: director
                }, transaction))
            }
        } catch (err) {
        }
    }))
    return directorIds
}

const addActor = async (actor, transaction) => {
    let actorResponse
    try {
        actorResponse = await request(`${process.env.TMBD_API}/person/${actor.id}?api_key=${process.env.TMDB_API_KEY}`)
    } catch (err) {
        return
    }
    let savedActor = await new Actor({ name: actorResponse.name }).fetch({ require: false, transacting: transaction })
    if (savedActor) {
        return savedActor.id
    }
    try {
        savedActor = await new Actor({
            name: actorResponse.name,
            gender: Boolean((actorResponse.gender || 2) - 1),
            birthDate: actorResponse.birthday,
            placeOfBirth: actorResponse.place_of_birth || null,
            biography: actorResponse.biography || null,
            profilePhotoPath: actorResponse.profile_path || null,
            tmdbId: actorResponse.id || null,
            imdbId: actorResponse.imdb_id || null
        }).save(null, { transacting: transaction })
    } catch (err) {
        savedActor = await new Actor({ name: actorResponse.name }).fetch({ require: false, transacting: transaction })
    }
    return savedActor.id
}

const getActorIds = async (actors, transaction) => {
    const actorIds = []
    await Promise.all(actors.map(async actor => {
        const savedActor = await new Actor({ name: actor }).fetch({ require: false, transacting: transaction })
        if (savedActor) {
            actorIds.push(savedActor.id)
            return
        }
        let response
        try {
            response = await request(`${process.env.TMBD_API}/search/person?${qs.stringify({
                api_key: process.env.TMDB_API_KEY,
                query: actor
            })}`)
            if (!response || !response.results) {
                return
            }
            if (response.results.length) {
                const selectedActor = response.results.find(fetchedActor => fetchedActor.name.toLowerCase() === actor.toLowerCase())
                if (selectedActor) {
                    actorIds.push(await addActor(selectedActor, transaction))
                }
            } else {
                actorIds.push(await addActor({
                    name: actor
                }, transaction))
            }
        } catch (err) {
        }
    }))
    return actorIds
}

const addTvEpisode = async (tvEpisode, seasonId, transaction) => {
    const savedTvEpisode = await new TvEpisode({
        seasonId,
        airDate: tvEpisode.air_date || null,
        episodeNumber: tvEpisode.episode_number,
        name: tvEpisode.name,
        description: tvEpisode.overview,
        posterPath: tvEpisode.still_path,
        tmdbVoteAverage: tvEpisode.vote_average,
        tmdbNumberOfVotes: tvEpisode.vote_count,
        tmdbId: tvEpisode.id
    }).save(null, { method: 'insert', transacting: transaction })
    let actorIds, directorIds
    actorIds = await getActorIds(tvEpisode.guest_stars, transaction)
    directorIds = await getDirectorIds(tvEpisode.crew.filter(crewMember => crewMember.department === 'Directing'), transaction)
    if (actorIds && actorIds.length) {
        await savedTvEpisode.actors().attach(actorIds, { transacting: transaction })
    }
    if (directorIds && directorIds.length) {
        await savedTvEpisode.directors().attach(directorIds, { transacting: transaction })
    }
    return savedTvEpisode.id
}

const addTvSeason = async (tvSeason, tvShowId, transaction) => {
    // Fetch tv season by id from TMDB
    let tvSeasonResponse
    try {
        tvSeasonResponse = await request(`${process.env.TMBD_API}/tv/${tvShowId}/season/${tvSeason.season_number}?api_key=${process.env.TMDB_API_KEY}`)
    } catch (err) {
        try {
            const newTvSeason = await new TvSeason({
                tvShowId,
                airDate: tvSeason.air_date || null,
                title: tvSeason.name,
                description: tvSeason.overview,
                seasonNumber: tvSeason.season_number,
                posterPath: tvSeason.posterPath,
                tmdbId: tvSeason.id
            }).save(null, { method: 'insert', transaction: transaction })
            return newTvSeason.id
        } catch (err) {
            return null
        }
    }
    let existingTvSeason = await new TvSeason({ tvShowId, tmdbId: tvSeasonResponse.id }).fetch({
        require: false,
        transacting: transaction
    })
    if (existingTvSeason) {
        return existingTvSeason.id
    }
    let savedTvSeason
    try {
        savedTvSeason = await new TvSeason({
            tvShowId,
            airDate: tvSeasonResponse.air_date || null,
            title: tvSeasonResponse.name,
            description: tvSeasonResponse.overview,
            seasonNumber: tvSeasonResponse.season_number,
            posterPath: tvSeasonResponse.poster_path,
            tmdbId: tvSeasonResponse.id
        }).save(null, { method: 'insert', transacting: transaction })
    } catch (err) {
        savedTvSeason = await new TvSeason({ tmdbId: tvSeasonResponse.id }).fetch({
            require: false,
            transacting: transaction
        })
    }
    await Promise.all(tvSeasonResponse.episodes.map(async episode => await addTvEpisode(episode, savedTvSeason.id, transaction)))
    return savedTvSeason.id
}

const addTvShow = async (tvShow, rating, directors, actors, transaction = null) => {
    // Fetch tv show by id from TMDB
    let tvShowResponse
    try {
        tvShowResponse = await request(`${process.env.TMBD_API}/tv/${tvShow.id}?api_key=${process.env.TMDB_API_KEY}`)
    } catch (err) {
        return
    }
    let existingRating
    if (rating) {
        try {
            existingRating = await new Rating({ code: rating }).save(null, {
                method: 'insert',
                transacting: transaction
            })
        } catch (err) {
            existingRating = await new Rating({ code: rating }).fetch({ require: false, transacting: transaction })
        }
    }
    let actorIds = null
    if (actors) {
        actorIds = await getActorIds(actors, transaction)
    }
    let directorIds = null
    if (directors) {
        directorIds = await getDirectorIds(directors, transaction)
    }
    if (tvShowResponse) {
        const existingTvShow = await new TvShow({ title: tvShowResponse.name }).fetch({
            require: false,
            transacting: transaction
        })
        if (existingTvShow) {
            return existingTvShow.id
        }
        const savedTvShow = await new TvShow({
            ratingId: existingRating ? existingRating.id : null,
            title: tvShowResponse.name,
            tagline: tvShowResponse.tagline,
            description: tvShowResponse.overview,
            tmdbVoteAverage: tvShowResponse.vote_average,
            tmdbNumberOfVotes: tvShowResponse.vote_count,
            status: tvShowResponse.status,
            firstAirDate: tvShowResponse.first_air_date !== '' ? tvShowResponse.first_air_date : null,
            lastAirDate: tvShowResponse.lastAirDate !== '' ? tvShowResponse.last_air_date : null,
            inProduction: tvShowResponse.in_production,
            runtimeInMinutes: tvShowResponse.episode_run_time.length ? tvShowResponse.episode_run_time[0] : 40,
            posterPath: tvShowResponse.poster_path,
            backdropPath: tvShowResponse.backdrop_path,
            tmdbId: tvShowResponse.id
        }).save(null, { method: 'insert', transacting: transaction })
        if (actorIds && actorIds.length) {
            await savedTvShow.actors().attach(actorIds, { transacting: transaction })
        }
        if (directorIds && directorIds.length) {
            await savedTvShow.directors().attach(directorIds, { transacting: transaction })
        }
        let tvShowGenreIds
        if (tvShowResponse.genres) {
            tvShowGenreIds = await getTvShowGenreId(tvShowResponse.genres, transaction)
        }
        let languageIds
        if (tvShowResponse.languages) {
            languageIds = await getLanguageIds(tvShowResponse.languages, transaction)
        }
        let productionCompanyIds
        if (tvShowResponse.production_companies) {
            productionCompanyIds = await getProductionCompanyIds(tvShowResponse.production_companies, transaction)
        }
        if (tvShowGenreIds && tvShowGenreIds.length) {
            await savedTvShow.genres().attach(tvShowGenreIds, { transacting: transaction })
        }
        if (languageIds && languageIds.length) {
            await savedTvShow.languages().attach(languageIds, { transacting: transaction })
        }
        if (productionCompanyIds && productionCompanyIds.length) {
            await savedTvShow.productionCompanies().attach(productionCompanyIds, { transacting: transaction })
        }
        if (tvShowResponse.seasons.length) {
            await Promise.all(tvShowResponse.seasons.map(async season => await addTvSeason(season, savedTvShow.id, transaction)))
        }
    }
}

const addMovie = async (movie, rating, directors, actors, transaction = null) => {
    // Fetch movie by id from TMDB
    let movieResponse
    try {
        movieResponse = await request(`${process.env.TMBD_API}/movie/${movie.id}?api_key=${process.env.TMDB_API_KEY}`)
    } catch (err) {
        return
    }
    let existingRating
    if (rating) {
        try {
            existingRating = await new Rating({ code: rating }).save(null, {
                method: 'insert',
                transacting: transaction
            })
        } catch (err) {
            existingRating = await new Rating({ code: rating }).fetch({ require: false, transacting: transaction })
        }
    }
    let actorIds
    if (actors) {
        actorIds = await getActorIds(actors, transaction)
    }
    let directorIds
    if (directors) {
        directorIds = await getDirectorIds(directors, transaction)
    }
    if (movieResponse) {
        const existingMovie = await new Movie({ title: movieResponse.title }).fetch({
            require: false,
            transacting: transaction
        })
        if (existingMovie) {
            return
        }
        const savedMovie = await new Movie({
            ratingId: existingRating ? existingRating.id : null,
            title: movieResponse.title,
            tagline: movieResponse.tagline,
            description: movieResponse.overview,
            tmdbVoteAverage: movieResponse.vote_average,
            tmdbNumberOfVotes: movieResponse.vote_count,
            status: movieResponse.status,
            releaseDate: movieResponse.release_date !== '' ? movieResponse.release_date : null,
            runtimeInMinutes: movieResponse.runtime,
            budget: movieResponse.budget,
            revenue: movieResponse.revenue,
            posterPath: movieResponse.poster_path,
            backdropPath: movieResponse.backdrop_path,
            tmdbId: movieResponse.id,
            imdbId: movieResponse.imdb_id !== '' ? movieResponse.imdb_id : null
        }).save(null, { method: 'insert', transacting: transaction })
        if (actorIds && actorIds.length) {
            await savedMovie.actors().attach(actorIds, { transacting: transaction })
        }
        if (directorIds && directorIds.length) {
            await savedMovie.directors().attach(directorIds, { transacting: transaction })
        }
        let movieGenreIds
        if (movieResponse.genres) {
            movieGenreIds = await getMovieGenreIds(movieResponse.genres, transaction)
        }
        let languageIds
        if (movieResponse.spoken_languages) {
            languageIds = await getLanguageIds(movieResponse.spoken_languages.map(language => language.iso_639_1), transaction)
        }
        let productionCompanyIds
        if (movieResponse.production_companies) {
            productionCompanyIds = await getProductionCompanyIds(movieResponse.production_companies, transaction)
        }
        if (movieGenreIds && movieGenreIds.length) {
            await savedMovie.genres().attach(movieGenreIds, { transacting: transaction })
        }
        if (languageIds && languageIds.length) {
            await savedMovie.languages().attach(languageIds, { transacting: transaction })
        }
        if (productionCompanyIds && productionCompanyIds.length) {
            await savedMovie.productionCompanies().attach(productionCompanyIds, { transacting: transaction })
        }
    }
}

const insertItem = async (item, progressBar, transaction = null) => {
    if (item.type === 'Movie') {
        const response = await request(`${process.env.TMBD_API}/search/movie?${qs.stringify({
            api_key: process.env.TMDB_API_KEY,
            query: item.title
        })}`)
        if (!response || !response.results || !response.results.length) {
            progressBar.increment()
            return
        }
        const selectedMovie = response.results.find(movie => item.title.toLowerCase() === movie.title.toLowerCase())
        if (selectedMovie) {
            await addMovie(
                selectedMovie,
                item.rating,
                item.director ? item.director.split(', ') : null,
                item.cast ? item.cast.split(', ') : null,
                transaction
            )
        }
    } else if (item.type === 'TV Show') {
        const response = await request(`${process.env.TMBD_API}/search/tv?${qs.stringify({
            api_key: process.env.TMDB_API_KEY,
            query: item.title
        })}`)
        if (!response || !response.results || !response.results.length) {
            progressBar.increment()
            return
        }
        const selectedTvShow = response.results.find(tvShow => item.title.toLowerCase() === tvShow.name.toLowerCase())
        if (selectedTvShow) {
            await addTvShow(
                selectedTvShow,
                item.rating,
                item.director ? item.director.split(', ') : null,
                item.cast ? item.cast.split(', ') : null,
                transaction
            )
        }
    }
    progressBar.increment()
}

const saveGenres = async (model, genres, transaction) => {
    await Promise.all(genres.map(async genre => await new model({
        name: genre.name,
        tmdbId: genre.id
    }).save(null, { method: 'insert', transacting: transaction })))
}

const fetchAndSaveAllGenres = async (transaction) => {
    // Movie genres
    let movieGenresResponse
    try {
        movieGenresResponse = await request(`${process.env.TMBD_API}/genre/movie/list?api_key=${process.env.TMDB_API_KEY}`)
    } catch (err) {
        return
    }
    if (movieGenresResponse && movieGenresResponse.genres && movieGenresResponse.genres.length) {
        await saveGenres(MovieGenre, movieGenresResponse.genres, transaction)
    }

    // TV Show genres
    let tvShowGenresResponse
    try {
        tvShowGenresResponse = await request(`${process.env.TMBD_API}/genre/tv/list?api_key=${process.env.TMDB_API_KEY}`)
    } catch (err) {
        return
    }
    if (tvShowGenresResponse && tvShowGenresResponse.genres && tvShowGenresResponse.genres.length) {
        await saveGenres(TvShowGenre, tvShowGenresResponse.genres, transaction)
    }
}

const run = () => {
    let results = []
    fs.createReadStream('./src/netflix_titles.csv')
        .pipe(csv())
        .on('data', data => results.push(data))
        .on('end', async () => {
            const progressBar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic)
            progressBar.start(results.length, 0)
            try {
                await Bookshelf.transaction(async t => {
                    await fetchAndSaveAllGenres(t)
                    await Promise.all(results.map(item => insertItem(item, progressBar, t)))
                })
            } catch (err) {
                console.log(err)
            }
            progressBar.stop()
            process.exit(0)
        })
}

run()