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

fetch('/getRatingAllFilmsFromDB', {
    method: 'GET',
})
    .then(res => res.text())
    .then(res => {
         typeof (res);
         let filmsTable = JSON.parse(res);        
         console.log("AAAAAAAAAAAAAAAAAAAAAAAAAA")
         console.log(filmsTable);
         for (let i = 0; i < filmsTable.length; i++) {
            var filmId = filmsTable[i]['film_id'];
            CreateElement("tr", "tr-raitingTable-" + filmId, "", "raitingTable");
            CreateElement("td", "td1-raitingTable-" + filmId, "", "tr-raitingTable-" + filmId).classList.add("col-lg-1", "col-md-1", "col-xs-2");
            CreateElement("img", "img-raitingTable-" + filmId, "", "td1-raitingTable-" + filmId).classList.add("img-responsive", "img-thumbnail");
            document.getElementById("img-raitingTable-" + filmId).setAttribute('src', "assets/img/" + filmsTable[i]['poster']);
            CreateElement("td", "td2-raitingTable-" + filmId, "", "tr-raitingTable-" + filmId).classList.add("vert-align");
            CreateElement("a", "a-raitingTable-" + filmId, filmsTable[i]['name'], "td2-raitingTable-" + filmId);
            document.getElementById("a-raitingTable-" + filmId).setAttribute('href', "show.html");
            document.getElementById("a-raitingTable-" + filmId).setAttribute("onclick", "showFilmDetails(" + filmId + ")");
            CreateElement("td", "td3-raitingTable-" + filmId, filmsTable[i]['film_genres'], "tr-raitingTable-" + filmId).classList.add("text-center", "vert-align");
            CreateElement("td", "td4-raitingTable-" + filmId, "", "tr-raitingTable-" + filmId).classList.add("text-center", "vert-align");
            CreateElement("span", "span-raitingTable-" + filmId, filmsTable[i]['rating'], "td4-raitingTable-" + filmId).classList.add("badge");

        }
    });
