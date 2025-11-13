/**
 * Fetches the user's role from the server to determine if they are an admin.
 * If the user is an admin, it modifies the navigation menu to include links to the "Analytics" and "Admin Page".
 * Depending on the current page, the relevant menu items are highlighted.
 * 
 * - If the user is on the "analytics.html" page, the "Analytics" link will be active and the "Admin Page" link will be added.
 * - If the user is on the "admin-page.html" page, the "Admin Page" link will be active and the "Analytics" link will be added.
 * - If the user is on any other page, both the "Analytics" and "Admin Page" links will be added to the menu.
 *
 * @function checkAdminAndUpdateMenu
 * @returns {void} - Modifies the navigation menu based on the user's admin status and the current page.
 */
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
            
        }
        else return;
    });