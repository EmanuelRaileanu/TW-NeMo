const posterBaseUrl = 'https://image.tmdb.org/t/p/original/';
let genres = [], genreIds = []
let languages = [], languageIds = []
const prodComps = ['Animation Picture Company', 'Davis Entertainment', 'DK Entertainment', 'Ghost Horse', 'Goldcrest', 'Goldfinch Studios', 'Good Neighbors Media', 'I Aint Playin Films', 'Mattel Entertainment', 'MISR International Films', 'Movie City Films', 'Pacific Western', 'Paws', 'Rainmaker Entertainment', 'Red Vessel Entertainment', 'Sailor Bear', 'Scared Sheetless', 'Solar Productions', 'Sullivan Bluth Studios', 'United Artists', 'Universal Pictures', 'Zero Trans Fat Productions'];

const API_URL = 'http://stachyon.asuscomm.com:8081'

window.onload = async function () {
    let genreResponse = await fetch('http://stachyon.asuscomm.com:8081/movies/genres')
    if (genreResponse.status !== 200)
        throw new Error("Couldn't load the genres")
    genreResponse = await genreResponse.json()
    for (const el of genreResponse) {
        genres.push(el.name)
        genreIds.push(el.id)
    }
    let langResponse = await fetch('http://stachyon.asuscomm.com:8081/movies/languages')
    if (langResponse.status !== 200)
        throw new Error("Couldn't load the shows")
    langResponse = await langResponse.json()
    for (const el of langResponse) {
        languages.push(el.code)
        languageIds.push(el.id)
    }
    await renderMovies({sorting: 'name'});
    createFiltersMenu();
    document.getElementById("mvSch").addEventListener('keydown', async event => {
        if (event.code === 'Enter' || event.keyCode === 13) {
            await applyFilters();
        }
    });

    addProductionField()

    addGenreField()

    addLanguageField()

    addDirectorField()

    addActorField()


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

async function renderMovies(filters = null) {
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

async function getMovies(filters = null) {
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

function findFilters(checkType, filterNames) {
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
    const filters = {
        genres: findFilters('genres', genres),
        productionCompanies: findFilters('prodComp', prodComps),
        name: document.getElementById("mvSch").value,
        sorting: sorting
    }
    await renderMovies(filters);
}

async function resetFilters() {
    for (let item of document.getElementsByClassName('genres')) {
        item.checked = false;
    }
    for (let item of document.getElementsByClassName('prodComp')) {
        item.checked = false;
    }
    document.getElementById("mvSch").value = '';
    await renderMovies();
}

async function getMovieById(movieId) {
    return (await getMovies()).find(movie => Number(movie.id) === Number(movieId));
}

async function displayMovie(movieId) {
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

function exitMovieView(body) {
    document.getElementById(`movies-body`).style.overflow = 'auto'
    document.getElementById(`${body}`).style.display = 'none'
    const sheet = window.document.styleSheets[0];
    sheet.insertRule(`body > *:not(#${body}) { filter: none; }`, sheet.cssRules.length);

    if (body === 'add-movie-container') {
        let els = document.getElementsByClassName('prodCompField')
        while (els.length > 1) {
            els[1].parentNode.removeChild(els[1])
        }
        els = document.getElementsByClassName('genreField')
        while (els.length > 1) {
            els[1].parentNode.removeChild(els[1])
        }
        els = document.getElementsByClassName('languageField')
        while (els.length > 1) {
            els[1].parentNode.removeChild(els[1])
        }
        els = document.getElementsByClassName('actorField')
        while (els.length > 1) {
            els[1].parentNode.removeChild(els[1])
        }
        els = document.getElementsByClassName('directorField')
        while (els.length > 1) {
            els[1].parentNode.removeChild(els[1])
        }
    }
}


function openAddMovieMenu() {
    document.getElementById('movies-body').style.overflow = 'hidden'
    const sheet = window.document.styleSheets[0]
    sheet.insertRule('body > *:not(#add-movie-container) { filter: blur(8px); }', sheet.cssRules.length)
    sheet.insertRule(`#add-movie-container { overflow-y:scroll; background: linear-gradient(rgba(19, 35, 47, 0.90), rgba(19, 35, 47, 0.90)); }`, sheet.cssRules.length)
    document.getElementById('add-movie-container').style.display = 'block'
}

function addField(fieldName, inputClass, placeholderText, whereToQuery, insertBeforeLocation) {

    let contentPage = document.getElementById('add-movie-content')
    let label = document.createElement('label')
    label.setAttribute('class', fieldName)
    label.innerHTML = `<input class="${inputClass}" type="text" placeholder="${placeholderText}"><br>` +
        `<input class="${inputClass}Id" type="hidden"><br>`
    label.childNodes[0].addEventListener('keydown', async event => {
        if (event.code === 'Enter' || event.keyCode === 13) {
            const inputField = label.childNodes[0].value
            const index = await whereToQuery(inputField)
            console.log(index)
            if (index.length > 0) {
                label.childNodes[0].value = index[0].name
                label.childNodes[0].style.color = "green"
                label.childNodes[1].value = index[0].id
            } else {
                label.childNodes[0].style.color = "red"
            }
        }
    })
    contentPage.insertBefore(label, document.getElementById(insertBeforeLocation))
}

function addGenreField() {
    addField('genreField', 'mvGenre', 'Gives the tone of:', async (name) => {
        const index = genres.indexOf(name)
        if (index >= 0) {
            return Array.of({
                'name': genres[index],
                'id': genreIds[index]
            })
        } else {
            return Array.of()
        }

    }, 'addGenreBtn')
}

function addLanguageField() {
    addField('languageField', 'mvLanguage', 'Understood better in:', async (name) => {
        const index = languages.indexOf(name)
        if (index >= 0) {
            return Array.of({
                'name': languages[index],
                'id': languageIds[index]
            })
        } else {
            return Array.of()
        }
    }, 'addLanguageBtn')
}

function addProductionField() {
    addField('prodCompField', 'mvProdComp', 'Dedicated their hearts:', async (name) => {
        const result = await (await fetch(`${API_URL}/production-companies?searchBy=${name}`)).json()
        return result.results
    }, 'addProdCompBtn')
}

function addActorField() {
    addField('actorField', 'mvActor', 'Deserves rows of applause:', async (name) => {
        const result = await (await fetch(`${API_URL}/actors?searchBy=${name}`)).json()
        return result.results
    }, 'addActorBtn')
}

function addDirectorField() {
    addField('directorField', 'mvDirector', 'The mind which born it all:', async (name) => {
        const result = await (await fetch(`${API_URL}/directors?searchBy=${name}`)).json()
        return result.results
    }, 'addDirectorBtn')
}

async function addMovie() {
    let prodComps = []
    const prodCompIds = document.getElementsByClassName("mvProdCompId")
    for (let el of prodCompIds) {
        if (el.value !== '') {
            prodComps.push(el.value)
        }
    }
    let actors = []
    const actorIds = document.getElementsByClassName("mvActorId")
    for (let el of actorIds) {
        if (el.value !== '') {
            actors.push(el.value)
        }
    }
    let directors = []
    const directorIds = document.getElementsByClassName("mvDirectorId")
    for (let el of directorIds) {
        if (el.value !== '') {
            directors.push(el.value)
        }
    }
    let genres = []
    const genreIds = document.getElementsByClassName("mvGenreId")
    for (let el of genreIds) {
        if (el.value !== '') {
            genres.push(el.value)
        }
    }
    let languages = []
    const languageIds = document.getElementsByClassName("mvLanguageId")
    for (let el of languageIds) {
        if (el.value !== '') {
            languages.push(el.value)
        }
    }
    const data = {
        title: document.getElementById('mvTitle').value,
        tagline: document.getElementById('mvTagline').value,
        releaseDate: document.getElementById('mvReleaseDate').value,
        rating: document.getElementById('mvRating').value,
        status: document.getElementById('mvStatus').value,
        runtime: document.getElementById('mvRuntime').value,
        description: document.getElementById('mvDescription').value,
        productionCompanyIds: prodComps,
        actorIds: actors,
        directorIds: directors,
        genreIds: genres,
        languageIds: languages
    }
    console.log(data)
    const response = await fetch(`${API_URL}/movies`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(data)
    })
    console.log(response.json())
}