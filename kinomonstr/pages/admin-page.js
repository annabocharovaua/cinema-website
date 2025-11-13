/**
 * Creates a new HTML element with specified properties and appends it to a parent element.
 * 
 * @function CreateElement
 * @param {string} nameElement - The name of the element to create (e.g., "div", "span", "select").
 * @param {string} idElement - The id to assign to the created element.
 * @param {string} innerText - The inner text content for the created element.
 * @param {string} parentId - The id of the parent element where the new element will be appended. If 'body', it appends to the body.
 * @returns {HTMLElement} - The created and appended HTML element.
 * 
 * @example
 * CreateElement("div", "myDiv", "Hello, World!", "container");
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
 * Resets the container with forms by clearing its inner HTML content.
 * 
 * @function ResetContainerForForms
 * @description Clears all the content inside the element with id "container-for-forms".
 */
function ResetContainerForForms() {
    document.getElementById("container-for-forms").innerHTML = "";
}

/**
 * Adds a dropdown field for genres to the "container-for-genres" element.
 * If a genre is the first, it uses specific styles, otherwise uses default styling.
 * 
 * @function AddFieldGenre
 * @param {number} number - The number to differentiate between multiple genre fields.
 * @description Sends a GET request to fetch genres from the database and populates the dropdown options.
 * @example
 * AddFieldGenre(1);
 */
function AddFieldGenre(number) {
    if (number != 1)
        CreateElement("select", "genreName" + number, "", "container-for-genres").classList.add("custom-mt-3", "form-select");
    else 
        CreateElement("select", "genreName" + number, "", "container-for-genres").classList.add("form-select");

    fetch(`/getGenresFromDB`, {
        method: 'GET',
   })
    .then(res => res.text())
    .then(res => {
            let genreTable = JSON.parse(res);
        if (genreTable.length == 0) 
            CreateElement("option", "optionSelectGenre" + 0, "На жаль жанри відсутні, додайте новий!", "selectGenre");
        for (let i = 0; i < genreTable.length; i++) {
            if (!(genreTable[i]['name'] == deletedGenre))
                CreateElement("option", "optionSelectGenre" + i, genreTable[i]['name'], "genreName"+ number);
        }
    });
}

/**
 * Deletes a genre dropdown field by removing the corresponding select element.
 * 
 * @function DeleteFieldGenre
 * @param {number} number - The number used to identify the genre field.
 * @description Removes the select element with id "genreName<number>" from the DOM.
 */
function DeleteFieldGenre(number) {
    document.getElementById("genreName"+number).remove();
}

let number_of_genres = 1;
/**
 * Adds a new film form with input fields for film name, genres, director, duration, poster, trailer, and description.
 * 
 * @function AddNewFilm
 * @description Creates a form for adding a new film, including dynamically adding/removing genre fields. 
 * The form collects data like film name, director, duration, poster, trailer, description, and genres.
 * On submission, the data is sent to the server via an AJAX POST request.
 */
function AddNewFilm() {
    CreateElement("form", "formAddFilm", "", "container-for-forms").classList.add("custom-mt-3");
    CreateElement("label", "lablefilmName", "Введіть назву фільму:", "formAddFilm").classList.add("form-label");
    CreateElement("input", "filmName", "", "formAddFilm").classList.add("form-control");
    document.getElementById("filmName").setAttribute('type', "text");
    document.getElementById("filmName").setAttribute('placeholder', "Назва фільму");

    CreateElement("div", "container-for-genres", "", "formAddFilm");
    CreateElement("label", "lablegenreName", "Введіть жанр:", "container-for-genres").classList.add("custom-mt-3", "form-label");

    AddFieldGenre(1);
    CreateElement("button", "buttonRemoveGenre" , "–", "formAddFilm").classList.add("btm", "btn-xs","btn-warning", "pull-right", "custom-ml-3");
    document.getElementById("buttonRemoveGenre").setAttribute('type', "button");
    document.getElementById("buttonRemoveGenre").onclick = function () {
        if (number_of_genres > 1) {
            DeleteFieldGenre(number_of_genres);
            number_of_genres--;
        }
    }

    CreateElement("button", "buttonAddGenre" , "+", "formAddFilm").classList.add("btm", "btn-xs","btn-warning", "pull-right");
    document.getElementById("buttonAddGenre").setAttribute('type', "button");
    document.getElementById("buttonAddGenre").onclick = function () {
        number_of_genres++;
        AddFieldGenre(number_of_genres);
    }

    CreateElement("label", "lablefilmDirector", "Введіть режисера:", "formAddFilm").classList.add("custom-mt-3", "form-label");
    CreateElement("input", "filmDirector", "", "formAddFilm").classList.add("form-control");
    document.getElementById("filmDirector").setAttribute('type', "text");
    document.getElementById("filmDirector").setAttribute('placeholder', "Режисер");

    CreateElement("label", "lablefilmDuration", "Введіть протяжність фільму:", "formAddFilm").classList.add("custom-mt-3", "form-label");
    CreateElement("input", "filmDuration", "", "formAddFilm").classList.add("form-control");
    document.getElementById("filmDuration").setAttribute('type', "number");
    document.getElementById("filmDuration").setAttribute('placeholder', "Час фильму (у хвилинах)");

    CreateElement("label", "lablefilmPoster", "Введіть назву постера:", "formAddFilm").classList.add("custom-mt-3", "form-label");
    CreateElement("input", "filmPoster", "", "formAddFilm").classList.add("form-control");
    document.getElementById("filmPoster").setAttribute('type', "text");
    document.getElementById("filmPoster").setAttribute('placeholder', "Наприклад: Крижане_серце.jpg");

    CreateElement("label", "lablefilmTrailer", "Введіть назву трейлера:", "formAddFilm").classList.add("custom-mt-3", "form-label");
    CreateElement("input", "filmTrailer", "", "formAddFilm").classList.add("form-control");
    document.getElementById("filmTrailer").setAttribute('type', "text");
    document.getElementById("filmTrailer").setAttribute('placeholder', "Наприклад: Крижане_серце.mp4");

    CreateElement("label", "lablefilmDescription", "Введіть опис фільму:", "formAddFilm").classList.add("custom-mt-3", "form-label");
    CreateElement("textarea", "filmDescription", "", "formAddFilm").classList.add("form-control");
    document.getElementById("filmDescription").setAttribute('placeholder', "Опис");

    CreateElement("button", "buttonSendFilm" , "Додати фільм", "formAddFilm").classList.add("custom-mt-3", "btm", "btn-lg","btn-warning", "pull-right");
    document.getElementById("buttonSendFilm").setAttribute('type', "button");

    document.getElementById("buttonSendFilm").onclick = function () {
        const filmName = document.getElementById("filmName").value;
        const filmDirector = document.getElementById("filmDirector").value;
        const filmDuration = document.getElementById("filmDuration").value
        const filmPoster = document.getElementById("filmPoster").value;
        const filmTrailer = document.getElementById("filmTrailer").value;
        const filmDescription = document.getElementById("filmDescription").value;

        // filmDescription не перевіряємо
        if (!filmName || !filmDirector || !filmDuration || !filmPoster || !filmTrailer) {
            alert("Будь ласка, заповніть всі поля");
            return;
        }

        let genres = "";
        console.log("number_of_genres", number_of_genres);

        for (let number = 1; number <= number_of_genres; number++) {
            console.log("document.getElementById(", document.getElementById("genreName" + number).value);
            if (number == number_of_genres)
                genres += document.getElementById("genreName" + number).value;
            else
                genres += document.getElementById("genreName" + number).value + ',';
        }
        setTimeout(function() {
            console.log('Пройшло 10 секунд');
        }, 10000);
        console.log("genres", genres);

        var userData = {
            filmName: document.getElementById("filmName").value,
            filmDirector: document.getElementById("filmDirector").value,
            filmDuration: document.getElementById("filmDuration").value,
            filmPoster: document.getElementById("filmPoster").value,
            filmTrailer: document.getElementById("filmTrailer").value,
            filmDescription: document.getElementById("filmDescription").value,
            filmGenres: genres
        };
        var xhr = new XMLHttpRequest(); 
        xhr.open('POST', '/AddNewFilmToDB'); 
         

        xhr.setRequestHeader('Content-Type', 'application/json'); 
        xhr.send(JSON.stringify(userData)); 

        xhr.onload = function() {
          if (xhr.status === 200) {
                alert(this.responseText); 
                number_of_genres = 1;
          }
          else if (xhr.status === 409) {
            alert(this.responseText);
          }
        }; 

        xhr.onerror = function() {
            alert('server error!'); 
        }

        ResetContainerForForms();
        AddNewFilm();
    }
}

/**
 * Adds a new session form with input fields for selecting a film, start date, start time, and ticket price.
 * 
 * @function AddNewSession
 * @description Creates a form for adding a new session, allowing the user to select a film from a dropdown, 
 * choose a start date and time, and set a ticket price. The form data is sent to the server via an AJAX POST request.
 */
function AddNewSession() {
    CreateElement("form", "formAddSession", "", "container-for-forms").classList.add("custom-mt-3");
    CreateElement("label", "labelSelectFilm", "Оберіть фільм:", "formAddSession").classList.add("form-label");
    CreateElement("select", "selectFilm", "", "formAddSession").classList.add("form-select");

    fetch(`/getFilmNamesFromDB`, {
        method: 'GET',
   })
        .then(res => res.text())
        .then(res => {
             let filmsTable = JSON.parse(res);
             console.log("filmsTable", filmsTable);
           if (filmsTable.length == 0) 
               CreateElement("option", "optionSelectFilm" + 0, "На жаль фільми відсутні, додайте новий!", "selectFilm");
           for (let i = 0; i < filmsTable.length; i++)
               CreateElement("option", "optionSelectFilm" + i, filmsTable[i]['name'], "selectFilm");
        });

    CreateElement("label", "lableStartDate", "Оберіть дату початку:", "formAddSession").classList.add("custom-mt-3", "form-label");
    CreateElement("input", "startDate", "", "formAddSession").classList.add("form-control");
    document.getElementById("startDate").setAttribute('type', "date");
    document.getElementById("startDate").value = new Date(new Date().getTime() - (new Date().getTimezoneOffset() * 60000)).toISOString().slice(0, 10);

    CreateElement("label", "lableStartTime", "Введіть час початку фільму:", "formAddSession").classList.add("custom-mt-3", "form-label");
    CreateElement("input", "startTime", "", "formAddSession").classList.add("form-control");
    document.getElementById("startTime").setAttribute('type', "time");
    document.getElementById("startTime").setAttribute('placeholder', "Час фильму (у хвилинах)");

    CreateElement("label", "lablePrice", "Введіть ціну квитка в грн:", "formAddSession").classList.add("custom-mt-3", "form-label");
    CreateElement("input", "price", "", "formAddSession").classList.add("form-control");
    document.getElementById("price").setAttribute('type', "number");
    document.getElementById("price").setAttribute('min', "0.00");
    document.getElementById("price").setAttribute('step', "0.05");
    document.getElementById("price").setAttribute('value', "100.00");
    document.getElementById("price").setAttribute('placeholder', "Час фильму (у хвилинах)");

    CreateElement("button", "buttonSendSession" , "Додати сеанс", "formAddSession").classList.add("custom-mt-3", "btm", "btn-lg","btn-warning", "pull-right");
    document.getElementById("buttonSendSession").setAttribute('type', "button");

    document.getElementById("buttonSendSession").onclick = function () {
        const selectFilm = document.getElementById("selectFilm").value;
        const startDate = document.getElementById("startDate").value;
        const startTime = document.getElementById("startTime").value;
        const price = document.getElementById("price").value;


        // filmDescription не перевіряємо
        if (selectFilm == "На жаль фільми відсутні, додайте новий!" || !startTime) {
            alert("Будь ласка, заповніть всі поля");
            return;
        }

        var userData = {
            selectFilm : document.getElementById("selectFilm").value,
            startDate : document.getElementById("startDate").value,
            startTime : document.getElementById("startTime").value,
            price : document.getElementById("price").value
        };
        var xhr = new XMLHttpRequest(); 
        xhr.open('POST', '/AddNewSessionToDB'); 
         

        xhr.setRequestHeader('Content-Type', 'application/json'); 
        xhr.send(JSON.stringify(userData)); 

        xhr.onload = function() {
          if (xhr.status === 200) {
            alert(this.responseText); 
          }
          else if (xhr.status === 409) {
            alert(this.responseText);
          }
        }; 
        xhr.onerror = function() {
            alert('server error!'); 
        }

        ResetContainerForForms();
        AddNewSession();
    }
}

/**
 * Adds a new genre selection field to the genre section of the film form.
 * 
 * @function AddFieldGenre
 * @param {number} number - The number of the genre field being added.
 * @description Creates a new genre input field with a unique id based on the provided number and appends it to the form.
 */
function AddNewGenre() {
    CreateElement("form", "formAddGenre", "", "container-for-forms").classList.add("custom-mt-3");
    CreateElement("label", "lableGenreName", "Введіть назву жанру:", "formAddGenre").classList.add("form-label");
    CreateElement("input", "genreName", "", "formAddGenre").classList.add("form-control");
    document.getElementById("genreName").setAttribute('type', "text");
    document.getElementById("genreName").setAttribute('placeholder', "Назва жанру");

    CreateElement("button", "buttonSendGenre" , "Додати жанр", "formAddGenre").classList.add("custom-mt-3", "btm", "btn-lg","btn-warning", "pull-right");
    document.getElementById("buttonSendGenre").setAttribute('type', "button");

    document.getElementById("buttonSendGenre").onclick = function () {
        const name = document.getElementById("genreName").value;
        if (!name) {
            alert("Будь ласка, заповніть поле жанру");
            return;
        }

        var userData = {
            name : document.getElementById("genreName").value
        };
        var xhr = new XMLHttpRequest(); 
        xhr.open('POST', '/AddNewGenreToDB'); 

        xhr.setRequestHeader('Content-Type', 'application/json'); 
        xhr.send(JSON.stringify(userData)); 

        xhr.onload = function() {
          if (xhr.status === 200) {
            alert(this.responseText); 
          }
          else if (xhr.status === 409) {
            alert(this.responseText);
          }
        }; 
        xhr.onerror = function() {
            alert('server error!'); 
        }
        ResetContainerForForms();
        AddNewGenre();
    }
}
var deletedFilm ='';
/**
 * Deletes a selected film from the database.
 * 
 * @function DeleteFilm
 * @description 
 * This function creates a form that allows the user to select a film for deletion. 
 * It retrieves the list of films from the database, displays them in a dropdown menu, 
 * and prompts the user to confirm the deletion. Upon confirmation, the selected film 
 * is deleted from the database and the form is reset.
 */
function DeleteFilm() {
    CreateElement("form", "formDeleteFilm", "", "container-for-forms").classList.add("custom-mt-3");
    CreateElement("label", "labelformDeleteFilm", "Оберіть фільм для видалення:", "formDeleteFilm").classList.add("form-label");
    CreateElement("select", "selectFilm", "", "formDeleteFilm").classList.add("form-select");

    fetch(`/getFilmNamesFromDB`, {
        method: 'GET',
   })
        .then(res => res.text())
        .then(res => {
             let filmsTable = JSON.parse(res);
             console.log("filmsTable", filmsTable);
           if (filmsTable.length == 0) 
               CreateElement("option", "optionSelectFilm" + 0, "На жаль фільми відсутні, додайте новий!", "selectFilm");
           for (let i = 0; i < filmsTable.length; i++) {
            if (!(filmsTable[i]['name'] == deletedFilm))
                CreateElement("option", "optionSelectFilm" + i, filmsTable[i]['name'], "selectFilm");
           }
               
        });
        CreateElement("button", "buttonSendDeleteFilm" , "Видалити фільм", "formDeleteFilm").classList.add("custom-mt-3", "btm", "btn-lg","btn-warning", "pull-right");
        document.getElementById("buttonSendDeleteFilm").setAttribute('uk-toggle', "target: #myModalDeleteFilm");
        document.getElementById("buttonSendDeleteFilm").setAttribute('type', "button");

        document.getElementById("buttonSendDeleteFilm").onclick = function () {
            document.getElementById("question_confirmation").innerText = `Ви впевнені, що хочете видалити фільм:  ${document.getElementById("selectFilm").value}?`;
            openModal();
        }

        document.getElementById("sure").onclick = function () {
            let deletedTemp = document.getElementById("selectFilm").value;
            var userData = {
                name : document.getElementById("selectFilm").value
            };
            var xhr = new XMLHttpRequest(); 
            xhr.open('POST', '/DeleteFilmFromDB'); 
    
            xhr.setRequestHeader('Content-Type', 'application/json'); 
            xhr.send(JSON.stringify(userData)); 
    
            xhr.onload = function() {
              if (xhr.status === 200) {
                deletedFilm = deletedTemp;
                alert(this.responseText); 
              }
              else if (xhr.status === 409) {
                alert(this.responseText);
              }
            };
            xhr.onerror = function() {
                alert('server error!'); 
            }
            closeModal();
            ResetContainerForForms();
            DeleteFilm();
            //location.reload();
        }
}
var deletedGenre ='';
/**
 * Deletes a selected genre from the database.
 * 
 * @function DeleteGenre
 * @description 
 * This function creates a form that allows the user to select a genre for deletion. 
 * It retrieves the list of genres from the database, displays them in a dropdown menu, 
 * and prompts the user to confirm the deletion. Upon confirmation, the selected genre 
 * is deleted from the database and the form is reset.
 */
function DeleteGenre() {
    CreateElement("form", "formDeleteGenre", "", "container-for-forms").classList.add("custom-mt-3");
    CreateElement("label", "labelformDeleteGenre", "Оберіть жанр для видалення:", "formDeleteGenre").classList.add("form-label");
    CreateElement("select", "selectGenre", "", "formDeleteGenre").classList.add("form-select");

    fetch(`/getGenresFromDB`, {
        method: 'GET',
   })
        .then(res => res.text())
        .then(res => {
             let genreTable = JSON.parse(res);
           if (genreTable.length == 0) 
               CreateElement("option", "optionSelectGenre" + 0, "На жаль жанри відсутні, додайте новий!", "selectGenre");
           for (let i = 0; i < genreTable.length; i++) {
                if (!(genreTable[i]['name'] === deletedGenre))
                    CreateElement("option", "optionSelectGenre" + i, genreTable[i]['name'], "selectGenre");
           }
               
        });
        CreateElement("button", "buttonSendDeleteGenre" , "Видалити жанр", "formDeleteGenre").classList.add("custom-mt-3", "btm", "btn-lg","btn-warning", "pull-right");
        document.getElementById("buttonSendDeleteGenre").setAttribute('type', "button");

        document.getElementById("buttonSendDeleteGenre").onclick = function () {
            document.getElementById("question_confirmation").innerText = `Ви впевнені, що хочете видалити жанр:  ${document.getElementById("selectGenre").value}?`;
            openModal();
        }

        document.getElementById("sure").onclick = function () {
            var userData = {
                name : document.getElementById("selectGenre").value
            };
            let deletedTemp = document.getElementById("selectGenre").value;
            var xhr = new XMLHttpRequest(); 
            xhr.open('POST', '/DeleteGenreFromDB'); 
    
            xhr.setRequestHeader('Content-Type', 'application/json'); 
            xhr.send(JSON.stringify(userData)); 
    
            xhr.onload = function() {
              if (xhr.status === 200) {
                deletedGenre = deletedTemp;
                alert(this.responseText); 
              }
              else if (xhr.status === 409) {
                alert(this.responseText);
              }
            };
            xhr.onerror = function() {
                alert('server error!'); 
            }
            closeModal();
            ResetContainerForForms();
            DeleteGenre();
            //location.reload();
        }
}

var deletedSession ='';
/**
 * Deletes a selected session from the database.
 * 
 * @function DeleteSession
 * @description 
 * This function creates a form that allows the user to select a session for deletion. 
 * It retrieves the list of sessions from the database, displays them in a dropdown menu, 
 * and prompts the user to confirm the deletion. Upon confirmation, the selected session 
 * is deleted from the database and the form is reset.
 */
function DeleteSession() {
    CreateElement("form", "formDeleteSession", "", "container-for-forms").classList.add("custom-mt-3");
    CreateElement("label", "labelformDeleteSessione", "Оберіть сеанс для видалення:", "formDeleteSession").classList.add("form-label");
    CreateElement("select", "selectSession", "", "formDeleteSession").classList.add("form-select");

    fetch(`/getSessionsFromDB`, {
        method: 'GET',
   })
        .then(res => res.text())
        .then(res => {
            let SessionTable = JSON.parse(res);
            if (Object.keys(SessionTable).length == 0) {
                CreateElement("option", "optionSelectSession" + 0, "На жаль сесії відсутні, додайте нову!", "selectSession");
            }
            for (let i = 0; i < Object.keys(SessionTable).length; i++) {
                let session = SessionTable[i]['film_name'] + ' | ' + SessionTable[i]['start_date'] + ' | ' + SessionTable[i]['start_time'] + ' | ' + SessionTable[i]['ticket_price'];
                if (!(session == deletedSession))
                    CreateElement("option", "optionSelectSession" + i, session, "selectSession");
            }
               
        });
        CreateElement("button", "buttonSendDeleteSession" , "Видалити сеанс", "formDeleteSession").classList.add("custom-mt-3", "btm", "btn-lg","btn-warning", "pull-right");
        document.getElementById("buttonSendDeleteSession").setAttribute('type', "button");

        document.getElementById("buttonSendDeleteSession").onclick = function () {
            document.getElementById("question_confirmation").innerText = `Ви впевнені, що хочете видалити сеанс:  ${document.getElementById("selectSession").value}?`;
            openModal();
        }
        document.getElementById("sure").onclick = function () {
            deletedTemp = document.getElementById("selectSession").value;
            let arr = document.getElementById("selectSession").value.split(' | ');
            var userData = {
                film_name : arr[0],
                start_date : arr[1],
                start_time : arr[2],
                ticket_price : arr[3]
            };
            var xhr = new XMLHttpRequest(); 
            xhr.open('POST', '/DeleteSessionFromDB'); 
    
            xhr.setRequestHeader('Content-Type', 'application/json'); 
            xhr.send(JSON.stringify(userData)); 
    
            xhr.onload = function() {
              if (xhr.status === 200) {
                deletedSession = deletedTemp;
                alert(this.responseText); 
              }
              else if (xhr.status === 409) {
                alert(this.responseText);
              }
            };
            xhr.onerror = function() {
                alert('server error!'); 
            }
            closeModal();
            ResetContainerForForms();
            DeleteSession();
        }
}

/**
 * Displays the modal for confirmation.
 * 
 * @function openModal
 * @description 
 * This function sets the display style of the modal with the id 'myModalConfirm' to 'block', 
 * making it visible on the screen.
 */
function openModal() {
    document.getElementById('myModalConfirm').style.display = 'block';
}

/**
 * Closes the modal for confirmation.
 * 
 * @function closeModal
 * @description 
 * This function sets the display style of the modal with the id 'myModalConfirm' to 'none', 
 * hiding it from the screen.
 */
function closeModal() {
    document.getElementById('myModalConfirm').style.display = 'none';
}

/**
 * Handles the selection change and calls the corresponding function based on the selected operation.
 * 
 * @function ChangedSelection
 * @description 
 * This function checks the value of the selection input with the id 'operation' and performs different actions
 * based on the selected operation. It resets the form container and then calls the relevant function for adding 
 * or deleting a film, session, or genre, depending on the selected operation.
 */
function ChangedSelection() {
    if (document.getElementById("operation").value === "Додати фільм") {
        ResetContainerForForms();
        AddNewFilm();
    }
    else if (document.getElementById("operation").value === "Видалити фільм") {
        ResetContainerForForms();
        DeleteFilm();
    }
    else if (document.getElementById("operation").value === "Додати сеанс") {
        ResetContainerForForms();
        AddNewSession();
    }
    else if (document.getElementById("operation").value === "Видалити сеанс") {
        ResetContainerForForms();
        DeleteSession();
    }
    else if (document.getElementById("operation").value === "Додати жанр") {
        ResetContainerForForms();
        AddNewGenre();
    }
    else if (document.getElementById("operation").value === "Видалити жанр") {
        ResetContainerForForms();
        DeleteGenre();
    }
}

ChangedSelection();

/*function ChangedSelection() {
    const operations = {
        "Додати фільм": AddNewFilm,
        "Видалити фільм": DeleteFilm,
        "Додати сеанс": AddNewSession,
        "Видалити сеанс": DeleteSession,
        "Додати жанр": AddNewGenre,
        "Видалити жанр": DeleteGenre
    };

    const operation = document.getElementById("operation").value;

    if (operations[operation]) {
        ResetContainerForForms();
        operations[operation](); 
    }
}*/