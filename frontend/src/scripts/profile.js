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


function loadAdminOptions() {
    let contentPage = document.getElementById('wrapper')
    let actorButton = document.createElement('button')

    actorButton.setAttribute('id', 'addActorBtn')
    actorButton.setAttribute('onclick', 'openActorMenu()')
    actorButton.innerHTML = 'Actor menu'
    contentPage.insertBefore(actorButton, document.getElementById(`export`))

    let directorButton = document.createElement('button')
    directorButton.setAttribute('id', 'addDirectorBtn')
    directorButton.setAttribute('onclick', 'openDirectorMenu()')
    directorButton.innerHTML = 'Director menu'
    contentPage.insertBefore(directorButton, document.getElementById(`export`))

    let prodCompButton = document.createElement('button')
    prodCompButton.setAttribute('id', 'addProdCompBtn')
    prodCompButton.setAttribute('onclick', 'openProductionCompanyMenu()')
    prodCompButton.innerHTML = 'Production company menu'
    contentPage.insertBefore(prodCompButton, document.getElementById(`export`))

    let seasonButton = document.createElement('button')
    seasonButton.setAttribute('id', 'addSeasonBtn')
    seasonButton.setAttribute('onclick', 'openSeasonMenu()')
    seasonButton.innerHTML = 'Season menu'
    contentPage.insertBefore(seasonButton, document.getElementById(`export`))

    let episodeButton = document.createElement('button')
    episodeButton.setAttribute('id', 'addEpisodeBtn')
    episodeButton.setAttribute('onclick', 'openEpisodeMenu()')
    episodeButton.innerHTML = 'Episode menu'
    contentPage.insertBefore(episodeButton, document.getElementById(`export`))
}

function openGeneralMenu(bodyToAdd) {
    document.getElementById('profileBody').style.overflow = 'hidden';
    const sheet = window.document.styleSheets[0];
    sheet.insertRule('body > *:not(#addMenu) { filter: blur(8px); }', sheet.cssRules.length);
    sheet.insertRule(`#addMenu {background: linear-gradient(rgba(19, 35, 47, 0.90), rgba(19, 35, 47, 0.90)) no-repeat center fixed; }`, sheet.cssRules.length);
    document.getElementById('addMenu').style.display = 'block';
    let fieldsPlace = document.getElementById('addMenuBody')
    fieldsPlace.innerHTML = bodyToAdd.innerHTML
}

async function logout() {
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

async function loadUserData() {
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
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    })

    if (moviesResponse.status === 200) {
        const moviesJSON = await moviesResponse.json()
        for (let movie of moviesJSON) {
            document.getElementById('favorite-movies').innerHTML += `
            <li id="${movie.id}">
                <img src="${posterBaseUrl}/${movie.posterPath}" alt="">
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
                <img src="${posterBaseUrl}/${show.posterPath}" alt="">
                <div class="Title">
                    <h1>${show.title}</h1>
                </div>
            </li>`
        }
    }
}


function exportList() {
    let exportBody=document.createElement('div')

    openGeneralMenu(exportBody)
}

function changeField(field) {
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

async function submitForm(submitButtonId) {
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
                body: JSON.stringify({username})
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
                body: JSON.stringify({email, password})
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
                body: JSON.stringify({oldPassword, password: newPassword, confirmedPassword})
            })
            break
    }
    if (response.status !== 200) {
        const responseJSON = await response.json()
        alert(responseJSON.message)
    }
}

async function deleteMedia(type, id) {
    if (type === 'show') {
        shows = shows.filter(show => show.id.toString() !== id);
    } else {
        movies = movies.filter(movie => movie.id.toString() !== id);
    }
    await loadFavorites();
}

function finishedChanges(body) {
    document.getElementById('profileBody').style.overflow = 'auto';
    document.getElementById(body).style.display = 'none';
    const sheet = window.document.styleSheets[0];
    sheet.insertRule(`body > *:not(#${body}) { filter: none; }`, sheet.cssRules.length);

}


function openActorMenu() {
    let fields = document.createElement('div')
    fields.setAttribute('id', 'addMenuFullBody')
    let buttonList = document.createElement('nav')
    buttonList.setAttribute('id', 'addMenuButtonList')
    buttonList.innerHTML += '<button id="addActorBtn" onclick="addActor()">Add actor</button>' +
        '<button id="editActorBtn" onclick="editActor()">Edit actor</button>' +
        '<button id="deleteActorBtn" onclick="deleteActor()">Delete actor</button><br>'
    fields.append(buttonList)
    let fieldList = document.createElement('div')
    fieldList.setAttribute('id', 'addMenuFieldList')
    fields.append(fieldList)
    openGeneralMenu(fields)
    addActor()
}

function addActor() {
    document.getElementById('addMenuFieldList').innerHTML = '<label>Name:</label><br>' +
        '<input id="actorNameInput" type="text" maxlength="50" placeholder="The center of attention"><br>' +
        '<label>Gender:</label><br>' +
        '<input id="actorGenderInput" type="text" maxlength="50" placeholder="May or may not be assigned at birth"><br>' +
        '<label>Birthdate:</label><br>' +
        '<input id="actorBirthInput" type="text" placeholder="yyyy-mm-dd" ><br>' +
        '<label>Birth place:</label><br>' +
        '<input id="actorPlaceInput" type="text" placeholder="Where the legend stepped into the world"><br>' +
        '<label>Biography:</label><br>' +
        '<input id="actorBiographyInput" type="text" maxlength="2000" placeholder="It`s a long story"><br>' +
        '<button id="addMenuSubmitBtn" onclick="submitActor(`POST`)">Submit</button>'
}

async function submitActor(method, id = '') {
    let data
    if (method !== 'DELETE') {
        console.log('am intrat')
        data = {
            name: document.getElementById('actorNameInput').value,
            gender: document.getElementById('actorGenderInput').value === 'Male' ? 1 : 0,
            placeOfBirth: document.getElementById('actorPlaceInput').value,
            birthDate: document.getElementById('actorBirthInput').value,
            biography: document.getElementById('actorBiographyInput').value
        }
        if (method === 'POST') {
            data['movieIds'] = []
            data['tvShowIds'] = []
        }
    }
    const link = method === 'POST' ? `${API_URL}/actors` : `${API_URL}/actors/${id}`
    const actorResponse = await (await fetch(link, {
        method: method,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(data)
    })).json()
    console.log(actorResponse)
    const positiveResponse = method === 'POST' ? 'Actor successfully added' : method === 'PUT' ? 'Actor successfully updated' : 'Actor successfully deleted'
    document.getElementById('addMenuFieldList').innerHTML = `<h1>${actorResponse.message ? actorResponse.message : positiveResponse}</h1>`
}

function editActor() {
    addActor()
    const nameInput = document.getElementById('actorNameInput')
    nameInput.setAttribute('placeholder', 'Name of the actor you want to edit')
    let idActor
    const fieldList = document.getElementById('addMenuFieldList')

    nameInput.addEventListener('keydown', async event => {
        if (event.code === 'Enter' || event.keyCode === 13) {
            const inputField = nameInput.value
            const index = await (await fetch(`${API_URL}/actors?searchBy=${inputField}`)).json()
            if (index['results'].length > 0) {
                const actor = index['results'][0]
                console.log(actor)
                nameInput.value = actor.name
                nameInput.style.color = "green"
                idActor = actor.id
                fieldList.childNodes[6].value = actor.gender === 1 ? 'Male' : 'Female'
                fieldList.childNodes[10].value = actor.birthDate.replace(/T.*/, '')
                fieldList.childNodes[14].value = actor.placeOfBirth
                fieldList.childNodes[18].value = actor.biography
                document.getElementById('addMenuSubmitBtn').setAttribute('onclick', `submitActor('PUT', '${idActor}')`)
            } else {
                nameInput.style.color = "red"
            }
        }
    })
}

function deleteActor() {
    document.getElementById('addMenuFieldList').innerHTML = '<label>The name of the actor you want to delete:</label><br>' +
        '<input id="actorName" type="text"><br>' +
        '<button id="addMenuSubmitBtn">Delete actor</button>'

    const actNameField = document.getElementById('actorName')
    let idActor
    actNameField.addEventListener('keydown', async event => {
        if (event.code === 'Enter' || event.keyCode === 13) {
            const inputField = actNameField.value
            const index = await (await fetch(`${API_URL}/actors?searchBy=${inputField}`)).json()
            if (index['results'].length > 0) {
                const actor = index['results'][0]
                actNameField.value = actor.name
                actNameField.style.color = "green"
                idActor = actor.id
                document.getElementById('addMenuSubmitBtn').setAttribute('onclick', `submitActor('DELETE', '${idActor}')`)
            } else {
                actNameField.style.color = "red"
            }
        }
    })
}

function openDirectorMenu() {
    let fields = document.createElement('div')
    fields.setAttribute('id', 'addMenuFullBody')
    let buttonList = document.createElement('nav')
    buttonList.setAttribute('id', 'addMenuButtonList')
    buttonList.innerHTML += '<button id="addActorBtn" onclick="addDirector()">Add director</button>' +
        '<button id="editActorBtn" onclick="editDirector()">Edit director</button>' +
        '<button id="deleteActorBtn" onclick="deleteDirector()">Delete director</button><br>'
    fields.append(buttonList)
    let fieldList = document.createElement('div')
    fieldList.setAttribute('id', 'addMenuFieldList')
    fields.append(fieldList)
    openGeneralMenu(fields)
    addDirector()
}

function addDirector() {
    document.getElementById('addMenuFieldList').innerHTML = '<label>Name:</label><br>' +
        '<input id="actorNameInput" type="text" maxlength="50" placeholder="The name all will remember"><br>' +
        '<label>Gender:</label><br>' +
        '<input id="actorGenderInput" type="text" maxlength="50" placeholder="May or may not be assigned at birth"><br>' +
        '<label>Birthdate:</label><br>' +
        '<input id="actorBirthInput" type="text" placeholder="yyyy-mm-dd" ><br>' +
        '<label>Birth place:</label><br>' +
        '<input id="actorPlaceInput" type="text" placeholder="Where the legend stepped into the world"><br>' +
        '<label>Biography:</label><br>' +
        '<input id="actorBiographyInput" type="text" maxlength="2000" placeholder="It`s a long story"><br>' +
        '<button id="addMenuSubmitBtn" onclick="submitDirector(`POST`)">Submit</button>'
}

async function submitDirector(method, id = '') {
    let data
    if (method !== 'DELETE') {
        console.log('am intrat')
        data = {
            name: document.getElementById('actorNameInput').value,
            gender: document.getElementById('actorGenderInput').value === 'Male' ? 1 : 0,
            placeOfBirth: document.getElementById('actorPlaceInput').value,
            birthDate: document.getElementById('actorBirthInput').value,
            biography: document.getElementById('actorBiographyInput').value
        }
        if (method === 'POST') {
            data['movieIds'] = []
            data['tvShowIds'] = []
        }
    }
    const link = method === 'POST' ? `${API_URL}/directors` : `${API_URL}/directors/${id}`
    const actorResponse = await (await fetch(link, {
        method: method,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(data)
    })).json()
    console.log(actorResponse)
    const positiveResponse = method === 'POST' ? 'Director successfully added' : method === 'PUT' ? 'Director successfully updated' : 'Director successfully deleted'
    document.getElementById('addMenuFieldList').innerHTML = `<h1>${actorResponse.message ? actorResponse.message : positiveResponse}</h1>`
}

function editDirector() {
    addDirector()
    const nameInput = document.getElementById('actorNameInput')
    nameInput.setAttribute('placeholder', 'Name of the director you want to edit')
    let idActor
    const fieldList = document.getElementById('addMenuFieldList')

    nameInput.addEventListener('keydown', async event => {
        if (event.code === 'Enter' || event.keyCode === 13) {
            const inputField = nameInput.value
            const index = await (await fetch(`${API_URL}/directors?searchBy=${inputField}`)).json()
            if (index['results'].length > 0) {
                const actor = index['results'][0]
                console.log(actor)
                nameInput.value = actor.name
                nameInput.style.color = "green"
                idActor = actor.id
                fieldList.childNodes[6].value = actor.gender === 1 ? 'Male' : 'Female'
                fieldList.childNodes[10].value = actor.birthDate.replace(/T.*/, ' ')
                fieldList.childNodes[14].value = actor.placeOfBirth
                fieldList.childNodes[18].value = actor.biography
                document.getElementById('addMenuSubmitBtn').setAttribute('onclick', `submitDirector('PUT', '${idActor}')`)
            } else {
                nameInput.style.color = "red"
            }
        }
    })
}

function deleteDirector() {
    document.getElementById('addMenuFieldList').innerHTML = '<label>The name of the director you want to delete:</label><br>' +
        '<input id="actorName" type="text"><br>' +
        '<button id="addMenuSubmitBtn">Delete director</button>'

    const actNameField = document.getElementById('actorName')
    let idActor
    actNameField.addEventListener('keydown', async event => {
        if (event.code === 'Enter' || event.keyCode === 13) {
            const inputField = actNameField.value
            const index = await (await fetch(`${API_URL}/directors?searchBy=${inputField}`)).json()
            if (index['results'].length > 0) {
                const actor = index['results'][0]
                actNameField.value = actor.name
                actNameField.style.color = "green"
                idActor = actor.id
                document.getElementById('addMenuSubmitBtn').setAttribute('onclick', `submitDirector('DELETE', '${idActor}')`)
            } else {
                actNameField.style.color = "red"
            }
        }
    })
}

function openProductionCompanyMenu() {
    let fields = document.createElement('div')
    fields.setAttribute('id', 'addMenuFullBody')
    let buttonList = document.createElement('nav')
    buttonList.setAttribute('id', 'addMenuButtonList')
    buttonList.innerHTML += '<button id="addActorBtn" onclick="addProdComp()">Add Company</button>' +
        '<button id="editActorBtn" onclick="editProdComp()">Edit company</button>' +
        '<button id="deleteActorBtn" onclick="deleteProdComp()">Delete company</button><br>'
    fields.append(buttonList)
    let fieldList = document.createElement('div')
    fieldList.setAttribute('id', 'addMenuFieldList')
    fields.append(fieldList)
    openGeneralMenu(fields)
    addProdComp()
}

function addProdComp() {
    document.getElementById('addMenuFieldList').innerHTML = '<label>Name:</label><br>' +
        '<input id="prodCompNameInput" type="text" maxlength="50" placeholder="Fresh company name"><br>' +
        '<label>Description:</label><br>' +
        '<input id="prodCompDescriptionInput" type="text" maxlength="50" placeholder="What the company stands for"><br>' +
        '<label>Headquarters:</label><br>' +
        '<input id="prodCompHeadInput" type="text" placeholder="Where can I visit it?" ><br>' +
        '<label>Country id:</label><br>' +
        '<input id="prodCompCountryInput" type="text" placeholder="ro/ru/us/uk"><br>' +
        '<input id="prodCompCountryId" type="hidden">'+
        '<button id="addMenuSubmitBtn" onclick="submitProdComp(`POST`)">Submit</button>'

    const countryInput=document.getElementById('prodCompCountryInput')
    countryInput.addEventListener('keydown', async event => {
        if (event.code === 'Enter' || event.keyCode === 13) {
            const inputField = countryInput.value
            const index = await (await fetch(`${API_URL}/production-companies/country?searchBy=${inputField}`)).json()
            if (index['results'].length > 0) {
                const actor = index['results'][0]
                countryInput.value = actor.code
                countryInput.style.color = "green"
                document.getElementById('prodCompCountryId').value = actor.id
            } else {
                countryInput.style.color = "red"
            }}})
}

async function submitProdComp(method,id='') {
    let data
    if(method!=='DELETE'){
        console.log('am intrat')
        data = {
            name: document.getElementById('prodCompNameInput').value,
            description: document.getElementById('prodCompDescriptionInput').value,
            countryId: document.getElementById('prodCompCountryId').value,
            headquarters: document.getElementById('prodCompHeadInput').value
        }
        if (method === 'POST') {
            data['movieIds'] = []
            data['tvShowIds'] = []
        }
    }
    const link=method==='POST'? `${API_URL}/production-companies` : `${API_URL}/production-companies/${id}`
    const actorResponse = await (await fetch(link, {
        method: method,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(data)
    })).json()
    console.log(actorResponse)
    const positiveResponse=method==='POST'?'Company successfully added' : method==='PUT' ? 'Company successfully updated' : 'Company successfully deleted'
    document.getElementById('addMenuFieldList').innerHTML = `<h1>${actorResponse.message ? actorResponse.message : positiveResponse}</h1>`
}

function editProdComp() {
    addProdComp()
    const nameInput = document.getElementById('prodCompNameInput')
    nameInput.setAttribute('placeholder','Name of the company you want to edit')
    let idActor
    const fieldList = document.getElementById('addMenuFieldList')
    console.log(fieldList.childNodes)
    nameInput.addEventListener('keydown', async event => {
        if (event.code === 'Enter' || event.keyCode === 13) {
            const inputField = nameInput.value
            const index = await (await fetch(`${API_URL}/production-companies?searchBy=${inputField}`)).json()
            if (index['results'].length > 0) {
                const actor=index['results'][0]
                console.log(actor)
                nameInput.value = actor.name
                nameInput.style.color = "green"
                idActor = actor.id
                fieldList.childNodes[6].value= actor.description
                fieldList.childNodes[10].value=actor.headquarters
                fieldList.childNodes[14].value=actor.countryId
                document.getElementById('addMenuSubmitBtn').setAttribute('onclick',`submitProdComp('PUT', '${idActor}')`)
            } else {
                nameInput.style.color = "red"
            }
        }
    })
}

function deleteProdComp() {
    document.getElementById('addMenuFieldList').innerHTML = '<label>The name of the company you want to delete:</label><br>' +
        '<input id="actorName" type="text"><br>'+
        '<button id="addMenuSubmitBtn">Delete director</button>'

    const actNameField=document.getElementById('actorName')
    let idActor
    actNameField.addEventListener('keydown', async event => {
        if (event.code === 'Enter' || event.keyCode === 13) {
            const inputField = actNameField.value
            const index = await (await fetch(`${API_URL}/production-companies?searchBy=${inputField}`)).json()
            if (index['results'].length > 0) {
                const actor=index['results'][0]
                actNameField.value = actor.name
                actNameField.style.color = "green"
                idActor = actor.id
                document.getElementById('addMenuSubmitBtn').setAttribute('onclick',`submitProdComp('DELETE', '${idActor}')`)
            } else {
                actNameField.style.color = "red"
            }
        }
    })
}

function openSeasonMenu() {
    console.log("I'll open the seasons menu")
    //make window visible
    /*add the fields: showId
                      title
                      description
                      airDate
                      seasonNumber
    */
}

function openEpisodeMenu() {
    console.log("I'll open the episodes menu")
    //make window visible
    /*add the fields: seasonId
                      title
                      description
                      airDate
                      episodeNumber
    */
}