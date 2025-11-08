myStorage = window.localStorage;


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

fetch('/getFilmsFromDB', {
    method: 'GET',
})
    .then(res => res.text())
    .then(res => {
         typeof (res);
         let filmsTable = JSON.parse(res);
         for (let i = 0; i < filmsTable.length; i++) {
            var filmId = filmsTable[i]['film_id'];
            CreateElement("div", "rowFilm-" + filmId, "", "filmsCatalog").classList.add("row");
            CreateElement("div", "wellFilm-" + filmId, "", "rowFilm-" + filmId).classList.add("well", "clearfix");
            CreateElement("div", "posterFilm-" + filmId, "", "wellFilm-" + filmId).classList.add("col-lg-3", "col-md-2", "text-center");
            CreateElement("img", "imgFilm-" + filmId, "", "posterFilm-" + filmId).classList.add("img-thumbnail");
            document.getElementById("imgFilm-" + filmId).setAttribute('src', "assets/img/"+filmsTable[i]['poster']);
            document.getElementById("imgFilm-" + filmId).setAttribute('alt', filmsTable[i]['name']);
            CreateElement("div", "descriptionFilm-" + filmId, "", "wellFilm-" + filmId).classList.add("col-lg-9", "col-md-10");
            CreateElement("b", "nameFilmDiv-" + filmId, "Назва: ", "descriptionFilm-" + filmId);
            CreateElement("span", "nameFilm-" + filmId, filmsTable[i]['name'], "descriptionFilm-" + filmId);
            CreateElement("p", "directorFilmDivP-" + filmId, "", "descriptionFilm-" + filmId);
            CreateElement("b", "directorFilmDiv-" + filmId, "Режисер: ", "descriptionFilm-" + filmId);
            CreateElement("span", "directorFilm-" + filmId, filmsTable[i]['director'], "descriptionFilm-" + filmId);
            CreateElement("p", "genresFilmDivP-" + filmId, "", "descriptionFilm-" + filmId);
            CreateElement("b", "genresFilmDiv-" + filmId, "Жанри: ", "descriptionFilm-" + filmId);
            CreateElement("span", "genresFilm-" + filmId, filmsTable[i]['film_genres'], "descriptionFilm-" + filmId);
            CreateElement("p", "durationFilmDivP-" + filmId, "", "descriptionFilm-" + filmId);
            CreateElement("b", "durationFilmDiv-" + filmId, "Тривалість: ", "descriptionFilm-" + filmId);
            CreateElement("span", "durationFilm-" + filmId, filmsTable[i]['duration'] + " хв", "descriptionFilm-" + filmId);
          
            CreateElement("p", "descriptionTextFilmDivP-" + filmId, "", "descriptionFilm-" + filmId);

            CreateElement("p", "descriptionTextFilm-" + filmId, filmsTable[i]['description'], "descriptionFilm-" + filmId);
            CreateElement("div", "detailsFilm-" + filmId, "", "wellFilm-" + filmId).classList.add("col-lg-12");
            CreateElement("a", "hrefFilm-" + filmId, "Детальніше", "detailsFilm-" + filmId).classList.add("btn", "btn-lg","btn-warning", "pull-right");

            document.getElementById("hrefFilm-" + filmId).setAttribute("onclick", "showFilmDetails(" + filmId + ")");
            document.getElementById("hrefFilm-" + filmId).setAttribute('href', "show.html");           
         }
    });


