const posterBaseUrl = 'https://image.tmdb.org/t/p/original/'
const genres = ['Action & Adventure', 'Animation', 'Comedy', 'Crime', 'Drama', 'Family', 'Kids', 'Mystery', 'Sci-Fi & Fantasy', 'Talk'];
const prodComps = ['20th Century Fox Television', '20th Television', 'Anonymous Content', 'BBC Studios', 'Berlanti Productions', 'Bonanza Productions', 'Bunim-Murray Productions (BMP)', 'Carter Bays', 'Caryn Mandabach Productions', 'DC Entertainment', 'Mad Ghost Productions', 'Michael Landon Productions', 'National Broadcasting Company', 'NBCUniversal', 'Nickelodeon Animation Studio', 'Paramount Television Studios', 'Primrose Hill Productions', 'Screen Yorkshire', 'Tiger Aspect Productions', 'Warner Bros. Television'];
const API_URL = 'http://stachyon.asuscomm.com:8081'

window.onload = async function () {
    await renderShows({ sorting: 'name' });
    createFiltersMenu();
    document.getElementById("shSch").addEventListener('keydown', async event => {
        if (event.code === 'Enter' || event.keyCode === 13)
            await applyFilters();
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

async function renderShows (filters = null) {
    document.getElementById('list').innerHTML = '';
    const tvShows = await getShows(filters);
    for (let i = 0; i < tvShows.length; i++) {
        document.getElementById('list').innerHTML += `
            <li id="${tvShows[i].id}" onclick="displayShow(this.id)">
                <img src="${posterBaseUrl}/${tvShows[i].posterPath}" alt="Image not found">
                <div class="written-content">
                    <h1>${tvShows[i].title}</h1>
                    <span>${tvShows[i].description}</span>
                </div>
                <div class="vertical-info">
                    <span>Rating: ${tvShows[i].voteAverage}</span>
                </div>
            </li>`
    }
}


async function getShows (filters = null) {
    let shows = (await (await fetch(`${API_URL}/shows`)).json()).results;
    if (filters && filters !== {}) {
        if (filters.name) {
            shows = shows.filter(show => show.name.toLowerCase().includes(filters.name.toLowerCase()));
        }
        if (filters.genres && filters.genres.length) {
            shows = shows.filter(show => show.genres.find(genre => filters.genres.includes(genre.name)));
        }
        if (filters.productionCompanies && filters.productionCompanies.length) {
            shows = shows.filter(show => show.productionCompanies.find(productionCompany => filters.productionCompanies.includes(productionCompany.name)));
        }
        if (filters.sorting !== null || document.getElementById('rat').checked) {
            if (document.getElementById('rat').checked)
                shows.sort((show1, show2) => parseFloat(show1.voteAverage) - parseFloat(show2.voteAverage));
            else
                shows.sort((show1, show2) => show1.title.localeCompare(show2.name))
        }
    }
    if (document.getElementById('desc').checked) {
        shows.reverse();
    }
    return shows;
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
        name: document.getElementById("shSch").value,
        sorting: document.getElementById('rat').checked ? sorting : 'name'
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
    document.getElementById('poster').innerHTML = `<img src="${posterBaseUrl}/${show.posterPath}" alt="Image not found">`;
    document.getElementById('title').innerHTML = `<h1>${show.title}</h1>`;
    document.getElementById('tagline').innerHTML = `<h4>${show.tagline}</h4>`;
    const genreList = document.getElementById('genre-list');
    genreList.innerHTML = ''
    for (const genre of show.genres) {
        genreList.innerHTML += `<li><span>${genre.name}</span></li>`;
    }
    const seasonsList = document.getElementById('seasons-list')
    seasonsList.innerHTML = ''
    for  (const season of show.seasons) {
        seasonsList.innerHTML += `
            <li id="season-${season.id}" onclick="getSeasonDetails(this.id)">
                <nav>
                    <h6>Season ${season.seasonNumber}</h6>
                    <div>
                        <span>${season.episode_count} episodes</span>
                        <span>▼</span>
                    </div>
                </nav>
                <div class="season-content">
                    <img src="${season.posterPath ? `${posterBaseUrl}/${season.posterPath}` : ''}" alt="">
                    <h3>Air date: ${season.airdate}</h3>
                    <p>${season.description}</p>
                </div>
            </li>
        `;
    }
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
    document.getElementById('lang').innerHTML = `<strong>${show.languages.length ? show.languages[0].code : ''}</strong>`;
    document.getElementById('release').innerText = show.firstAirDate.split('T')[0];
    document.getElementById('rating').innerText = `Rating: ${show.voteAverage}`;
    document.getElementById('runtime').innerText = `${show.seasons.length} seasons`;
    document.getElementById('description').innerHTML = `<p>${show.description}</p>`;
}

function exitShowView () {
    document.getElementById('movies-body').style.overflow = 'auto';
    document.getElementById('movie-container').style.display = 'none';
    const sheet = window.document.styleSheets[0];
    sheet.insertRule('body > *:not(#movie-container) { filter: none; }', sheet.cssRules.length);
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

function getSeasonDetails (id) {
    changeArrowDirection(id);
    const seasonContent = document.querySelector(`[id=${id}] .season-content`);
    if (!seasonContent.style.display || seasonContent.style.display === 'none') {
        seasonContent.style.display = 'grid';
    } else {
        seasonContent.style.display = 'none';
    }
}
