const posterBaseUrl = 'https://image.tmdb.org/t/p/original/'
const alternativeImageUrl = 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Question_mark_%28black%29.svg/768px-Question_mark_%28black%29.svg.png'
let genres = [], genreIds = []
let languages = [], languageIds = []
let ratings = [], ratingIds = []
const prodComps = ['20th Century Fox Television', '20th Television', 'Anonymous Content', 'BBC Studios', 'Berlanti Productions', 'Bonanza Productions', 'Bunim-Murray Productions (BMP)', 'Carter Bays', 'Caryn Mandabach Productions', 'DC Entertainment', 'Mad Ghost Productions', 'Michael Landon Productions', 'National Broadcasting Company', 'NBCUniversal', 'Nickelodeon Animation Studio', 'Paramount Television Studios', 'Primrose Hill Productions', 'Screen Yorkshire', 'Tiger Aspect Productions', 'Warner Bros. Television'];
const AUTH_SERVICE_URL = 'http://stachyon.asuscomm.com:8000'
const API_URL = 'http://stachyon.asuscomm.com:8081'
let pagination,pageCount,pageSize,maxPageSize


window.onload = async function () {
    let genreResponse = await fetch(`${API_URL}/shows/genres`)
    if (genreResponse.status !== 200)
        throw new Error("Couldn't load the genres")
    genreResponse = await genreResponse.json()
    for (const el of genreResponse) {
        genres.push(el.name)
        genreIds.push(el.id)
    }
    let langResponse = await fetch(`${API_URL}/movies/languages`)
    if (langResponse.status !== 200)
        throw new Error("Couldn't load the languages")
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
    await renderShows();
    createFiltersMenu();
    document.getElementById("shSch").addEventListener('keydown', async event => {
        if (event.code === 'Enter' || event.keyCode === 13)
            await applyFilters();
    })
    const ratingButton = document.getElementById("mvRating")
    ratingButton.addEventListener('keydown', async event => {
        if (event.code === 'Enter' || event.keyCode === 13) {
            const index = ratings.indexOf(document.getElementById("mvRating").value)
            if (index >= 0) {
                ratingButton.value = ratings[index]
                ratingButton.style.color = "green"
                document.getElementById('mvRatingId').value = ratingIds[index]
            } else {
                ratingButton.style.color = "red"
            }
        }
    })
    const userDetails = await (await fetch(`${AUTH_SERVICE_URL}/users/${localStorage.getItem("username")}`)).json()
    if (['Owner', 'Admin'].includes(userDetails.role.name)) {
        //    <button class="addMovie" onclick="openAddShowMenu()">Add Show</button>
        const button=document.createElement('button')
        button.setAttribute('class','addMovie')
        button.setAttribute('onclick','openAddShowMenu()')
        button.innerText='Add show'
        document.getElementsByClassName('topnav')[0].append(button)
    }


    sessionStorage.setItem("nrOfSeasons", "1")

    pagination=1
    const pageNumber=document.getElementById('currentPage')
    pageNumber.addEventListener('keydown', async event => {
        if (event.code === 'Enter' || event.keyCode === 13) {
            pagination=pageNumber.value
            await renderMovies()
        }
    })
    pageNumber.value=pagination

    pageSize=20
    const pageSizeInput=document.getElementById('pageSize')
    pageSizeInput.addEventListener('keydown', async event => {
        if (event.code === 'Enter' || event.keyCode === 13) {
            pageSize=pageSizeInput.value
            pagination=1
            pageNumber.value=pagination
            await renderShows()
        }
    })
    pageSizeInput.value=pageSize;


    addProdCompField()

    addGenreField()

    addLanguageField()

    addDirectorField()

    addActorField()

    addSeasonFields()

}

async function prevPage(){
    if(pagination===1)
        return;
    pagination--
    await renderShows()
    const pageNumber=document.getElementById('currentPage')
    pageNumber.value=pagination
}

async function nextPage(){
    if(pagination===pageCount)
        return;
    pagination++
    await renderShows()
    const pageNumber=document.getElementById('currentPage')
    pageNumber.value=pagination
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

async function renderShows (filters = null) {
    document.getElementById('list').innerHTML = '';
    const tvShows = await getShows(filters);
    for (let i = 0; i < tvShows.length; i++) {
        document.getElementById('list').innerHTML += `
            <li id="${tvShows[i].id}" onclick="displayShow(this.id)">
                <img src="${posterBaseUrl}/${tvShows[i].posterPath}" alt="">
                <div class="written-content">
                    <h1>${tvShows[i].title}</h1>
                    <span>${tvShows[i].description}</span>
                </div>
                <div class="vertical-info">
                    <span>Rating: ${tvShows[i].tmdbVoteAverage}</span>
                </div>
            </li>`
    }
}

async function getShows (filters = null) {
    let url = `${API_URL}/shows?pageSize=${pageSize}&page=${pagination}`
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
        url += '&orderBy[direction]=desc'
    }
    const response = await fetch(url)
    if (response.status !== 200) {
        return []
    }
    return (await response.json()).results
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
    pagination=1
    const pageNumber=document.getElementById('currentPage')
    pageNumber.value=pagination
    const filters = {
        genres: findFilters('genres', genres),
        productionCompanies: findFilters('prodComp', prodComps),
        title: document.getElementById("shSch").value,
        sorting: document.getElementById('rat').checked ? sorting : 'title'
    }
    await renderShows(filters);
}

async function resetFilters () {
    for (let item of document.getElementsByClassName('genres')) {
        item.checked = false;
    }
    for (let item of document.getElementsByClassName('prodComp')) {
        item.checked = false;
    }
    document.getElementById("shSch").value = '';
    await renderShows();
}

async function getShowById (showId) {
    return (await (await fetch(`${API_URL}/shows/${showId}`)).json());
}

async function displayShow (showId) {
    const show = await getShowById(showId);
    document.getElementById('movies-body').style.overflow = 'hidden';
    const sheet = window.document.styleSheets[0];
    sheet.insertRule('body > *:not(#movie-container) { filter: blur(8px); }', sheet.cssRules.length);
    sheet.insertRule(`#movie-container { background: linear-gradient(rgba(19, 35, 47, 0.90), rgba(19, 35, 47, 0.90)), url('${posterBaseUrl}/${show.backdropPath}') no-repeat center fixed; }`, sheet.cssRules.length);
    document.getElementById('movie-container').style.display = 'block';
    document.getElementById('poster').innerHTML = `<img src="${posterBaseUrl}/${show.posterPath}" alt="">`;
    document.getElementById('title').innerHTML = `<h1>${show.title}</h1>`;
    document.getElementById('tagline').innerHTML = `<h4>${show.tagline}</h4>`;
    const genreList = document.getElementById('genre-list');
    genreList.innerHTML = ''
    for (const genre of show.genres) {
        genreList.innerHTML += `<li><span>${genre.name}</span></li>`;
    }
    const seasonsList = document.getElementById('seasons-list')
    seasonsList.innerHTML = ''
    for (const season of show.seasons) {
        seasonsList.innerHTML += `
            <li id="${season.id}" onclick="getSeasonDetails(this.id)">
                <nav>
                    <h6>Season ${season.seasonNumber}</h6>
                    <div>
                        <span>${season.numberOfEpisodes} episodes</span>
                        <span>▼</span>
                    </div>
                </nav>
                <div class="season-content">
                    
                </div>
            </li>
        `;
    }
    if (show.actors.length) {
        const actorsList = document.getElementById('actors-list')
        actorsList.innerHTML = '';
        for (const actor of show.actors) {
            actorsList.innerHTML += `
                <li>
                    <img src="${actor.profilePhotoPath ? `${posterBaseUrl}${actor.profilePhotoPath}` : alternativeImageUrl}" alt="">
                    <p>${actor.name}</p>
                </li>
            `
        }
    }
    if (show.directors.length) {
        const directorsList = document.getElementById('directors-list')
        directorsList.innerHTML = '';
        for (const director of show.directors) {
            directorsList.innerHTML += `
                <li>
                    <img src="${director.profilePhotoPath ? `${posterBaseUrl}${director.profilePhotoPath}` : alternativeImageUrl}" alt="">
                    <p>${director.name}</p>
                </li>
            `
        }
    }
    if (show.productionCompanies.length) {
        const productionCompaniesList = document.getElementById('production-companies-list');
        productionCompaniesList.innerHTML = '';
        for (const productionCompany of show.productionCompanies) {
            productionCompaniesList.innerHTML += `
            <li>
                <h6>${productionCompany.name} ${productionCompany.countryId ? productionCompany.country.code : ''}</h6>
                <img src="${productionCompany.logoPath ? `${posterBaseUrl}/${productionCompany.logoPath}` : ''}" alt="">
            </li>
        `;
        }
    }
    document.getElementById('lang').innerHTML = `<strong>${show.languages.length ? show.languages[0].code : ''}</strong>`;
    document.getElementById('release').innerText = show.firstAirDate.split('T')[0];
    document.getElementById('rating').innerText = `Rating: ${show.voteAverage}`;
    document.getElementById('runtime').innerText = `${show.seasons.length} seasons`;
    document.getElementById('description').innerHTML = `<p>${show.description}</p>`;
}

function exitShowView (body) {
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

const dropdownArrows = ['▼', '▲']

function changeArrowDirection (id) {
    const htmlDropdownArrow = document.querySelector(`[id='${id}'] > nav div > *:last-child`);
    if (htmlDropdownArrow.innerHTML === dropdownArrows[0]) {
        htmlDropdownArrow.innerHTML = dropdownArrows[1];
    } else {
        htmlDropdownArrow.innerHTML = dropdownArrows[0];
    }
}

async function getSeasonDetails (id) {
    changeArrowDirection(id);
    const seasonContent = document.getElementById(id).querySelector('.season-content');
    if (!seasonContent.style.display || seasonContent.style.display === 'none') {
        seasonContent.style.display = 'grid';
        const seasonResponse = await fetch(`${API_URL}/seasons/${id}`)
        if (seasonResponse.status === 200) {
            const seasonJSON = await seasonResponse.json()
            seasonContent.innerHTML = `
                <img src="${seasonJSON.posterPath ? `${posterBaseUrl}/${seasonJSON.posterPath}` : ''}" alt="">
                <h3>Air date: ${seasonJSON.airDate.split('T')[0]}</h3>
                <p>${seasonJSON.description}</p>
            `
        }
    } else {
        seasonContent.style.display = 'none';
    }
}

function openAddShowMenu () {
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
    label.innerHTML = `<input class="${inputClass}" type="text" placeholder="${placeholderText}">` +
        `<input class="${inputClass}Id" type="hidden"><br>`
    label.childNodes[0].addEventListener('keydown', async event => {
        if (event.code === 'Enter' || event.keyCode === 13) {
            const inputField = label.childNodes[0].value
            const index = await whereToQuery(inputField)
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

function addGenreField () {
    addField('genreField', 'shGenre', 'Gives the tone of:', async (name) => {
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
    addField('languageField', 'shLanguage', 'Understood better in:', async (name) => {
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

function addActorField () {
    addField('actorField', 'shActor', 'Deserves rows of applause:', async (name) => {
        const result = await (await fetch(`${API_URL}/actors?searchBy=${name}`)).json()
        return result.results
    }, 'addActorBtn')
}

function addDirectorField () {
    addField('directorField', 'shDirector', 'The mind which born it all:', async (name) => {
        const result = await (await fetch(`${API_URL}/directors?searchBy=${name}`)).json()
        return result.results
    }, 'addDirectorBtn')
}

function addProdCompField () {
    addField('prodCompField', 'shProdComp', 'Dedicated their hearts:', async (name) => {
        const result = await (await fetch(`${API_URL}/production-companies?searchBy=${name}`)).json()
        return result.results
    }, 'addProdCompBtn')
}

function addSeasonFields () {
    const seasonNumber = sessionStorage.getItem('nrOfSeasons')
    sessionStorage.setItem('nrOfSeasons', (parseInt(seasonNumber) + 1).toString())
    let contentPage = document.getElementById('add-movie-content')
    let label = document.createElement('label')
    label.setAttribute('id', `seasonField${seasonNumber}`)
    label.innerHTML = `<br>Season ${seasonNumber}:<br>` +
        `<input id="nrOfEpisodes${seasonNumber}" type="hidden" value="1">` +
        '<label>Season name: </label><br>' +
        `<input id="seasonName${seasonNumber}" type="text" placeholder="It has such a sounding name"><br>` +
        '<label>Air date: </label><br>' +
        `<input id="airDate${seasonNumber}" type="text" placeholder="It will be out by"><br>` +
        '<label>Description: </label><br>' +
        `<input id="description${seasonNumber}" type="text" maxlength="2000" placeholder="There is so much to say about it:"><br>` +
        `<button id="addNextEpisode${seasonNumber}" onclick="addEpisodeFields(${seasonNumber})">Add another episode</button><br>`
    contentPage.insertBefore(label, document.getElementById('addSeasonBtn'))
    addEpisodeFields(seasonNumber)
}

function addEpisodeFields (seasonNumber) {
    let contentPage = document.getElementById(`seasonField${seasonNumber}`)
    let nrOfEpisodes = document.getElementById(`nrOfEpisodes${seasonNumber}`)
    let label = document.createElement('label')
    label.setAttribute('class', `episodeOfSeason${seasonNumber}`)
    label.innerHTML = `Episode ${nrOfEpisodes.value}:<br>` +
        '<label>Episode name: </label><br>' +
        `<input class="episodeName" type="text" placeholder="It has such a sounding name"><br>` +
        '<label>Air date: </label><br>' +
        `<input class="airDate" type="text" placeholder="It will be out by"><br>` +
        '<label>Description: </label><br>' +
        `<input class="description" type="text" maxlength="2000" placeholder="There is so much to say about it:"><br>`
    document.getElementById(`nrOfEpisodes${seasonNumber}`).value = (parseInt(nrOfEpisodes.value) + 1).toString()
    contentPage.insertBefore(label, document.getElementById(`addNextEpisode${seasonNumber}`))
}

async function addShow () {
    let lastResponse
    let prodComps = []
    const prodCompIds = document.getElementsByClassName("shProdCompId")
    for (let el of prodCompIds) {
        if (el.value !== '') {
            prodComps.push(el.value)
        }
    }
    let actors = []
    const actorIds = document.getElementsByClassName("shActorId")
    for (let el of actorIds) {
        if (el.value !== '') {
            actors.push(el.value)
        }
    }
    let directors = []
    const directorIds = document.getElementsByClassName("shDirectorId")
    for (let el of directorIds) {
        if (el.value !== '') {
            directors.push(el.value)
        }
    }
    let genres = []
    const genreIds = document.getElementsByClassName("shGenreId")
    for (let el of genreIds) {
        if (el.value !== '') {
            genres.push(el.value)
        }
    }
    let languages = []
    const languageIds = document.getElementsByClassName("shLanguageId")
    for (let el of languageIds) {
        if (el.value !== '') {
            languages.push(el.value)
        }
    }
    const data = {
        title: document.getElementById('mvTitle').value,
        tagline: document.getElementById('mvTagline').value,
        releaseDate: document.getElementById('mvReleaseDate').value,
        rating: document.getElementById('mvRatingId').value,
        runtime: document.getElementById('mvRuntime').value,
        description: document.getElementById('mvDescription').value,
        status: document.getElementById('mvStatus').value,
        productionCompanyIds: prodComps,
        actorIds: actors,
        directorIds: directors,
        genreIds: genres,
        languageIds: languages
    }
    const showResponse = await (await fetch(`${API_URL}/shows`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(data)
    })).json()
    console.log(showResponse)
    const nrOfSeasons = sessionStorage.getItem("nrOfSeasons")
    for (let i = 1; i < nrOfSeasons; i++) {
        const seasonData = {
            title: document.getElementById(`seasonName${i}`).value,
            description: document.getElementById(`description${i}`).value,
            airDate: document.getElementById(`airDate${i}`).value,
            seasonNumber: i,
            tvShowId: showResponse.id
        }
        const seasonResponse = await (await fetch(`${API_URL}/seasons`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem("token")}`
            },
            body: JSON.stringify(seasonData)
        })).json()
        console.log(seasonResponse)
        const nrOfEpisodes = document.getElementById(`nrOfEpisodes${i}`).value
        const episodesOfSeason = document.getElementsByClassName(`episodeOfSeason${i}`)
        for (let j = 0; j < nrOfEpisodes - 1; j++) {
            const episodeData = {
                title: episodesOfSeason[j].childNodes[4].value,
                description: episodesOfSeason[j].childNodes[12].value,
                airDate: episodesOfSeason[j].childNodes[8].value,
                episodeNumber: j,
                seasonId: seasonResponse.id
            }
            const episodeResponse = await (await fetch(`${API_URL}/episodes`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem("token")}`
                },
                body: JSON.stringify(episodeData)
            })).json()
            console.log(episodeResponse)
            lastResponse=episodeResponse
        }
    }
    if(lastResponse.id){
        const window=document.getElementById('add-movie-content')
        window.innerHTML='<h1>Movie successfully added</h1>'
    } else {
        const window=document.getElementById('add-movie-content')
        window.innerHTML=`<h1>${lastResponse.message}</h1>`
    }
}
