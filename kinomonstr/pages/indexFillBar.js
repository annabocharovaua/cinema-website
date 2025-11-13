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
 * Sets the selected film's ID in the local storage to be used on the details page.
 * 
 * @function showFilmDetails
 * @param {number} filmId - The ID of the film whose details are to be displayed.
 * @returns {void} - Stores the film ID in the local storage under the key "FILM_ID".
 */
function showFilmDetails(filmId) {
     localStorage.setItem("FILM_ID", filmId);
}

 /**
 * Fetches the latest film posters from the database, then dynamically creates and displays film posters
 * on the webpage, categorizing them into two rows of posters. 
 * Each film poster is clickable and will set the selected film's ID to local storage for display on the details page.
 * 
 * - Displays the first 4 films in a single row.
 * - Displays additional films in a second row if there are more than 4 films.
 * 
 * The created film posters are linked to the "show.html" page and set the `showFilmDetails` function on click.
 * 
 * @function loadFilmPosters
 * @returns {void} - Fetches the film posters, parses the response, and displays them in the DOM.
 */
fetch('/getPosterNewFilmsFromDB', {
    method: 'GET',
})
    .then(res => res.text())
    .then(res => {
         typeof (res);
         let filmsPosterTable = JSON.parse(res);
         var counter = 1;
         for (let i = filmsPosterTable.length-1; i > filmsPosterTable.length-9 && i >= 0; i--) {
            var filmId = filmsPosterTable[i]['film_id'];
            if (counter <= 4) {
            CreateElement("div", "posterFilm-" + filmId, "", "posterFilmsCatalog").classList.add("films_block", "col-lg-3", "col-md-3", "col-sm-3", "col-xs-6");
            CreateElement("a", "a-imgPoster-" + filmId, "", "posterFilm-" + filmId);
            CreateElement("img", "imgPoster-" + filmId, "", "a-imgPoster-" + filmId);
            document.getElementById("imgPoster-" + filmId).setAttribute('src', "assets/img/"+filmsPosterTable[i]['poster']);
            CreateElement("div", "nameFilm-" + filmId,  filmsPosterTable[i]['name'], "posterFilm-" + filmId).classList.add("film_labbel");

            document.getElementById("a-imgPoster-" + filmId).setAttribute('href', "show.html");
            document.getElementById("a-imgPoster-" + filmId).setAttribute("onclick", "showFilmDetails(" + filmId + ")");
          }

          if (counter == 4) {

               let element = document.createElement("div");
               element.id = "row2";
               element.innerText = "";
               element.classList.add("row", "media");
               document.getElementById("posterFilmsCatalog").insertAdjacentElement('afterend', element);
          }
          else if (counter > 4) {
               CreateElement("div", "row2-posterFilm-" + filmId, "", "row2").classList.add("films_block", "col-lg-3", "col-md-3", "col-sm-3", "col-xs-6");
               CreateElement("a", "a-imgPoster-" + filmId, "", "row2-posterFilm-" + filmId);
               CreateElement("img", "row2-imgPoster-" + filmId, "", "a-imgPoster-" + filmId);
               document.getElementById("row2-imgPoster-" + filmId).setAttribute('src', "assets/img/"+filmsPosterTable[i]['poster']);


               document.getElementById("a-imgPoster-" + filmId).setAttribute('href', "show.html");
               document.getElementById("a-imgPoster-" + filmId).setAttribute("onclick", "showFilmDetails(" + filmId + ")");
   
               CreateElement("div", "row2-nameFilm-" + filmId,  filmsPosterTable[i]['name'], "row2-posterFilm-" + filmId).classList.add("film_labbel");

          }
          counter++;
     }
    });

    