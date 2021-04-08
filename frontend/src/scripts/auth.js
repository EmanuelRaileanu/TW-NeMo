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

function login () {
    let username
    if (isLogin) {
        username = document.getElementById('loginUsername').value;
    } else {
        username = document.getElementById('registerUsername').value;
    }
    sessionStorage.setItem('contentPage', 'homepage')
    sessionStorage.setItem('username', username);
    parent.document.getElementById('auth').innerText = username;
    window.location.replace('./homepage.html')
}