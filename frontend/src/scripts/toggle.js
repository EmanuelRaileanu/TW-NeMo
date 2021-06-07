const API_URL = 'http://stachyon.asuscomm.com:8081'
const posterBaseUrl = 'https://image.tmdb.org/t/p/original/'


function writeToHTML(items, btnMode) {
    for (let i = 0; i < items.length; i++) {
        document.getElementById("name" + i).innerHTML = items[i].title;
        document.getElementById("img" + i).setAttribute("src", posterBaseUrl + items[i].backdropPath);
        document.getElementById("desc" + i).innerHTML = items[i].description;
        document.getElementById("rat" + i).innerHTML = `Score: ${items[i].voteAverage ? items[i].voteAverage : items[i].tmdbVoteAverage}`;
    }
    if(btnMode){
        document.getElementById("mvBtn").innerHTML="<h1>" + document.getElementById("mvBtn").innerHTML + "</h1>";
        document.getElementById("shBtn").innerHTML="TV Shows";
    }else{
        document.getElementById("shBtn").innerHTML="<h1>" + document.getElementById("shBtn").innerHTML + "</h1>";
        document.getElementById("mvBtn").innerHTML="Movies";
    }
}

async function changeToShows() {
    const tvShowsResponse = await fetch(`${API_URL}/shows?pageSize=3`)
    if (tvShowsResponse.status === 200) {
        writeToHTML((await tvShowsResponse.json()).results, false);
    }
}

async function changeToFilms() {
    const moviesResponse = await fetch(`${API_URL}/movies?pageSize=3`)
    if (moviesResponse.status === 200) {
        writeToHTML((await moviesResponse.json()).results, true);
    }
}

changeToFilms().then();