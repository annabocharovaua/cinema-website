fetch (`/isAdmin`, {
        method: 'GET',
    })
    .then(res => res.text())
    .then(res => {
        if(res != "0") {
            if (new URL(window.location.href).pathname == "/analytics.html") {
                document.getElementById("li-contacts_href").insertAdjacentHTML('afterend', '<li class="active"> <a href="analytics.html">Аналітика</a> </li>');
                document.getElementById("li-contacts_href").insertAdjacentHTML('afterend', '<li> <a href="admin-page.html">Сторінка адміністратора</a> </li>');
            } 
            else if (new URL(window.location.href).pathname == "/admin-page.html") {
                document.getElementById("li-contacts_href").insertAdjacentHTML('afterend', '<li> <a href="analytics.html">Аналітика</a> </li>');
                document.getElementById("li-contacts_href").insertAdjacentHTML('afterend', '<li class="active"> <a href="admin-page.html">Сторінка адміністратора</a> </li>');
            }
            else {
                document.getElementById("li-contacts_href").insertAdjacentHTML('afterend', '<li> <a href="analytics.html">Аналітика</a> </li>');
                document.getElementById("li-contacts_href").insertAdjacentHTML('afterend', '<li> <a href="admin-page.html">Сторінка адміністратора</a> </li>');
            }
            //location.reload();
        }
        else return;
    });