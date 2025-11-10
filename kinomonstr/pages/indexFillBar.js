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

    