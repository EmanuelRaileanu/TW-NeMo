const posterBaseUrl = 'https://image.tmdb.org/t/p/original/';

const AUTH_SERVICE_URL = 'http://stachyon.asuscomm.com:8000'
const API_URL = 'http://stachyon.asuscomm.com:8081'

window.onload = async function () {
    await loadUserData()
    await loadFavorites()
}


async function loadUserData () {
    const username = localStorage.getItem('username')
    const userResponse = await fetch(`${AUTH_SERVICE_URL}/users/${username}`)

    if (userResponse.status === 200) {
        const userJSON = await userResponse.json()
        document.getElementById('username').innerText = `Username: ${userJSON.username}`
        document.getElementById('email').innerText = `Email: ${userJSON.email}`
        document.getElementById('password').innerText = `Change password`
        const timestamp = new Date(userJSON.createdAt)
        document.getElementById('join-date').innerText = `Join date: ${timestamp.getDate()}/${timestamp.getMonth() + 1}/${timestamp.getFullYear()}`
    }
}

async function loadFavorites() {
    document.getElementById('favorite-movies').innerHTML = '';
    document.getElementById('favorite-shows').innerHTML = '';

    const moviesResponse = await fetch(`${API_URL}/movies/favorites`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`
        }
    })

    console.log(moviesResponse)

    if (moviesResponse.status === 200) {
        const moviesJSON = await moviesResponse.json()
        for (let movie of moviesJSON) {
            document.getElementById('favorite-movies').innerHTML += `
            <li id="${movie.id}">
                <img src="${posterBaseUrl}/${movie.posterPath}" alt="Image not found">
                <div class="Title">
                    <h1>${movie.title}</h1>
                </div>
            </li>`
        }
    }

    const tvShowsResponse = await fetch(`${API_URL}/shows/favorites`)

    if (tvShowsResponse.status === 200) {
        const tvShowsJSON = await tvShowsResponse.json()
        for (let show of tvShowsJSON) {
            document.getElementById('favorite-shows').innerHTML += `
            <li id="${show.id}">
                <img src="${posterBaseUrl}/${show.posterPath}" alt="Image not found">
                <div class="Title">
                    <h1>${show.title}</h1>
                </div>
            </li>`
        }
    }
}


function exportList() {
    console.log("I'll export the data... candva")
}

function changeField(field) {
    document.getElementById('profileBody').style.overflow = 'hidden';
    document.getElementById('slabel').innerText='New ' + field;
    document.getElementById('tlabel').innerText='Confirm new ' + field;
    const sheet = window.document.styleSheets[0];
    sheet.insertRule('body > *:not(#changeMenu) { filter: blur(8px); }', sheet.cssRules.length);
    sheet.insertRule(`#changeMenu {background: linear-gradient(rgba(19, 35, 47, 0.90), rgba(19, 35, 47, 0.90)) no-repeat center fixed; }`, sheet.cssRules.length);
    document.getElementById('changeMenu').style.display = 'block';
    if (field !== 'password') {
        sheet.insertRule('#flabel{display:none;}', sheet.cssRules.length);
        sheet.insertRule('#ffield{display:none;}', sheet.cssRules.length);
    }
}

async function deleteMedia(type, id) {
    if (type === 'show') {
        shows=shows.filter(show => show.id.toString() !== id);
    } else {
        movies=movies.filter(movie => movie.id.toString() !== id);
    }
    await loadFavorites();
}

function finishedChanges() {
    document.getElementById('profileBody').style.overflow = 'auto';
    document.getElementById('changeMenu').style.display = 'none';
    const sheet = window.document.styleSheets[0];
    sheet.insertRule('body > *:not(#changeMenu) { filter: none; }', sheet.cssRules.length);
    for(let i=0; i<sheet.rules.length;i++){
        if(sheet.rules[i].selectorText==='#ffield' || sheet.rules[i].selectorText==='#flabel'){
            if(sheet.rules[i].cssText==='#ffield { display: none; }' || sheet.rules[i].cssText==='#flabel { display: none; }'){
                sheet.deleteRule(i);
                i--;
            }
        }
    }
}
