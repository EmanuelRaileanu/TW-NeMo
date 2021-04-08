const posterBaseUrl = 'http://image.tmdb.org/t/p/w500'

window.onload = async function () {
    const tvShows = (await (await fetch('../tv-shows.json')).json()).results
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
