myStorage = window.localStorage;

/**
 * Creates a new HTML element with specified properties and appends it to a parent element.
 * 
 * @function CreateElement
 * @param {string} nameElement - The type of the element to create (e.g., "div", "span", "p").
 * @param {string} idElement - The id attribute for the new element.
 * @param {string} innerText - The inner text content for the new element.
 * @param {string} parentId - The id of the parent element to which the new element will be appended.
 * @returns {HTMLElement} The created HTML element.
 * @description 
 * This function creates a new element with the provided tag name, id, inner text, and appends it
 * to the specified parent element. If the parent element's id is "body", it appends to the body of the page.
 * Otherwise, it appends to the element with the provided parent id.
 */
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

/**
 * Saves the film ID to local storage when a film is selected for viewing in more detail.
 * 
 * @function showFilmDetails
 * @param {number} filmId - The ID of the selected film.
 * @description 
 * This function stores the provided film ID in the localStorage under the key "FILM_ID".
 * This allows the selected film to be viewed in more detail on a different page.
 */
function showFilmDetails(filmId) {
     localStorage.setItem("FILM_ID", filmId);
}

 /**
 * Fetches the list of films from the server and dynamically creates HTML elements 
 * to display the films in a catalog format.
 * 
 * @function fetchAndDisplayFilms
 * @description 
 * This function sends a GET request to fetch the list of films from the server. 
 * It then parses the JSON response and dynamically creates HTML elements to display 
 * each film's poster, name, director, genres, duration, and description in the "filmsCatalog" element.
 * Each film will have a "Details" button that allows the user to view more information about the film.
 */
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


