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
 * Creates a radio button input element for a rating item and appends it to a specified container.
 * The radio button is used for selecting a rating value for a film.
 *
 * @function CreateElementInput
 * @param {number} id - The identifier for the rating option.
 * @returns {void} - Creates and appends an input element of type "radio" to the DOM.
 */
function CreateElementInput(id) {
    CreateElement("input", "input-"+id, "", "rating__items-"+ filmId).classList.add("rating__item");
    document.getElementById("input-"+id).setAttribute('type', "radio");
    document.getElementById("input-"+id).setAttribute('value', id);
    document.getElementById("input-"+id).setAttribute('name', "rating");
}

/**
 * Handles the ticket purchasing process.
 * Verifies if a seat has been selected, retrieves the user's information, and sends a request to purchase the ticket.
 * If the user is not logged in or no seat is selected, appropriate alerts are shown.
 *
 * @function BuyTicket
 * @returns {void} - Initiates the ticket purchasing process and reloads the page upon success.
 */
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
                    "row_num": selected_row,
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

/**
 * Selects a seat in the cinema hall and highlights it.
 * This function updates the selected seat and changes its background color to indicate selection.
 *
 * @function SelectSeat
 * @param {number} seat_number - The seat number to be selected.
 * @param {number} row_num - The seat number to be selected.
 * @returns {void} - Updates the selected seat's background color and highlights it.
 */
function SelectSeat(seat_number, row_num) {
    if (selected_seat != 0) {
        document.getElementById(`seat-${selected_row}-${selected_seat}`).style.backgroundColor = "#337ab7";
    }
    selected_seat = seat_number;
    selected_row = row_num;
    document.getElementById(`seat-${row_num}-${seat_number}`).style.backgroundColor = "#ccc";
}

/**
 * Adds the available seats to the modal for a specific date and time for a film.
 * This function fetches the available seats from the server for the given date and time,
 * and generates buttons for available and unavailable seats accordingly.
 *
 * @function addSeats
 * @param {string} [date=document.getElementById("form-day-select").value] - The selected date in YYYY-MM-DD format.
 * @param {string} [time=document.getElementById("form-session-select").value] - The selected session time in HH:MM format.
 * @returns {void} - Updates the modal with the available seats, marking the available ones with a button.
 */
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
        selected_row = 0;
        const maxRows = 5;

        for (let row = 1; row <= maxRows; row++) {
            let rowSeats = seatsTable.filter(seat => seat.row_num === row);
            let hasAvailableSeats = rowSeats.some(seat => seat.is_available);

            if (hasAvailableSeats) {
                CreateElement("span", `row-num-${row}`, `${row} ряд`, "modal-body-seats-BuyTicket").classList.add("m-04");

                rowSeats.forEach(seat => {
                    const seatId = `seat-${row}-${seat.seat_number}`;
                    if (seat.is_available) {
                        CreateElement("button", seatId, seat.seat_number, "modal-body-seats-BuyTicket")
                            .classList.add("m-04", "btn", "btn-primary");
                        document.getElementById(seatId).setAttribute("onclick", `SelectSeat(${seat.seat_number}, ${row})`);
                    } else {
                        CreateElement("button", seatId, seat.seat_number, "modal-body-seats-BuyTicket")
                            .classList.add("m-04", "btn", "btn-secondary", "disabled");
                    }
                });

                CreateElement("div", `separator-row-${row}`, "", "modal-body-seats-BuyTicket").classList.add("row-separator");
            }
        }
    });
}

/**
 * Adds available session options to the session select dropdown.
 * This function fetches the available sessions from the server for a selected film and date,
 * and populates the session select dropdown with the available session times.
 *
 * @function addOptionsSessions
 * @returns {void} - Updates the session select dropdown with available session times.
 */
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

            changePrice(sessionsTable[0]['ticket_price']);
            CreateElement("div", "modal-body-seats-BuyTicket", "", "modal-body-BuyTicket");
            addSeats();

            document.getElementById("form-session-select").onchange = function () {
                const selectedOption = this.options[this.selectedIndex];
                const selectedId = selectedOption.id;
                const index = selectedId.split("-").pop();
                changePrice(sessionsTable[index]['ticket_price']);
                addSeats();
            };
        });
}

function changePrice(price){
    if (!document.getElementById("form-ticket-price")) {
        CreateElement("div", "form-ticket-price", "", "modal-body-BuyTicket").classList.add("form-group", "m-04");
        CreateElement("label", "form-price-label", "Ціна квитка: ", "form-ticket-price").classList.add("form-label", "font-weight-bold");
        CreateElement("span", "form-price-value", "", "form-ticket-price").classList.add("form-value", "ml-2");
    }

    document.getElementById("form-price-value").innerText = " " + price + " грн";
}

/**
 * Adds available days with sessions to the day select dropdown.
 * This function fetches the available days with sessions from the server for a specific film,
 * and populates the day select dropdown. If no sessions are available, a message is displayed.
 * If sessions are available, it also creates a session select dropdown and calls the function to populate available sessions.
 *
 * @function addOptionsDays
 * @returns {void} - Updates the day select dropdown with available days. If days are available, it also adds a session select dropdown.
 */
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
                console.log("document.getElementById().value", document.getElementById("form-day-select").value);

                addOptionsSessions();
            }
         });
}


var filmId = localStorage.getItem("FILM_ID");
var rating = 10;
let user_grade = 10;
let selected_seat = 0;
let selected_row = 0;

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

    return fetch (`/getFirstAndLastName`, {
        method: 'GET',
    });
})
.then(res2 => res2.text())
.then(res2 => {
    //console.log("res2::", res2);
    if(res2 != 0) {

    let user = JSON.parse(res2);

    return fetch (`/getOrderPaymentsForUserAndFilm?user_id=${user['user_id']}&film_id=${filmId}`, {
        method: 'GET',
    })
    .then(res3 => res3.text())
    .then(res3 => {
        if (res3 != 0) {
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
    })
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