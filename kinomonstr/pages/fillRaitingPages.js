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
 * Stores the selected film's ID in the local storage for display on the details page.
 * 
 * @function showFilmDetails
 * @param {number} filmId - The ID of the film whose details are to be displayed.
 * @returns {void} - Saves the film ID to the local storage under the key "FILM_ID".
 */
function showFilmDetails(filmId) {
    localStorage.setItem("FILM_ID", filmId);
}

/**
 * Fetches the film ratings from the server, then dynamically creates a table displaying film details
 * including poster, name, genres, and rating.
 * 
 * The table consists of several columns:
 * - A column with the film poster.
 * - A column with a link to the film details page.
 * - A column showing the film genres.
 * - A column displaying the film's rating in a badge style.
 * 
 * The film name is a clickable link that, when clicked, stores the selected film's ID in local storage
 * and redirects the user to the "show.html" page.
 * 
 * @function loadFilmRatings
 * @returns {void} - Fetches the film ratings, processes the response, and populates the HTML table.
 */
fetch('/getRatingAllFilmsFromDB', {
    method: 'GET',
})
    .then(res => res.text())
    .then(res => {
         typeof (res);
         let filmsTable = JSON.parse(res);        
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
            CreateElement("span", "span-raitingTable-" + filmId, filmsTable[i]['rating'].toFixed(1), "td4-raitingTable-" + filmId).classList.add("badge");

        }
    });
