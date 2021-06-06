const posterBaseUrl = 'https://image.tmdb.org/t/p/original/';
const genres = ['Action', 'Adventure', 'Animation', 'Comedy', 'Documentary', 'Drama', 'Family', 'Fantasy', 'Horror', 'Romance', 'Science Fiction', 'Thriller'];
const prodComps = ['Animation Picture Company', 'Davis Entertainment', 'DK Entertainment', 'Ghost Horse', 'Goldcrest', 'Goldfinch Studios', 'Good Neighbors Media', 'I Aint Playin Films', 'Mattel Entertainment', 'MISR International Films', 'Movie City Films', 'Pacific Western', 'Paws', 'Rainmaker Entertainment', 'Red Vessel Entertainment', 'Sailor Bear', 'Scared Sheetless', 'Solar Productions', 'Sullivan Bluth Studios', 'United Artists', 'Universal Pictures', 'Zero Trans Fat Productions'];

const API_URL = 'http://stachyon.asuscomm.com:8081'

window.onload = async function () {
    await renderMovies({ sorting: 'name' });
    createFiltersMenu();
    document.getElementById("mvSch").addEventListener('keydown', async event => {
        if (event.code === 'Enter' || event.keyCode === 13) {
            await applyFilters();
        }
    });
}

function createFiltersMenu () {
    let menu = document.getElementById('filters');
    menu.innerHTML += '<li>Genres:</li>';
    for (let item of genres) {
        menu.innerHTML += `<li><input class="genres" type="checkbox"/>${item}</li>`;
    }
    menu.innerHTML += '<li>Production Companies:</li>';
    for (let item of prodComps) {
        menu.innerHTML += `<li><input class="prodComp" type="checkbox"/>${item}</li>`;
    }
    menu.innerHTML += '<li><button onclick="resetFilters()">Reset Filters</button></li>';
    menu.innerHTML += '<li><button onclick="applyFilters()">Apply filters</button></li>'
}

async function renderMovies (filters = null) {
    document.getElementById('list').innerHTML = '';
    const movies = await getMovies(filters)
    for (let i = 0; i < movies.length; i++) {
        document.getElementById('list').innerHTML += `
            <li id="${movies[i].id}" onclick="displayMovie(this.id)">
                <img src="${posterBaseUrl}/${movies[i].posterPath}" alt="Image not found">
                <div class="written-content">
                    <h1>${movies[i].title}</h1>
                    <span>${movies[i].description}</span>
                </div>
                <div class="vertical-info">
                    <span>Rating: ${movies[i].voteAverage}</span>
                </div>
            </li>`
    }
}

async function getMovies (filters = null) {
    let movies = (await (await fetch(`${API_URL}/movies`)).json()).results;
    if (filters && filters !== {}) {
        if (filters.name) {
            movies = movies.filter(movie => movie.title.toLowerCase().includes(filters.name.toLowerCase()));
        }
        if (filters.genres && filters.genres.length) {
            movies = movies.filter(movie => movie.genres.find(genre => filters.genres.includes(genre.name)));
        }
        if (filters.productionCompanies && filters.productionCompanies.length) {
            movies = movies.filter(movie => movie.productionCompanies.find(productionCompany => filters.productionCompanies.includes(productionCompany.name)));
        }
        if (filters.sorting !== null || document.getElementById('rat').checked) {
            if (document.getElementById('rat').checked)
                movies.sort((movie1, movie2) => Number(movie1.voteAverage) - Number(movie2.voteAverage));
            else
                movies.sort((movie1, movie2) => movie1.title.localeCompare(movie2.title))
        }
    }
    if (document.getElementById('desc').checked) {
        movies.reverse();
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

async function applyFilters (sorting = null) {
    const filters = {
        genres: findFilters('genres', genres),
        productionCompanies: findFilters('prodComp', prodComps),
        name: document.getElementById("mvSch").value,
        sorting: sorting
    }
    await renderMovies(filters);
}

async function resetFilters () {
    for (let item of document.getElementsByClassName('genres')) {
        item.checked = false;
    }
    for (let item of document.getElementsByClassName('prodComp')) {
        item.checked = false;
    }
    document.getElementById("mvSch").value = '';
    await renderMovies();
}

async function getMovieById (movieId) {
    return (await getMovies()).find(movie => Number(movie.id) === Number(movieId));
}

async function displayMovie (movieId) {
    const movie = await getMovieById(movieId);
    document.getElementById('movies-body').style.overflow = 'hidden';
    const sheet = window.document.styleSheets[0];
    sheet.insertRule('body > *:not(#movie-container) { filter: blur(8px); }', sheet.cssRules.length);
    sheet.insertRule(`#movie-container { background: linear-gradient(rgba(19, 35, 47, 0.90), rgba(19, 35, 47, 0.90)), url('${posterBaseUrl}/${movie.backdrop_path}') no-repeat center fixed; }`, sheet.cssRules.length);
    document.getElementById('movie-container').style.display = 'block';
    document.getElementById('poster').innerHTML = `<img src="${posterBaseUrl}/${movie.poster_path}" alt="Image not found">`;
    document.getElementById('title').innerHTML = `<h1>${movie.title}</h1>`;
    document.getElementById('tagline').innerHTML = `<h4>${movie.tagline}</h4>`;
    const genreList = document.getElementById('genre-list');
    genreList.innerHTML = '';
    for (const genre of movie.genres) {
        genreList.innerHTML += `<li><span>${genre.name}</span></li>`;
    }
    const productionCompaniesList = document.getElementById('production-companies-list');
    productionCompaniesList.innerHTML = '';
    for (const productionCompany of movie.production_companies) {
        productionCompaniesList.innerHTML += `
            <li>
                <h6>${productionCompany.name} ${productionCompany.origin_country}</h6>
                <img src="${productionCompany.logo_path ? `${posterBaseUrl}/${productionCompany.logo_path}` : ''}" alt="">
            </li>
        `;
    }
    document.getElementById('lang').innerHTML = `<strong>${movie.original_language}</strong>`;
    document.getElementById('release').innerText = movie.release_date;
    document.getElementById('rating').innerText = `Rating: ${movie.vote_average}`;
    document.getElementById('runtime').innerText = `${movie.runtime} min`;
    document.getElementById('description').innerHTML = `<p>${movie.overview}</p>`;
}

function exitMovieView () {
    document.getElementById('movies-body').style.overflow = 'auto';
    document.getElementById('movie-container').style.display = 'none';
    const sheet = window.document.styleSheets[0];
    sheet.insertRule('body > *:not(#movie-container) { filter: none; }', sheet.cssRules.length);
}
