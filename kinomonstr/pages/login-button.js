/**
 * Creates a button element with the specified id and text, then appends it to the navigation list.
 * The button is styled with "btn" and "btn-primary" classes.
 *
 * @function createButton
 * @param {string} id - The id to assign to the button element.
 * @param {string} text - The text to display on the button.
 * @returns {HTMLElement} - The created button element.
 */
function createButton(id, text) {
    let element = document.createElement("button");
    element.id = id;
    element.innerText = text;
    element.classList.add("btn", "btn-primary");
    document.getElementById("ul-nav-id").appendChild(element);
    return element;
}

/**
 * Fetches the username and ID from the server and determines whether the user is logged in or not.
 * If the user is not logged in, it creates a "Login" button that opens a modal. 
 * If the user is logged in, it creates a "Logout" button that triggers a sign-out request to the server.
 * The sign-out request sends a POST request to the server to log the user out and reloads the page upon success.
 *
 * @function handleUserSession
 * @returns {void} - Creates either a login or logout button depending on the user's session status.
 */
fetch('/getUsernameAndId', {
    method: 'GET',
})
    .then(res => res.text())
    .then(res => {            
         console.log("res", res);

         if (res == "0") {
             const loginButton = createButton("button-entr", "Вхід");
             loginButton.setAttribute('data-toggle', "modal");
             loginButton.setAttribute('data-target', "#myModal");
         } else {
             const logoutButton = createButton("button-exit", "Вихід");
             logoutButton.onclick = function() {
                 var xhr = new XMLHttpRequest(); 
                 xhr.open('POST', '/signOut'); 
                 xhr.setRequestHeader('Content-Type', 'application/json'); 
                 xhr.send(JSON.stringify()); 

                 xhr.onload = function() {
                     if (xhr.status === 200) {
                         alert(this.responseText); 
                         location.reload();
                     }
                 }; 

                 xhr.onerror = function() {
                    if (xhr.status === 0) {
                        alert('Помилка підключення до сервера. Перевірте своє інтернет-з’єднання.');
                    } else {
                        alert(`Помилка сервера! Статус: ${xhr.status}. Спробуйте пізніше.`);
                    }
                };
             };
         }  
    });



/*fetch('/getUsernameAndId', {
    method: 'GET',
})
    .then(res => res.text())
    .then(res => {            
         
         console.log("res", res);
         if(res == "0") {
             let element = document.createElement("button");
             element.id = "button-entr";
             element.innerText = "Вхід";
             document.getElementById("ul-nav-id").appendChild(element);
             element.classList.add("btn", "btn-primary");
             element.setAttribute('data-toggle', "modal");
             element.setAttribute('data-target', "#myModal");
         }
         else {
            let element = document.createElement("button");
             element.id = "button-exit";
             element.innerText = "Вихід";
             document.getElementById("ul-nav-id").appendChild(element);
             element.classList.add("btn", "btn-primary");

            element.onclick = function () {
                var xhr = new XMLHttpRequest(); 
                xhr.open('POST', '/signOut'); 

                xhr.setRequestHeader('Content-Type', 'application/json'); 
                xhr.send(JSON.stringify()); 

                xhr.onload = function() {
                    if (xhr.status === 200) {
                        alert(this.responseText); 
                        location.reload();
                    }
                }; 

          xhr.onerror = function() {
              alert('server error!'); 
          }
            }
         }
    });*/


