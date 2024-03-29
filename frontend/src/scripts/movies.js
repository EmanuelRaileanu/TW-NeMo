const posterBaseUrl = 'https://image.tmdb.org/t/p/original/';
const alternativeImageUrl = 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Question_mark_%28black%29.svg/768px-Question_mark_%28black%29.svg.png'
let genres = [], genreIds = []
let languages = [], languageIds = []
let ratings = [], ratingIds = []
const prodComps = ['Animation Picture Company', 'Davis Entertainment', 'DK Entertainment', 'Ghost Horse', 'Goldcrest', 'Goldfinch Studios', 'Good Neighbors Media', 'I Aint Playin Films', 'Mattel Entertainment', 'MISR International Films', 'Movie City Films', 'Pacific Western', 'Paws', 'Rainmaker Entertainment', 'Red Vessel Entertainment', 'Sailor Bear', 'Scared Sheetless', 'Solar Productions', 'Sullivan Bluth Studios', 'United Artists', 'Universal Pictures', 'Zero Trans Fat Productions'];
const AUTH_SERVICE_URL = 'http://stachyon.asuscomm.com:8000'
const API_URL = 'http://stachyon.asuscomm.com:8081'

let pagination, pageCount, pageSize, maxPageSize

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
    let ratingResponse = await fetch(`${API_URL}/movies/ratings`)
    if (ratingResponse.status !== 200)
        throw new Error("Couldn't load the ratings")
    ratingResponse = await ratingResponse.json()
    for (const el of ratingResponse) {
        ratings.push(el.code)
        ratingIds.push(el.id)
    }
    pagination = 1
    const pageNumber = document.getElementById('currentPage')
    pageNumber.addEventListener('keydown', async event => {
        if (event.code === 'Enter' || event.keyCode === 13) {
            pagination = pageNumber.value
            await renderMovies()
        }
    })
    pageNumber.value = pagination


    pageSize = 20
    const pageSizeInput = document.getElementById('pageSize')
    pageSizeInput.addEventListener('keydown', async event => {
        if (event.code === 'Enter' || event.keyCode === 13) {
            pageSize = pageSizeInput.value
            pagination = 1
            pageNumber.value = pagination
            await renderMovies()
        }
    })
    pageSizeInput.value = pageSize;
    await renderMovies();
    createFiltersMenu();
    document.getElementById("mvSch").addEventListener('keydown', async event => {
        if (event.code === 'Enter' || event.keyCode === 13) {
            await applyFilters();
        }
    })
    if(localStorage.getItem("username")){
        const userDetails = await (await fetch(`${AUTH_SERVICE_URL}/users/${localStorage.getItem("username")}`)).json()
        if (['Owner', 'Admin'].includes(userDetails.role.name)) {
            const button = document.createElement('button')
            button.setAttribute('class', 'addMovie')
            button.setAttribute('onclick', 'openAddMovieMenu()')
            button.innerText = 'Add movie'
            document.getElementsByClassName('topnav')[0].append(button)
        }
    }

    const ratingBtn = document.getElementById('mvRating')
    ratingBtn.addEventListener('keydown', async event => {
        if (event.code === 'Enter' || event.keyCode === 13) {
            const inputField = ratingBtn.value
            const index = ratings.indexOf(inputField)
            if (index >= 0) {
                ratingBtn.style.color = "green"
            } else {
                ratingBtn.style.color = "red"
            }
        }
    })

    addProductionField()

    addGenreField()

    addLanguageField()

    addDirectorField()

    addActorField()


}

async function prevPage () {
    if (pagination === 1)
        return;
    pagination--
    await renderMovies()
    const pageNumber = document.getElementById('currentPage')
    pageNumber.value = pagination
}

async function nextPage () {
    if (pagination === pageCount)
        return;
    pagination++
    await renderMovies()
    const pageNumber = document.getElementById('currentPage')
    pageNumber.value = pagination
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
            <li id="${movies[i].id}|${Number(movies[i].isFavorite)}" onclick="displayMovie(this.id)">
                <img src="${posterBaseUrl}/${movies[i].posterPath}" alt="">
                <div class="written-content">
                    <h1>${movies[i].title}</h1>
                    <span>${movies[i].description}</span>
                </div>
                <div class="vertical-info">
                    <span>Score: ${movies[i].voteAverage || movies[i].tmdbVoteAverage}</span>
                </div>
                ${localStorage.getItem('token') ? (movies[i].isFavorite ? '<h1>❤</h1>' : '') : ``}
            </li>`
    }
}

async function getMovies (filters = null) {
    let url = `${API_URL}/movies?pageSize=${pageSize}&page=${pagination}`
    if (filters && filters !== {}) {
        if (filters.title) {
            url += `&searchBy=${filters.title}`
        }
        if (filters.genres && filters.genres.length) {
            for (const genre of filters.genres) {
                url += `&filters[genres]=${genre}`
            }
        }
        if (filters.productionCompanies && filters.productionCompanies.length) {
            for (const productionCompany of filters.productionCompanies) {
                url += `&filters[productionCompanies]=${productionCompany}`
            }
        }
        if (filters.sorting) {
            url += `&orderBy[column]=${filters.sorting}`
        }
    }
    if (document.getElementById('desc').checked) {
        url += '&orderBy[direction]=DESC'
    }
    const response = await fetch(url)
    if (response.status !== 200) {
        return []
    }
    const responseJSON = await response.json()
    pageCount = responseJSON.pageCount
    let favoriteMovieIds
    const token = localStorage.getItem('token')
    if (token) {
        const response = await fetch(`${API_URL}/movies/favorites`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        if (response.status === 200) {
            favoriteMovieIds = (await response.json()).map(movie => movie.id)
        }
    }
    if (favoriteMovieIds) {
        return responseJSON.results.map(movie => {
            movie.isFavorite = favoriteMovieIds.includes(movie.id)
            return movie
        })
    }
    return responseJSON.results
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
    if (!sorting) {
        const sortValue = document.getElementById('name')
        if (sortValue.checked) {
            sorting = 'title'
        } else {
            sorting = 'tmdbVoteAverage'
        }
    }
    pagination = 1
    const pageNumber = document.getElementById('currentPage')
    pageNumber.value = pagination
    const filters = {
        genres: findFilters('genres', genres),
        productionCompanies: findFilters('prodComp', prodComps),
        title: document.getElementById("mvSch").value,
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
    return (await (await fetch(`${API_URL}/movies/${movieId}`)).json());
}

async function displayMovie (id) {
    const [movieId, isFavorite] = id.split('|')
    const movie = await getMovieById(movieId);
    sessionStorage.setItem('movieId', movieId)
    document.getElementById('movies-body').style.overflow = 'hidden';
    const sheet = window.document.styleSheets[0];
    sheet.insertRule('body > *:not(#movie-container) { filter: blur(8px); }', sheet.cssRules.length);
    sheet.insertRule(`#movie-container { background: linear-gradient(rgba(19, 35, 47, 0.90), rgba(19, 35, 47, 0.90)), url('${posterBaseUrl}/${movie.backdropPath}') no-repeat center fixed; }`, sheet.cssRules.length);
    document.getElementById('movie-container').style.display = 'block';
    document.getElementById('poster').innerHTML = `<img src="${posterBaseUrl}/${movie.posterPath}" alt="">`;
    document.getElementById('title').innerHTML = `<h1>${movie.title}</h1>`;
    document.getElementById('tagline').innerHTML = `<h4>${movie.tagline}</h4>`;
    const favoriteButton = document.getElementById('favorite')
    favoriteButton.style.display = 'none'
    if (localStorage.getItem('token')) {
        favoriteButton.style.display = 'flex'
        if (Number(isFavorite)) {
            favoriteButton.innerText = '❤'
        } else {
            favoriteButton.innerText = '♡'
        }
    }
    const genreList = document.getElementById('genre-list');
    genreList.innerHTML = '';
    for (const genre of movie.genres) {
        genreList.innerHTML += `<li><span>${genre.name}</span></li>`;
    }
    if (movie.actors.length) {
        const actorsList = document.getElementById('actors-list')
        actorsList.innerHTML = '';
        for (const actor of movie.actors) {
            actorsList.innerHTML += `
                <li>
                    <img src="${actor.profilePhotoPath ? `${posterBaseUrl}${actor.profilePhotoPath}` : alternativeImageUrl}" alt="">
                    <p>${actor.name}</p>
                </li>
            `
        }
    }
    if (movie.directors.length) {
        const directorsList = document.getElementById('directors-list')
        directorsList.innerHTML = '';
        for (const director of movie.directors) {
            directorsList.innerHTML += `
                <li>
                    <img src="${director.profilePhotoPath ? `${posterBaseUrl}${director.profilePhotoPath}` : alternativeImageUrl}" alt="">
                    <p>${director.name}</p>
                </li>
            `
        }
    }
    if (movie.productionCompanies.length) {
        const productionCompaniesList = document.getElementById('production-companies-list');
        productionCompaniesList.innerHTML = '';
        for (const productionCompany of movie.productionCompanies) {
            productionCompaniesList.innerHTML += `
            <li>
                <h6>${productionCompany.name} ${productionCompany.country ? productionCompany.country.code : ''}</h6>
                <img src="${productionCompany.logoPath ? `${posterBaseUrl}${productionCompany.logoPath}` : ''}" alt="">
            </li>
        `;
        }
    }
    if (movie.reviews.length) {
        const reviewsList = document.getElementById('reviews-list')
        reviewsList.innerHTML = ''
        for (const review of movie.reviews) {
            reviewsList.innerHTML += `
                <li id="${review.id}">
                    <h6>${review.score}</h6>
                    <textarea>${review.text}</textarea>
                </li>
            `
        }
    }
    document.getElementById('lang').innerHTML = `<strong>${movie.languages.length ? movie.languages.map(l => l.code).join(', ') : ''}</strong>`;
    document.getElementById('rated').innerHTML = `<strong>${movie.ratingId ? movie.rating.code : ''}</strong>`
    document.getElementById('release').innerText = movie.releaseDate ? movie.releaseDate.split('T')[0] : '';
    document.getElementById('rating').innerText = `Score: ${movie.voteAverage || movie.tmdbVoteAverage}`;
    document.getElementById('runtime').innerText = `${movie.runtimeInMinutes} min`;
    document.getElementById('description').innerHTML = `<p>${movie.description}</p>`;
}

function exitMovieView (body) {
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


function openAddMovieMenu () {
    document.getElementById('movies-body').style.overflow = 'hidden'
    const sheet = window.document.styleSheets[0]
    sheet.insertRule('body > *:not(#add-movie-container) { filter: blur(8px); }', sheet.cssRules.length)
    sheet.insertRule(`#add-movie-container { overflow-y:scroll; background: linear-gradient(rgba(19, 35, 47, 0.90), rgba(19, 35, 47, 0.90)); }`, sheet.cssRules.length)
    document.getElementById('add-movie-container').style.display = 'block'
}

function addField (fieldName, inputClass, placeholderText, whereToQuery, insertBeforeLocation) {

    let contentPage = document.getElementById('add-movie-content')
    let label = document.createElement('label')
    label.setAttribute('class', fieldName)
    label.innerHTML = `<input class="${inputClass}" type="text" placeholder="${placeholderText}"><br>` +
        `<input class="${inputClass}Id" type="hidden"><br>`
    label.childNodes[0].addEventListener('keydown', async event => {
        if (event.code === 'Enter' || event.keyCode === 13) {
            const inputField = label.childNodes[0].value
            const index = await whereToQuery(inputField)
            if (index.length > 0) {
                label.childNodes[0].value = index[0].name
                label.childNodes[0].style.color = "green"
                label.childNodes[2].value = index[0].id
            } else {
                label.childNodes[0].style.color = "red"
            }
        }
    })
    contentPage.insertBefore(label, document.getElementById(insertBeforeLocation))
}


function addGenreField () {
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

function addLanguageField () {
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

function addProductionField () {
    addField('prodCompField', 'mvProdComp', 'Dedicated their hearts:', async (name) => {
        const result = await (await fetch(`${API_URL}/production-companies?searchBy=${name}`)).json()
        return result.results
    }, 'addProdCompBtn')
}

function addActorField () {
    addField('actorField', 'mvActor', 'Deserves rows of applause:', async (name) => {
        const result = await (await fetch(`${API_URL}/actors?searchBy=${name}`)).json()
        return result.results
    }, 'addActorBtn')
}

function addDirectorField () {
    addField('directorField', 'mvDirector', 'The mind which born it all:', async (name) => {
        const result = await (await fetch(`${API_URL}/directors?searchBy=${name}`)).json()
        return result.results
    }, 'addDirectorBtn')
}

async function addMovie () {
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
        ratingId: ratingIds[ratings.indexOf(document.getElementById('mvRating').value)],
        status: document.getElementById('mvStatus').value,
        runtime: document.getElementById('mvRuntime').value,
        description: document.getElementById('mvDescription').value,
        productionCompanyIds: prodComps,
        actorIds: actors,
        directorIds: directors,
        genreIds: genres,
        languageIds: languages
    }
    const response = await (await fetch(`${API_URL}/movies`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(data)
    })).json()
    if (response.id) {
        const window = document.getElementById('add-movie-content')
        window.innerHTML = '<h1>Movie successfully added</h1>'
    } else {
        const window = document.getElementById('add-movie-content')
        window.innerHTML = `<h1>${response.message}</h1>`
    }

}

async function changeFavoriteState (buttonId) {
    const movieId = sessionStorage.getItem('movieId')
    if (movieId) {
        const button = document.getElementById(buttonId)
        const token = localStorage.getItem('token')
        if (button.innerText === '♡') {
            const response = await fetch(`${API_URL}/movies/${movieId}/add-favorite`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            if (response.status === 200) {
                button.innerText = '❤'
            }
        } else {
            const response = await fetch(`${API_URL}/movies/${movieId}/delete-favorite`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            if (response.status === 200) {
                button.innerText = '♡'
            }
        }
    }
}