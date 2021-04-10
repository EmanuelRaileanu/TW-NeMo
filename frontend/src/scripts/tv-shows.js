const posterBaseUrl = 'https://image.tmdb.org/t/p/original/'
const genres=['Action & Adventure', 'Animation', 'Comedy', 'Crime', 'Drama', 'Family', 'Kids', 'Mystery', 'Sci-Fi & Fantasy', 'Talk'];
const prodComps=['20th Century Fox Television', '20th Television', 'Anonymous Content', 'BBC Studios', 'Berlanti Productions', 'Bonanza Productions', 'Bunim-Murray Productions (BMP)', 'Carter Bays', 'Caryn Mandabach Productions', 'DC Entertainment', 'Mad Ghost Productions', 'Michael Landon Productions', 'National Broadcasting Company', 'NBCUniversal', 'Nickelodeon Animation Studio', 'Paramount Television Studios', 'Primrose Hill Productions', 'Screen Yorkshire', 'Tiger Aspect Productions', 'Warner Bros. Television'];

window.onload = async function () {
    await renderShows();
    createFiltersMenu();
    document.getElementById("shSch").addEventListener('keydown', async event => {
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

async function renderShows(filters = null) {
    document.getElementById('list').innerHTML = '';
    const tvShows = await getShows(filters);
    for (let i = 0; i < tvShows.length; i++) {
        document.getElementById('list').innerHTML += `
            <li>
                <img src="${posterBaseUrl}/${tvShows[i].poster_path}" alt="Image not found">
                <div class="written-content">
                    <h1>${tvShows[i].original_name}</h1>
                    <span>${tvShows[i].overview}</span>
                </div>
                <div class="vertical-info">
                    <span>Rating: ${tvShows[i].vote_average}</span>
                </div>
            </li>`
    }
}


async function getShows(filters = null) {
    let shows = (await (await fetch('../tv-shows.json')).json()).results;
    if (filters && filters !== {}) {
        if (filters.name !== '') {
            shows = shows.filter(show => show.original_title.toLowerCase().includes(filters.name.toLowerCase()));
        }
        if (filters.genres && filters.genres.length) {
            shows = shows.filter(show => show.genres.find(genre => filters.genres.includes(genre.name)));
        }
        if (filters.productionCompanies && filters.productionCompanies.length) {
            shows = shows.filter(show => show.production_companies.find(productionCompany => filters.productionCompanies.includes(productionCompany.name)));
        }
        if (filters.sorting !== null || document.getElementById('rating').checked) {
            if (document.getElementById('rating').checked)
                shows.sort((show1, show2) => parseFloat(show1.vote_average) - parseFloat(show2.vote_average));
            else
                shows.sort((show1, show2) => show1.original_title > show2.original_title)
        }
        if (document.getElementById('desc').checked) {
            shows.reverse();
        }
    }
    return shows;
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
    let filters = {name: '', genres: [], productionCompanies: [], sorting:''};
    filters.genres = findFilters('genres', genres);
    filters.productionCompanies = findFilters('prodComp', prodComps);
    filters.name = document.getElementById("shSch").value;
    filters.sorting=sorting;
    await renderShows(filters);
}

async function resetFilters() {
    for (let item of document.getElementsByClassName('genres')) {
        item.checked = false;
    }
    for (let item of document.getElementsByClassName('prodComp')) {
        item.checked = false;
    }
    document.getElementById("shSch").value = '';
    await renderShows();
}

