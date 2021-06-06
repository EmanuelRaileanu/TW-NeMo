const AUTH_SERVICE_URL = 'http://stachyon.asuscomm.com:8000'

let isLogin = true;
function changeToForm (id) {
    document.getElementById(id).style.display = 'flex';
    if (id === 'signup') {
        isLogin = false;
        document.getElementById('login').style.display = 'none';
    } else {
        isLogin = true;
        document.getElementById('signup').style.display = 'none';
    }
}

async function login () {
    if (isLogin) {
        const username = document.getElementById('loginUsername').value;
        const password = document.getElementById('loginPassword').value;

        const loginResponse = await fetch(`${AUTH_SERVICE_URL}/auth/login`, {
            method: 'POST',
            mode: 'cors',
            cache: 'no-cache',
            credentials: 'same-origin',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            redirect: 'follow',
            referrerPolicy: 'no-referrer',
            body: JSON.stringify({ username, password })
        });

        const loginResponseJSON = await loginResponse.json();

        if (loginResponse.status === 200) {

            localStorage.setItem('token', loginResponseJSON.token)
            localStorage.setItem('tokenExpiry', loginResponseJSON.expiresAt)

            sessionStorage.setItem('contentPage', 'homepage');
            localStorage.setItem('username', username);
            parent.document.getElementById('auth').innerText = username;
            window.location.replace('./homepage.html');
        } else {
            alert(loginResponseJSON.message);
        }
    } else {
        const username = document.getElementById('registerUsername').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        const confirmedPassword = document.getElementById('registerConfirmPassword').value;

        const registerResponse = await fetch(`${AUTH_SERVICE_URL}/auth/register`, {
            method: 'POST',
            mode: 'cors',
            cache: 'no-cache',
            credentials: 'same-origin',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            redirect: 'follow',
            referrerPolicy: 'no-referrer',
            body: JSON.stringify({
                username,
                email,
                password,
                confirmedPassword
            })
        });

        const registerResponseJSON = await registerResponse.json();

        if (registerResponse.status === 200) {

            localStorage.setItem('token', registerResponseJSON.token)
            localStorage.setItem('tokenExpiry', registerResponseJSON.expiresAt)

            sessionStorage.setItem('contentPage', 'homepage');
            localStorage.setItem('username', username);
            parent.document.getElementById('auth').innerText = username;
            window.location.replace('./homepage.html');
        } else {
            alert(registerResponseJSON.message);
        }
    }
}