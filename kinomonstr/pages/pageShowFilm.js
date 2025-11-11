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

function CreateElementInput(id) {
    CreateElement("input", "input-"+id, "", "rating__items-"+ filmId).classList.add("rating__item");
    document.getElementById("input-"+id).setAttribute('type', "radio");
    document.getElementById("input-"+id).setAttribute('value', id);
    document.getElementById("input-"+id).setAttribute('name', "rating");
}

function BuyTicket() {
    if (selected_seat == 0) {
        alert("Оберіть місце!"); 
        return
    }

    fetch (`/getFirstAndLastName`, {
        method: 'GET',
    })
    .then(res => res.text())
    .then(res => {
        if(res != 0) {
            let user = JSON.parse(res);

            fetch (`/postBuyTicket`, {
                method: 'POST',
                body: JSON.stringify({
                    "user_id": user['user_id'],
                    "seat_number": selected_seat,
                    "film_id": filmId,
                    "date": document.getElementById("form-day-select").value,
                    "time": document.getElementById("form-session-select").value,
               })
            });
            location.reload();
        }
        else return;
    });



}

function SelectSeat(seat_number) {
    if (selected_seat != 0)
        document.getElementById("seat-" + selected_seat).style.backgroundColor = "#337ab7";
    selected_seat = seat_number;
    document.getElementById("seat-" + seat_number).style.backgroundColor = "#ccc";
}

function addSeats(date = document.getElementById("form-day-select").value, time = document.getElementById("form-session-select").value) {
    fetch(`/getSeats/${filmId}/${date}/${time}`, {
         method: 'GET',
    })
         .then(res => res.text())
         .then(res => {
            let seatsTable = JSON.parse(res);
            console.log(seatsTable);
            document.getElementById("modal-body-seats-BuyTicket").innerHTML = "";
            selected_seat = 0;
            CreateElement("span", "row-num-1", "1 ряд", "modal-body-seats-BuyTicket").classList.add("m-04");
            for (let i = 0; i < seatsTable.length; i++)
                if (seatsTable[i]['row_num'] == 1)
                    if (seatsTable[i]['is_available']) {
                        CreateElement("button", "seat-" + seatsTable[i]['seat_number'], seatsTable[i]['seat_number'], "modal-body-seats-BuyTicket").classList.add("m-04", "btn", "btn-primary");
                        document.getElementById("seat-" + seatsTable[i]['seat_number']).setAttribute("onclick", "SelectSeat(" + seatsTable[i]['seat_number'] + ")");
                    }
                    else 
                        CreateElement("button", "seat-" + seatsTable[i]['seat_number'], seatsTable[i]['seat_number'], "modal-body-seats-BuyTicket").classList.add("m-04", "btn", "btn-secondary", "disabled");
        }); 
}

function addOptionsSessions() {
    fetch(`/getSessions/${filmId}/${document.getElementById("form-day-select").value}`, {
         method: 'GET',
    })
         .then(res => res.text())
         .then(res => {
            console.log(res);
            document.getElementById("form-session-select").innerHTML = "";
            let sessionsTable = JSON.parse(res);
            for (let i = 0; i < sessionsTable.length; i++)
                CreateElement("option", "form-session-option-" + i, sessionsTable[i]['start_time'], "form-session-select");
            CreateElement("div", "modal-body-seats-BuyTicket", "", "modal-body-BuyTicket");
            addSeats();
        });
}

function addOptionsDays() {
    fetch(`/getDaysWithSessions/${filmId}`, {
         method: 'GET',
    })
         .then(res => res.text())
         .then(res => {
              let daysTable = JSON.parse(res);
              //console.log("daysTable.length", daysTable.length);
            if (daysTable.length == 0) 
                CreateElement("option", "form-day-option-" + 0, "На жаль сеансів немає", "form-day-select");
            for (let i = 0; i < daysTable.length; i++)
                CreateElement("option", "form-day-option-" + i, daysTable[i]['start_date'], "form-day-select");
            if (daysTable.length > 0) {
                CreateElement("label", "form-session-label", "Оберіть сеанс: ", "modal-body-BuyTicket").classList.add("form-label", "m-04");
                CreateElement("select", "form-session-select", "", "modal-body-BuyTicket").classList.add("form-select", "m-04");
                document.getElementById("form-session-select").setAttribute('onchange', "addSeats()");
                console.log("document.getElementById().value", document.getElementById("form-day-select").value);
                
                addOptionsSessions();
            }
         });
}


var filmId = localStorage.getItem("FILM_ID");
var rating = 10;
let user_grade = 10;
let selected_seat = 0;

console.log("filmId", filmId);
fetch (`/getFilmDetails/${filmId}`, {
    method: 'GET',
}) 
.then(res => res.text())
.then(res => {
//    console.log(res);

    let filmTable = JSON.parse(res)[0];
    rating = filmTable['rating'].toFixed(1)
    CreateElement("h1", "hFilm-" + filmId, filmTable['name'], "totalInfoFilm");    
    CreateElement("hr", "hr1Film-" + filmId, "", "totalInfoFilm"); 
    CreateElement("div", "trailerFilm-" + filmId, "", "totalInfoFilm").classList.add("embed-responsive", "embed-responsive-16by9");       
    CreateElement("iframe", "iframeFilm-" + filmId, "", "trailerFilm-" + filmId).classList.add("embed-responsive-item");
    document.getElementById("iframeFilm-" + filmId).setAttribute('src', "assets/trailers/"+filmTable['trailer']);
    document.getElementById("iframeFilm-" + filmId).setAttribute('frameborder', "0");
    document.getElementById("iframeFilm-" + filmId).setAttribute('allow', "autoplay; encrypted-media");
    document.getElementById("iframeFilm-" + filmId).setAttribute('allowfullscreen', "true");
    CreateElement("div", "infoFilm-" + filmId, "", "totalInfoFilm").classList.add("well", "info-block", "text-center");
    CreateElement("span", "ratingFilm-" + filmId, "Рейтинг: " + filmTable['rating'].toFixed(1), "infoFilm-"+ filmId).classList.add("badge"); 
    CreateElement("span", "genresFilm-" + filmId, "Жанри: "+filmTable['film_genres'], "infoFilm-"+ filmId).classList.add("badge");      
    CreateElement("span", "directorFilm-" + filmId, "Тривалість: " + filmTable['duration'] + " хв", "infoFilm-"+ filmId).classList.add("badge"); 
    CreateElement("div", "marginFilm-" + filmId, "", "totalInfoFilm").classList.add("margin-8r");
    CreateElement("h2", "h2Film-" + filmId, "Опис " + filmTable['name'], "totalInfoFilm"); 
    CreateElement("hr", "hr2Film-" + filmId, "", "totalInfoFilm"); 
    CreateElement("div", "descriptionFilm-" + filmId, filmTable['description'] , "totalInfoFilm").classList.add("well");
    CreateElement("div", "but-ticket-temp-" + filmId, "", "totalInfoFilm");

    fetch (`/getFirstAndLastName`, {
        method: 'GET',
    })
    .then(res => res.text())
    .then(res => {
        if(res != 0) {
            CreateElement("button", "button-buy-ticket" + filmId, "Купити квиток", "but-ticket-temp-" + filmId).classList.add("btn", "btn-lg", "btn-warning");
            document.getElementById("button-buy-ticket" + filmId).setAttribute('data-toggle', "modal");
            document.getElementById("button-buy-ticket" + filmId).setAttribute('data-target', "#modalBuyTicket");
            CreateElement("div", "modalBuyTicket", "", "but-ticket-temp-" + filmId).classList.add("modal", "fade");
            CreateElement("div", "modal-dialog-BuyTicket", "", "modalBuyTicket").classList.add("modal-dialog");
            CreateElement("div", "modal-content-BuyTicket", "", "modal-dialog-BuyTicket").classList.add("modal-content");
            CreateElement("div", "modal-header-BuyTicket", "", "modal-content-BuyTicket").classList.add("modal-header");
            CreateElement("h2", "modal-title-BuyTicket", "Доступні сеанси", "modal-header-BuyTicket").classList.add("modal-title");
            CreateElement("div", "modal-body-BuyTicket", "", "modal-content-BuyTicket").classList.add("modal-body");
            CreateElement("div", "modal-footer-BuyTicket", "", "modal-content-BuyTicket").classList.add("modal-footer");
            CreateElement("button", "button-secondary-BuyTicket", "Закрити", "modal-footer-BuyTicket").classList.add("btn", "btn-secondary");
            document.getElementById("button-secondary-BuyTicket").setAttribute('data-dismiss', "modal");

            CreateElement("button", "button-primary-BuyTicket", "Купити квиток", "modal-footer-BuyTicket").classList.add("btn", "btn-primary");
            document.getElementById("button-primary-BuyTicket").setAttribute('onclick', "BuyTicket()");

            CreateElement("label", "form-day-label", "Оберіть доступну дату: ", "modal-body-BuyTicket").classList.add("form-label", "m-04");
            CreateElement("select", "form-day-select", "", "modal-body-BuyTicket").classList.add("form-select", "m-04");
            document.getElementById("form-day-select").setAttribute('onchange', "addOptionsSessions()");
            addOptionsDays();
        }
    });
/*
<div class="modal fade" id="modalBuyTicket">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <h2 class="modal-title" id="exampleModalLabel">Доступні сеанси</h2>
      </div>
      <div class="modal-body">
        ...
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-dismiss="modal">Закрыть</button>
        <button type="button" class="btn btn-primary">Забронювати квиток</button>
      </div>
    </div>
  </div>
</div>*/


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

    //fetch (`/БРАТЬ СЕАНСЫ И МЕСТА`, {
    //    method: 'GET',
    //});



    return fetch (`/getFirstAndLastName`, {
        method: 'GET',
    });
})
.then(res2 => res2.text())
.then(res2 => {
    //console.log("res2::", res2);
    if(res2 != 0) {

    let user = JSON.parse(res2);
    CreateElement("form", "formReview-" + filmId, "", "panelCommentsFilm-"+ filmId).classList.add("custom-mt-3");
    CreateElement("h1", "newComment-" + filmId, "Залиште відгук!", "formReview-"+ filmId).classList.add("mt-2");
    CreateElement("div", "newFeedback-" + filmId, "", "formReview-"+ filmId).classList.add("feedback");
    CreateElement("div", "rating-" + filmId, "", "newFeedback-"+ filmId).classList.add("rating", "rating_set");
    CreateElement("div", "rating__body-" + filmId, "", "rating-"+ filmId).classList.add("rating__body");
    CreateElement("div", "rating__active-" + filmId, "", "rating__body-"+ filmId).classList.add("rating__active");
    CreateElement("div", "rating__items-" + filmId, "", "rating__body-"+ filmId).classList.add("rating__items");
    CreateElementInput(1);
    CreateElementInput(2);
    CreateElementInput(3);
    CreateElementInput(4);
    CreateElementInput(5);
    CreateElementInput(6);
    CreateElementInput(7);
    CreateElementInput(8);
    CreateElementInput(9);
    CreateElementInput(10);

    CreateElement("p", "rating__header-" + filmId, "Оцінка фільму: ", "rating-"+ filmId).classList.add("rating__header");
    CreateElement("p", "rating__value-" + filmId, rating, "rating-"+ filmId).classList.add("rating__value");
    user_grade = rating;
    CreateElement("div", "newUserNameReview-" + filmId, "", "formReview-"+ filmId).classList.add("form-group");
    CreateElement("input", "inputNameReview-" + filmId, "", "newUserNameReview-"+ filmId).classList.add("form-control", "input-lg");
    document.getElementById("inputNameReview-" + filmId).setAttribute('type', "text");

    
    document.getElementById("inputNameReview-" + filmId).setAttribute('placeholder', user['first_name'] + " " + user['last_name']);
    document.getElementById("inputNameReview-" + filmId).setAttribute('disabled', 'disabled');

    CreateElement("div", "newReviewArea-" + filmId, "", "formReview-"+ filmId).classList.add("form-group");
    CreateElement("textarea", "textareaReview-" + filmId, "", "newReviewArea-"+ filmId).classList.add("form-control");
    CreateElement("button", "buttonSendReview-" + filmId, "Відправити", "formReview-"+ filmId).classList.add("btm", "btn-lg","btn-warning", "pull-right");

    CreateElement("div", "marginCommentsFilm-" + filmId, "", "commentsFilm-" + filmId).classList.add("margin-8"); 

    document.getElementById("buttonSendReview-" + filmId).onclick = function () {
          var userData = {
              film_id: filmId,
              user_id: user['user_id'],
              grade: user_grade, 
              comment: document.getElementById("textareaReview-" + filmId).value
          };
          var xhr = new XMLHttpRequest(); 
          xhr.open('POST', '/postReviewToDB'); 
           

          xhr.setRequestHeader('Content-Type', 'application/json'); 
          xhr.send(JSON.stringify(userData)); 

          xhr.onload = function() {
            if (xhr.status === 200) {
                  alert(this.responseText); 
                  location.reload();
            }
            else if (xhr.status === 409) {
                alert('user not found!');
            }
            else if (xhr.status === 404) {
                alert('wrong password!');
            }
          }; 

          xhr.onerror = function() {
              alert('server error!'); 
          }

      }

}
}).then(res2 => {
    if(res2 != 0) {

        const ratings = document.querySelectorAll(".rating");
        if (ratings.length>0){
        initRatings();
        }

        function initRatings(){
            let ratingActive, ratingValue, ratingHeader;
            let temp = 0;
            for(let index = 0; index < ratings.length; index++){
                const rating = ratings[index];
                initRating(rating);
            }

            function initRating(rating){
                initRatingVars(rating);


                setRatingActiveWidth();

                if (rating.classList.contains('rating_set')){
                    setRating(rating);
                }
            }

            function initRatingVars(rating){
                ratingActive = rating.querySelector(".rating__active");
                ratingValue = rating.querySelector(".rating__value");
                ratingHeader = rating.querySelector(".rating__header");
            }

            function setRatingActiveWidth(index=ratingValue.innerHTML){
                const ratingActiveWidth = index / 0.1;
                console.log("index", index);
                ratingActive.style.width = `${ratingActiveWidth}%`;
            }

            function setRating(rating){
                const ratingItems = rating.querySelectorAll(".rating__item");
                for (let index =0; index < ratingItems.length;index++){
                    const ratingItem = ratingItems[index];
                    ratingItem.addEventListener("mouseover", function(e){
                        if (temp != index+1) {
                            temp = index+1;
                            //initRatings(rating);
                            setRatingActiveWidth(ratingItem.value);
                        }
                    });

                    ratingItem.addEventListener("mouseleave", function(e){
                        setRatingActiveWidth();
                    })

                    ratingItem.addEventListener("click", function(e){
                        initRatingVars(rating);
                        ratingHeader.innerHTML = "Ваша оцінка: ";
                        ratingValue.innerHTML = index+1;
                        user_grade = index+1;
                        setRatingActiveWidth();
                    })
                }
            }
        }
    }
})