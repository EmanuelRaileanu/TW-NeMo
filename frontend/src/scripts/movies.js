const posterBaseUrl = 'https://image.tmdb.org/t/p/original/';
const genres = ['Action', 'Adventure', 'Animation', 'Comedy', 'Documentary', 'Drama', 'Family', 'Fantasy', 'Horror', 'Romance', 'Science Fiction', 'Thriller'];
const prodComps = ['Animation Picture Company', 'Davis Entertainment', 'DK Entertainment', 'Ghost Horse', 'Goldcrest', 'Goldfinch Studios', 'Good Neighbors Media', 'I Aint Playin Films', 'Mattel Entertainment', 'MISR International Films', 'Movie City Films', 'Pacific Western', 'Paws', 'Rainmaker Entertainment', 'Red Vessel Entertainment', 'Sailor Bear', 'Scared Sheetless', 'Solar Productions', 'Sullivan Bluth Studios', 'United Artists', 'Universal Pictures', 'Zero Trans Fat Productions'];

window.onload = async function () {
    await renderMovies();
    createFiltersMenu();
    document.getElementById("mvSch").addEventListener('keydown', async event => {
        if (event.code === 'Enter')
            await applyFilters();
    });
}

function createFiltersMenu() {
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
        if (filters.name !== '') {
            movies = movies.filter(movie => movie.original_title.toLowerCase().includes(filters.name.toLowerCase()));
        }
        if (filters.genres && filters.genres.length) {
            movies = movies.filter(movie => movie.genres.find(genre => filters.genres.includes(genre.name)));
        }
        if (filters.productionCompanies && filters.productionCompanies.length) {
            movies = movies.filter(movie => movie.production_companies.find(productionCompany => filters.productionCompanies.includes(productionCompany.name)));
        }
        if(filters.sorting!==null || document.getElementById('rating').checked){
            if(document.getElementById('rating').checked)
                movies.sort((movie1,movie2) => parseFloat(movie1.vote_average)-parseFloat(movie2.vote_average));
            else
                movies.sort((movie1,movie2) => movie1.original_title>movie2.original_title)
        }
        if(document.getElementById('desc').checked){
            movies.reverse();
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

async function applyFilters(sorting = null) {
    let filters = {name: '', genres: [], productionCompanies: [], sorting:''};
    filters.genres = findFilters('genres', genres);
    filters.productionCompanies = findFilters('prodComp', prodComps);
    filters.name = document.getElementById("mvSch").value;
    filters.sorting=sorting
    await renderMovies(filters);
}

async function resetFilters() {
    for (let item of document.getElementsByClassName('genres')) {
        item.checked = false;
    }
    for (let item of document.getElementsByClassName('prodComp')) {
        item.checked = false;
    }
    movieName = '';
    document.getElementById("mvSch").value = '';
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
