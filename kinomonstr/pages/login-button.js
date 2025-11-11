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
         let user = JSON.parse(res);
        //console.log("res:: ", user);
    });


