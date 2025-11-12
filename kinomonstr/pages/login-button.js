fetch('/getUsernameAndId', {
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
         let user = JSON.parse(res);
        //console.log("res:: ", user);
    });


