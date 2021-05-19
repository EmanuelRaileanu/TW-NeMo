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

dotenv.config()

const addDirector = async (director, transaction) => {
    let directorResponse
    try {
        directorResponse = await request(`${process.env.TMBD_API}/person/${director.id}?api_key=${process.env.TMDB_API_KEY}`)
    } catch (err) {
        return
    }
    let savedDirector
    try {
        savedDirector = await new Actor({
            name: directorResponse.name,
            gender: Boolean((directorResponse.gender || 2) - 1),
            placeOfBirth: directorResponse.place_of_birth || null,
            biography: directorResponse.biography || null,
            profilePhotoPath: directorResponse.profile_path || null,
            tmdbId: directorResponse.id || null,
            imdbId: directorResponse.imdb_id || null
        }).save(null, { transacting: transaction })
    } catch (err) {
        savedDirector = await new Actor({ name: directorResponse.name }).fetch({
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
                const selectedDirector = response.results.find(fetchedActor => fetchedActor.name.toLowerCase() === director.toLowerCase())
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
    let savedActor
    try {
        savedActor = await new Actor({
            name: actorResponse.name,
            gender: Boolean((actorResponse.gender || 2) - 1),
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

const addTvSeason = async (tvSeason, tvShowId, transaction) => {
    // Fetch tv season by id from TMDB
    let tvSeasonResponse
    try {
        tvSeasonResponse = await request(`${process.env.TMBD_API}/tv/${tvShowId}/season/${tvSeason.season_number}?api_key=${process.env.TMDB_API_KEY}`)
    } catch (err) {
        console.log(err)
        return
    }
    const savedTvSeason = await new TvSeason({
        tvShowId,
        airDate: tvSeasonResponse.air_date,
        title: tvSeasonResponse.name,
        description: tvSeasonResponse.overview,
        seasonNumber: tvSeasonResponse.season_number,
        posterPath: tvSeasonResponse.poster_path,
        tmdbId: tvSeasonResponse.id
    }).save(null, { method: 'insert', transacting: transaction })
}

const addTvShow = async (tvShow, rating, directors, actors, transaction = null) => {
    // Fetch tv show by id from TMDB
    let tvShowResponse
    try {
        tvShowResponse = await request(`${process.env.TMBD_API}/tv/${tvShow.id}?api_key=${process.env.TMDB_API_KEY}`)
    } catch (err) {
        console.log(err)
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
        const existingTvShow = await new Movie({ title: tvShowResponse.title }).fetch({
            require: false,
            transacting: transaction
        })
        if (existingTvShow) {
            return
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
        console.log(err)
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