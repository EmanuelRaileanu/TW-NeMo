const posterBaseUrl = 'https://image.tmdb.org/t/p/original/'

window.onload = async function () {
    const movies = (await (await fetch('../movies.json')).json()).results
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
