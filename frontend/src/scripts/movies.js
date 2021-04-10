const posterBaseUrl = 'https://image.tmdb.org/t/p/original/'

async function renderMovies (filters = null) {
    document.getElementById('list').innerHTML = '';
    const movies = await getMovies(filters)
    for (let i = 0; i < movies.length; i++) {
        document.getElementById('list').innerHTML += `
            <li id="${movies[i].id}" onclick="displayMovie(this.id)">
                <img src="${posterBaseUrl}/${movies[i].poster_path}" alt="Image not found">
                <div class="written-content">
                    <h1>${movies[i].original_title}</h1>
                    <span>${movies[i].overview}</span>
                </div>
                <div class="vertical-info">
                    <span>Rating: ${movies[i].vote_average}</span>
                </div>
            </li>`
    }
}

async function getMovies (filters = null) {
    let movies = (await (await fetch('../movies.json')).json()).results;
    if (filters && filters !== {}) {
        if (filters.genres && filters.genres.length) {
            movies = movies.filter(movie => movie.genres.find(genre => filters.genres.includes(genre.name)));
            console.log(movies);
        }
        if (filters.productionCompanies && filters.productionCompanies.length) {
            movies = movies.filter(movie => movie.production_companies.find(productionCompany => filters.productionCompanies.includes(productionCompany.name)));
        }
    }
    return movies;
}

function findFilters (checkType, filterNames) {
    let filters = [];
    let inputElements = document.getElementsByClassName(checkType);
    for (let i = 0; inputElements[i]; ++i) {
        if (inputElements[i].checked) {
            filters.push(filterNames[i]);
        }
    }
    return filters;
}

async function applyFilters () {
    const genres = ['Drama', 'Romance'];
    const prodComps = ['United Artists']
    let filters = { genres: [], productionCompanies: [] };
    filters.genres = findFilters('genres', genres);
    filters.productionCompanies = findFilters('prodComp', prodComps);
    await renderMovies(filters);
}

async function resetFilters () {
    for (let item of document.getElementsByClassName('genres')) {
        item.checked = false;
    }
    for (let item of document.getElementsByClassName('prodComp')) {
        item.checked = false;
    }
    await renderMovies();
}


async function searchMovie () {
    let name = document.getElementById("mvSch").value;
    console.log(name);
}

async function getMovieById (movieId) {
    return (await getMovies()).find(movie => Number(movie.id) === Number(movieId));
}

async function displayMovie (movieId) {
    const movie = await getMovieById(movieId);
    document.getElementById('movies-body').style.overflow = 'hidden';
    // document.querySelector('body > *:not(#movie-container)').style.filter = 'blur(8px)';
    const sheet = window.document.styleSheets[0];
    sheet.insertRule('body > *:not(#movie-container) { filter: blur(8px); }', sheet.cssRules.length);
    sheet.insertRule(`#movie-container { background: linear-gradient(rgba(19, 35, 47, 0.90), rgba(19, 35, 47, 0.90)), url('${posterBaseUrl}/${movie.backdrop_path}') }`, sheet.cssRules.length);
    document.getElementById('movie-container').style.display = 'block';
    document.getElementById('poster').innerHTML = `<img src="${posterBaseUrl}/${movie.poster_path}" alt="Image not found">`;
    document.getElementById('title').innerHTML = `<h1>${movie.title}</h1>`;
    document.getElementById('rating').innerText = `Rating: ${movie.vote_average}`
    document.getElementById('description').innerText = movie.overview;
}

function exitMovieView () {
    document.getElementById('movies-body').style.overflow = 'auto';
    document.getElementById('movie-container').style.display = 'none';
    const sheet = window.document.styleSheets[0];
    sheet.insertRule('body > *:not(#movie-container) { filter: none; }', sheet.cssRules.length);
}
