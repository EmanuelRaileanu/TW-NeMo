const posterBaseUrl = 'https://image.tmdb.org/t/p/original/';

const AUTH_SERVICE_URL = 'http://stachyon.asuscomm.com:8000'
const API_URL = 'http://stachyon.asuscomm.com:8081'

window.onload = async function () {
    await loadUserData()
    await loadFavorites()
    const userDetails = await (await fetch(`${AUTH_SERVICE_URL}/users/${localStorage.getItem("username")}`)).json()
    if (['Owner', 'Admin'].includes(userDetails.role.name)) {
        loadAdminOptions()
    }
}


function loadAdminOptions () {
    let contentPage = document.getElementById('wrapper')
    let actorButton = document.createElement('button')

    actorButton.setAttribute('id', 'addActorBtn')
    actorButton.setAttribute('onclick', 'openActorMenu()')
    actorButton.innerHTML = 'Add actor'
    contentPage.insertBefore(actorButton, document.getElementById(`export`))

    let directorButton = document.createElement('button')
    directorButton.setAttribute('id', 'addDirectorBtn')
    directorButton.setAttribute('onclick', 'openDirectorMenu()')
    directorButton.innerHTML = 'Add director'
    contentPage.insertBefore(directorButton, document.getElementById(`export`))

    let prodCompButton = document.createElement('button')
    prodCompButton.setAttribute('id', 'addProdCompBtn')
    prodCompButton.setAttribute('onclick', 'openProductionCompanyMenu()')
    prodCompButton.innerHTML = 'Add production company'
    contentPage.insertBefore(prodCompButton, document.getElementById(`export`))

    let seasonButton = document.createElement('button')
    seasonButton.setAttribute('id', 'addSeasonBtn')
    seasonButton.setAttribute('onclick', 'openSeasonMenu()')
    seasonButton.innerHTML = 'Add season'
    contentPage.insertBefore(seasonButton, document.getElementById(`export`))

    let episodeButton = document.createElement('button')
    episodeButton.setAttribute('id', 'addEpisodeBtn')
    episodeButton.setAttribute('onclick', 'openEpisodeMenu()')
    episodeButton.innerHTML = 'Add episode'
    contentPage.insertBefore(episodeButton, document.getElementById(`export`))
}

function openActorMenu () {
    console.log("I'll open the actor menu")
    //make window visible
    /*add the fields: name
                      gender
                      birthdate
                      placeOfBirth
                      biography

    */
}

function openDirectorMenu () {
    console.log("I'll open the director menu")
    //make window visible
    /*add the fields: name
                      gender
                      birthdate
                      placeOfBirth
                      biography

    */
}

function openProductionCompanyMenu () {
    console.log("I'll open the production companies menu")
    //make window visible
    /*add the fields: name
                      description
                      headquarters
                      countryId

    */
}

function openSeasonMenu () {
    console.log("I'll open the seasons menu")
    //make window visible
    /*add the fields: showId
                      title
                      description
                      airDate
                      seasonNumber
    */
}

function openEpisodeMenu () {
    console.log("I'll open the episodes menu")
    //make window visible
    /*add the fields: seasonId
                      title
                      description
                      airDate
                      episodeNumber
    */
}

async function logout () {
    const response = await fetch(`${AUTH_SERVICE_URL}/auth/logout`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem("token")}`
        }
    })
    if (response.status !== 200) {
        const responseJSON = await response.json()
        alert(responseJSON.message)
        return
    }
    localStorage.removeItem('token')
    localStorage.removeItem('tokenExpiry')
    localStorage.removeItem('username')
    window.location.replace('./homepage.html')
    sessionStorage.setItem('contentPage', 'homepage')
    parent.window.location.reload()
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

async function loadFavorites () {
    document.getElementById('favorite-movies').innerHTML = '';
    document.getElementById('favorite-shows').innerHTML = '';

    const moviesResponse = await fetch(`${API_URL}/movies/favorites`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    })

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

    const tvShowsResponse = await fetch(`${API_URL}/shows/favorites`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    })

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


function exportList () {
    console.log("I'll export the data... candva")
}

function changeField (field) {
    document.getElementById('profileBody').style.overflow = 'hidden';
    const sheet = window.document.styleSheets[0];
    sheet.insertRule('body > *:not(#changeMenu) { filter: blur(8px); }', sheet.cssRules.length);
    sheet.insertRule(`#changeMenu {background: linear-gradient(rgba(19, 35, 47, 0.90), rgba(19, 35, 47, 0.90)) no-repeat center fixed; }`, sheet.cssRules.length);
    document.getElementById('changeMenu').style.display = 'block';

    document.getElementById('changeUsernameForm').style.display = 'none';
    document.getElementById('changeEmailForm').style.display = 'none';
    document.getElementById('changePasswordForm').style.display = 'none';

    document.getElementById('changeUsernameSubmitButton').style.display = 'none';
    document.getElementById('changeEmailSubmitButton').style.display = 'none';
    document.getElementById('changePasswordSubmitButton').style.display = 'none';

    switch (field) {
        case 'username':
            document.getElementById('changeUsernameForm').style.display = 'block';
            document.getElementById('changeUsernameSubmitButton').style.display = 'block';
            break
        case 'email':
            document.getElementById('changeEmailForm').style.display = 'block';
            document.getElementById('changeEmailSubmitButton').style.display = 'block';
            break
        case 'password':
            document.getElementById('changePasswordForm').style.display = 'block';
            document.getElementById('changePasswordSubmitButton').style.display = 'block';
            break
    }
}

async function submitForm (submitButtonId) {
    let response
    switch (submitButtonId) {
        case 'changeUsernameSubmitButton':
            const username = document.getElementById('newUsername').value
            if (!username) {
                alert('username field is mandatory')
                break
            }
            const oldUsername = localStorage.getItem('username')
            localStorage.setItem('username', username)
            response = await fetch(`${AUTH_SERVICE_URL}/users/change-username`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ username })
            })
            if (response.status !== 200) {
                localStorage.setItem('username', oldUsername)
            }
            break
        case 'changeEmailSubmitButton':
            const email = document.getElementById('newEmail').value
            if (!email) {
                alert('email field is mandatory')
                break
            }
            const password = document.getElementById('changeEmailPassword').value
            if (!password) {
                alert('password field is mandatory')
                break
            }
            response = await fetch(`${AUTH_SERVICE_URL}/users/change-email`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ email, password })
            })
            break
        case 'changePasswordSubmitButton':
            const oldPassword = document.getElementById('oldPassword').value
            if (!oldPassword) {
                alert('oldPassword field is mandatory')
                break
            }
            const newPassword = document.getElementById('newPassword').value
            if (!newPassword) {
                alert('password field is mandatory')
                break
            }
            const confirmedPassword = document.getElementById('confirmedNewPassword').value
            if (!confirmedPassword) {
                alert('confirmedPassword field is mandatory')
                break
            }
            response = await fetch(`${AUTH_SERVICE_URL}/users/change-password`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ oldPassword, password: newPassword, confirmedPassword })
            })
            break
    }
    if (response.status !== 200) {
        const responseJSON = await response.json()
        alert(responseJSON.message)
    }
}

async function deleteMedia (type, id) {
    if (type === 'show') {
        shows = shows.filter(show => show.id.toString() !== id);
    } else {
        movies = movies.filter(movie => movie.id.toString() !== id);
    }
    await loadFavorites();
}

function finishedChanges () {
    document.getElementById('profileBody').style.overflow = 'auto';
    document.getElementById('changeMenu').style.display = 'none';
    const sheet = window.document.styleSheets[0];
    sheet.insertRule('body > *:not(#changeMenu) { filter: none; }', sheet.cssRules.length);
    for (let i = 0; i < sheet.rules.length; i++) {
        if (sheet.rules[i].selectorText === '#ffield' || sheet.rules[i].selectorText === '#flabel') {
            if (sheet.rules[i].cssText === '#ffield { display: none; }' || sheet.rules[i].cssText === '#flabel { display: none; }') {
                sheet.deleteRule(i);
                i--;
            }
        }
    }
}
