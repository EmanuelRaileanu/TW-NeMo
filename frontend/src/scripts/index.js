window.onload = function () {
    const iframePageId = sessionStorage.getItem('contentPage');
    if (iframePageId) {
        document.getElementById('mainFrame').src = iframePageId + '.html';
    } else {
        document.getElementById('mainFrame').src = 'homepage.html';
    }
    let token = localStorage.getItem('token');
    const tokenExpiry = localStorage.getItem('tokenExpiry');
    if (new Date() > new Date(tokenExpiry)) {
        localStorage.removeItem('token');
        localStorage.removeItem('tokenExpiry');
        token = null;
    }
    const username = localStorage.getItem('username');
    if (token) {
        document.getElementById('auth').innerText = username;
    } else {
        localStorage.removeItem('username');
        document.getElementById('auth').innerText = 'Log In';
    }
}

function navigateTo (id) {
    if (id === 'auth' && localStorage.getItem('token') && new Date() < new Date(localStorage.getItem('tokenExpiry'))) {
        id = 'profile';
    }
    document.getElementById('mainFrame').src = id + '.html';
    sessionStorage.setItem('contentPage', id);
}