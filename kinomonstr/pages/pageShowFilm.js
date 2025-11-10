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

var filmId = localStorage.getItem("FILM_ID");
console.log("filmId", filmId);
fetch (`/getFilmDetails/${filmId}`, {
    method: 'GET',
}) 
.then(res => res.text())
.then(res => {
    console.log(res);
    let filmTable = JSON.parse(res)[0];
             
    CreateElement("h1", "hFilm-" + filmId, filmTable['name'], "totalInfoFilm");    
    CreateElement("hr", "hr1Film-" + filmId, "", "totalInfoFilm"); 
    CreateElement("div", "trailerFilm-" + filmId, "", "totalInfoFilm").classList.add("embed-responsive", "embed-responsive-16by9");       
    CreateElement("iframe", "iframeFilm-" + filmId, "", "trailerFilm-" + filmId).classList.add("embed-responsive-item");
    document.getElementById("iframeFilm-" + filmId).setAttribute('src', "assets/trailers/"+filmTable['trailer']);
    document.getElementById("iframeFilm-" + filmId).setAttribute('frameborder', "0");
    document.getElementById("iframeFilm-" + filmId).setAttribute('allow', "autoplay; encrypted-media");
    document.getElementById("iframeFilm-" + filmId).setAttribute('allowfullscreen', "true");
    CreateElement("div", "infoFilm-" + filmId, "", "totalInfoFilm").classList.add("well", "info-block", "text-center");
    CreateElement("span", "ratingFilm-" + filmId, "Рейтинг: " + filmTable['rating'], "infoFilm-"+ filmId).classList.add("badge"); 
    CreateElement("span", "genresFilm-" + filmId, "Жанри: "+filmTable['film_genres'], "infoFilm-"+ filmId).classList.add("badge");      
    CreateElement("span", "directorFilm-" + filmId, "Тривалість: " + filmTable['duration'] + " хв", "infoFilm-"+ filmId).classList.add("badge"); 
    CreateElement("div", "marginFilm-" + filmId, "", "totalInfoFilm").classList.add("margin-8r");
    CreateElement("h2", "h2Film-" + filmId, "Опис " + filmTable['name'], "totalInfoFilm"); 
    CreateElement("hr", "hr2Film-" + filmId, "", "totalInfoFilm"); 
    CreateElement("div", "descriptionFilm-" + filmId, filmTable['description'] , "totalInfoFilm").classList.add("well");

    CreateElement("div", "commentsFilm-" + filmId, "", "totalInfoFilm").classList.add("margin-8"); 
    CreateElement("h2", "h2commentsFilm-" + filmId, "Відгуки", "commentsFilm-"+ filmId); 
    CreateElement("hr", "hrcomments1Film-" + filmId, "", "commentsFilm-"+ filmId); 
    CreateElement("div", "panelCommentsFilm-" + filmId, "", "commentsFilm-"+ filmId).classList.add("panel", "panel-info");

    for (let i = 0; i < filmTable['film_reviews'].length; i++) {
        CreateElement("div", "nameUser-" + i, "", "panelCommentsFilm-"+ filmId).classList.add("panel-heading"); 
        CreateElement("i", "iReviewFilm-" + i, "", "nameUser-"+ i).classList.add("glyphicon", "glyphicon-user");
        CreateElement("span", "spanNameUser-" + i, " " + filmTable['film_reviews'][i]['first_name'] + ' ' + filmTable['film_reviews'][i]['last_name'] , "iReviewFilm-"+ i);
        CreateElement("div", "reviewText-" + i, filmTable['film_reviews'][i]['review_text'] , "panelCommentsFilm-"+ filmId).classList.add("panel-body","custom-mb-2"); 
    }

    CreateElement("form", "formReview-" + filmId, "", "panelCommentsFilm-"+ filmId).classList.add("custom-mt-3");
    CreateElement("div", "newUserNameReview-" + filmId, "", "formReview-"+ filmId).classList.add("form-group");
    CreateElement("input", "inputNameReview-" + filmId, "", "newUserNameReview-"+ filmId).classList.add("form-control", "input-lg");
    document.getElementById("inputNameReview-" + filmId).setAttribute('type', "text");
    document.getElementById("inputNameReview-" + filmId).setAttribute('placeholder', "Ваше ім'я");
    CreateElement("div", "newReviewArea-" + filmId, "", "formReview-"+ filmId).classList.add("form-group");
    CreateElement("textarea", "textareaReview-" + filmId, "", "newReviewArea-"+ filmId).classList.add("form-control");
    CreateElement("button", "buttonSendReview-" + filmId, "Відправити", "formReview-"+ filmId).classList.add("btm", "btn-lg","btn-warning", "pull-right");

    CreateElement("div", "marginCommentsFilm-" + filmId, "", "commentsFilm-" + filmId).classList.add("margin-8"); 
            
    }
)
