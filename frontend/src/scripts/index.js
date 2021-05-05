window.onload = function () {
    const iframePageId = sessionStorage.getItem('contentPage');
    if (iframePageId) {
        document.getElementById('mainFrame').src = iframePageId + '.html';
    } else {
        document.getElementById('mainFrame').src = 'homepage.html';
    }
    const username = sessionStorage.getItem('username')
    if (username) {
        document.getElementById('auth').innerText = username;
    } else {
        document.getElementById('auth').innerText = 'Log In';
    }
}

function navigateTo (id) {
    document.getElementById('mainFrame').src = id + '.html';
    sessionStorage.setItem('contentPage', id);
}