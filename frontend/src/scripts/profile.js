const posterBaseUrl = 'https://image.tmdb.org/t/p/original/';
let movies;
let shows;
window.onload = async function () {
    movies = (await (await fetch('../movies.json')).json()).results;
    movies.sort((movie1, movie2) => movie1.title.localeCompare(movie2.title))
    shows = (await (await fetch('../tv-shows.json')).json()).results;
    shows.sort((show1, show2) => show1.name.localeCompare(show2.name))
    loadFavorites()
}


function loadFavorites() {
    let name = localStorage.getItem('username');
    if (name == null || name.length === 0) {
        name = 'Dev';
    }
    document.getElementById('name').innerText = `Nume: ${name}`

    let email = localStorage.getItem('email');
    if (email == null || email.length === 0) {
        email = 'dev@nemo.net';
    }
    document.getElementById('mail').innerText = `Email: ${email}`


    document.getElementById('password').innerText = `Change password`

    let joindate = sessionStorage.getItem('joindate');
    if (joindate == null || joindate.length === 0) {
        joindate = new Date();
        joindate = joindate.toString();
        sessionStorage.setItem('joindate', joindate);
    }
    document.getElementById('joindate').innerText = `Member since: ${joindate}`

    document.getElementById('favorite-movies').innerHTML = '';
    document.getElementById('favorite-shows').innerHTML = '';

    for (let movie of movies) {
        document.getElementById('favorite-movies').innerHTML += `
            <li id="${movie.id}">
                <img src="${posterBaseUrl}/${movie.poster_path}" alt="Image not found">
                <div class="Title">
                    <h1>${movie.title}</h1>
                </div>
                <button onclick="deleteMedia('movie','${movie.id}')">✕</button>
            </li>`
    }
    for (let show of shows) {
        document.getElementById('favorite-shows').innerHTML += `
            <li id="${show.id}">
                <img src="${posterBaseUrl}/${show.poster_path}" alt="Image not found">
                <div class="Title">
                    <h1>${show.name}</h1>
                </div>
                <button onclick="deleteMedia('show','${show.id}')">✕</button>
            </li>`
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

function deleteMedia(type, id) {
    if (type === 'show') {
        shows=shows.filter(show => show.id.toString() !== id);
    } else {
        movies=movies.filter(movie => movie.id.toString() !== id);
    }
    loadFavorites();
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
