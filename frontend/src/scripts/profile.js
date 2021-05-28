const posterBaseUrl = 'https://image.tmdb.org/t/p/original/';

window.onload = async function () {
    let name = sessionStorage.getItem('username');
    if (name == null || name.length == 0) {
        name = 'Dev';
    }
    document.getElementById('name').innerText = `Nume: ${name}`

    let email = sessionStorage.getItem('email');
    if (email == null || email.length == 0) {
        email = 'dev@nemo.net';
    }
    document.getElementById('mail').innerText = `Email: ${email}`


    document.getElementById('password').innerText = `Change password`

    let joindate=sessionStorage.getItem('joindate');
    if(joindate==null || joindate.length==0) {
        joindate = new Date();
        joindate=joindate.toString();
        sessionStorage.setItem('joindate',joindate);
    }
    console.log(joindate.replace(new RegExp('(.*)'),' '))
    document.getElementById('joindate').innerText = `Member since: ${joindate}`

    document.getElementById('favorite-movies').innerHTML = '';
    document.getElementById('favorite-shows').innerHTML = '';

    let movies = (await (await fetch('../movies.json')).json()).results;
    movies.sort((movie1, movie2) => movie1.title.localeCompare(movie2.title))
    let shows = (await (await fetch('../tv-shows.json')).json()).results;
    shows.sort((show1, show2) => show1.name.localeCompare(show2.name))
    for (let movie of movies) {
        document.getElementById('favorite-movies').innerHTML += `
            <li id="${movie.id}">
                <img src="${posterBaseUrl}/${movie.poster_path}" alt="Image not found">
                <div class="Title">
                    <h1>${movie.title}</h1>
                </div>
            </li>`
    }
    for (let show of shows) {
        document.getElementById('favorite-shows').innerHTML += `
            <li id="${show.id}">
                <img src="${posterBaseUrl}/${show.poster_path}" alt="Image not found">
                <div class="Title">
                    <h1>${show.name}</h1>
                </div>
            </li>`
    }
}


function exportList(){
    console.log("I'll export the data... candva")
}

function changeField(field){
    console.log(`Changing the ${field}`)
    document.getElementById('profileBody').style.overflow = 'hidden';
    const sheet = window.document.styleSheets[0];
    sheet.insertRule('body > *:not(#changeMenu) { filter: blur(8px); }', sheet.cssRules.length);
    sheet.insertRule(`#changeMenu { background: linear-gradient(rgba(19, 35, 47, 0.90), rgba(19, 35, 47, 0.90)) no-repeat center fixed; }`, sheet.cssRules.length);
    document.getElementById('changeMenu').style.display = 'block';
    if(field!=='password'){
        sheet.insertRule('#field3{display:none;}', sheet.cssRules.length);
    }

}

function finishedChanges(){
    document.getElementById('profileBody').style.overflow = 'auto';
    document.getElementById('changeMenu').style.display = 'none';
    const sheet = window.document.styleSheets[0];
    sheet.insertRule('body > *:not(#changeMenu) { filter: none; }', sheet.cssRules.length);
}
