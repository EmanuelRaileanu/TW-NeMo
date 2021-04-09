const posterBaseUrl = 'https://image.tmdb.org/t/p/original/'
window.onload = async function () {
    await renderMovies();
    document.getElementById("mvSch").addEventListener('keydown', async event => {
        if(event.code==='Enter')
            await searchMovie();
    });
}

async function renderMovies(filters=null){
    document.getElementById('list').innerHTML='';
    const movies = await getMovies(filters)
    for (let i = 0; i < movies.length; i++) {
        document.getElementById('list').innerHTML += `
            <li>
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

async function getMovies(filters = null) {
    let movies = (await (await fetch('../movies.json')).json()).results;
    if (filters && filters !== {}) {
        if (filters.genres && filters.genres.length) {
            movies = movies.filter(movie => movie.genres.find(genre => filters.genres.includes(genre.name)));
            console.log(movies);
        }
        if (filters.productionCompanies && filters.productionCompanies.length) {
            movies =  movies.filter(movie => movie.production_companies.find(productionCompany => filters.productionCompanies.includes(productionCompany.name)));
        }
    }
    return movies;
}

function findFilters(checkType, filterNames){
    let filters=[];
    let inputElements = document.getElementsByClassName(checkType);
    for(let i=0; inputElements[i]; ++i){
        if(inputElements[i].checked){
            filters.push(filterNames[i]);
        }
    }
    return filters;
}

async function applyFilters(){
    const genres=['Drama', 'Romance'];
    const prodComps=['United Artists']
    let filters={genres:[],productionCompanies:[]};
    filters.genres=findFilters('genres',genres);
    filters.productionCompanies=findFilters('prodComp',prodComps);
    await renderMovies(filters);
}

async function resetFilters(){
    for(let item of document.getElementsByClassName('genres')){
        item.checked=false;
    }
    for(let item of document.getElementsByClassName('prodComp')){
        item.checked=false;
    }
    await renderMovies();
}


async function searchMovie(){
    let name=document.getElementById("mvSch").value;
    console.log(name);
}