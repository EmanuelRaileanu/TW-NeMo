function writeToHTML(descriptions, names, paths, ratings, btnName, fctName) {
    for (let i = 0; i < names.length; i++) {
        document.getElementById("name" + i).innerHTML = names[i];
        document.getElementById("img" + i).setAttribute("src", paths[i]);
        document.getElementById("desc" + i).innerHTML = descriptions[i];
        document.getElementById("rat" + i).innerHTML = ratings[i];
    }
    document.getElementById("btnChange").innerHTML = btnName;
    document.getElementById("btnChange").setAttribute("onclick", fctName);
}

function changeToShows() {
    const showsDesc = ["A woman who moves into an apartment across the hall from two brilliant but socially awkward physicists shows them how little they know about life outside of the laboratory. ",
        "Lucifer Morningstar has decided he's had enough of being the dutiful servant in Hell and decides to spend some time on Earth to better understand humanity. He settles in Los Angeles - the City of Angels.",
        "Geralt of Rivia, a solitary monster hunter, struggles to find his place in a world where people often prove more wicked than beasts. "];
    const showsRat = ["Rating: 7.6/10",
        "Rating: 8.1/10",
        "Rating: 8.2/10"];
    const showsPath = ["bigbang.jpg",
        "lucifer.jpg",
        "thewitcher.jpg"];
    const showsName = ["The Big Bang Theory",
        "Lucifer",
        "The Witcher"];
    writeToHTML(showsDesc, showsName, showsPath, showsRat, "Movies", "changeToFilms()");
}

function changeToFilms() {
    const filmsDesc = ["The Dark Knight of Gotham City begins his war on crime with his first major enemy being Jack Napier, a criminal who becomes the clownishly homicidal Joker. ",
        "The Flash is an upcoming 2022 superhero film based on the DC Comics character of the same name. It will be the twelfth installment in the DC Extended Universe, and it is scheduled to be released on November 4, 2022.",
        "Superman returns to Earth after spending five years in space examining his homeworld Krypton. But he finds things have changed while he was gone, and he must once again prove himself important to the world. "];
    const filmsRat = ["Rating: 7.5/10 ",
        "Rating: 11/10",
        "Rating: 6/10"];
    const filmsPath = ["batman.jpg",
        "flash.jpg",
        "superman.jpg"];
    const filmsName = ["Batman",
        "Flash",
        "Superman"];
    writeToHTML(filmsDesc, filmsName, filmsPath, filmsRat, "TV Shows", "changeToShows()");
}

changeToFilms();