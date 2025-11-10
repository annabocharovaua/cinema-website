function CreateElement(nameElement, idElement, innerText, parentId) {
    let element = document.createElement(nameElement);
    element.id = idElement;
    element.innerText = innerText;
    if (parentId == "body")
         document.body.appendChild(element);
    else
         document.getElementById(parentId).appendChild(element);
    return element;
}
function showFilmDetails(filmId) {
    localStorage.setItem("FILM_ID", filmId);
}

fetch('/getRatingFilmsFromDB', {
    method: 'GET',
})
    .then(res => res.text())
    .then(res => {
         typeof (res);
         let filmsTable = JSON.parse(res);        
         console.log(filmsTable);
         for (let i = 0; i < filmsTable.length; i++) {
            var filmId = filmsTable[i]['film_id'];
            CreateElement("li", "liFilm-" + filmId, "", "panelListRatings").classList.add("list-group-item", "list-group-warning");
            CreateElement("span", "countRating-" + filmId,  filmsTable[i]['rating'], "liFilm-" + filmId).classList.add("badge");
            CreateElement("a", "name-Film-" + filmId,  filmsTable[i]['name'], "liFilm-" + filmId);
            document.getElementById("name-Film-" + filmId).setAttribute('href', "show.html");
            document.getElementById("name-Film-" + filmId).setAttribute("onclick", "showFilmDetails(" + filmId + ")");
         }
    });

