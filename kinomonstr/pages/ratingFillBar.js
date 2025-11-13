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
 * Stores the film ID in the local storage to be accessed later.
 * This function is called when a user clicks on a film name to view its details.
 *
 * @function showFilmDetails
 * @param {number} filmId - The unique identifier for the film whose details are to be shown.
 * @returns {void} - Stores the film ID in local storage under the key 'FILM_ID'.
 */
function showFilmDetails(filmId) {
    localStorage.setItem("FILM_ID", filmId);
}

/**
 * Fetches film ratings from the database and displays them in a list.
 * The function sends a GET request to the '/getRatingFilmsFromDB' endpoint to retrieve film ratings.
 * It then dynamically creates HTML elements to display the films in a list format, with their respective ratings.
 * 
 * Each film is represented by a list item (`<li>`) that contains:
 * - The film's name, which is clickable and leads to a detailed view (`show.html`).
 * - The film's rating, displayed as a badge next to the film's name.
 * 
 * The `showFilmDetails` function is called when a user clicks on the film's name, which stores the film ID in the local storage for later access.
 *
 * @function fetchAndDisplayFilms
 * @returns {void} - Sends a GET request to the '/getRatingFilmsFromDB' endpoint and processes the response to display the film list.
 */
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
            CreateElement("span", "countRating-" + filmId,  filmsTable[i]['rating'].toFixed(1), "liFilm-" + filmId).classList.add("badge");
            CreateElement("a", "name-Film-" + filmId,  filmsTable[i]['name'], "liFilm-" + filmId);
            document.getElementById("name-Film-" + filmId).setAttribute('href', "show.html");
            document.getElementById("name-Film-" + filmId).setAttribute("onclick", "showFilmDetails(" + filmId + ")");
         }
    });

