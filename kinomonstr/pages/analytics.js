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

function FillInFilmsStatisticsTable(startDate = 0, endDate = 0, notOnLoad = 0) {
    if (startDate == 0 && endDate == 0 && notOnLoad == 0) { //при загрузке страницы
        CreateElement("h2", "h2-cars-statistics", "Таблиця статистики фільмів", "main-products-container").classList.add("text-center");
        CreateElement("table", "cars-statistics-table", "", "main-products-container").classList.add("table", "table-striped", "table-hover");
        CreateElement("thead", "cars-statistics-thead", "", "cars-statistics-table")
        CreateElement("tr", "cars-statistics-tr1", "", "cars-statistics-thead")
        CreateElement("td", "cars-statistics-thead-tr1-td1", "Id фільма", "cars-statistics-tr1").classList.add("text-center");
        CreateElement("td", "cars-statistics-thead-tr1-td2", "Назва", "cars-statistics-tr1").classList.add("text-center");
        CreateElement("td", "cars-statistics-thead-tr1-td3", "Рейтинг", "cars-statistics-tr1").classList.add("text-center");
        CreateElement("td", "cars-statistics-thead-tr1-td4", "Кількість сеансів", "cars-statistics-tr1").classList.add("text-center");
        CreateElement("td", "cars-statistics-thead-tr1-td5", "Середня ціна квитка", "cars-statistics-tr1").classList.add("text-center");
        CreateElement("td", "cars-statistics-thead-tr1-td6", "Загальна кількість проданих квитків", "cars-statistics-tr1").classList.add("text-center");
        CreateElement("td", "cars-statistics-thead-tr1-td7", "Прибуток", "cars-statistics-tr1").classList.add("text-center");

        CreateElement("tbody", "cars-statistics-tbody", "", "cars-statistics-table")

        fetch('/getFilmsStatisticsFromDB', {
            method: 'GET',
        })
        .then(result2 => result2.text())
        .then(result2 => {
            let filmsStatisticsTable = JSON.parse(result2);
            for (let i = 0; i < filmsStatisticsTable.length; i++) {
                    CreateElement("tr", "cars-statistics-tr" + i + "-body", "", "cars-statistics-tbody")
                    CreateElement("td", "cars-statistics-tr" + filmsStatisticsTable[i]['film_id'] + "-td1", filmsStatisticsTable[i]['film_id'], "cars-statistics-tr" + i + "-body").classList.add("text-center");
                    CreateElement("td", "cars-statistics-tr" + filmsStatisticsTable[i]['film_id'] + "-td2", filmsStatisticsTable[i]['film_name'], "cars-statistics-tr" + i + "-body")
                    CreateElement("td", "cars-statistics-tr" + filmsStatisticsTable[i]['film_id'] + "-td3", (filmsStatisticsTable[i]['film_rating']).toFixed(1), "cars-statistics-tr" + i + "-body").classList.add("text-center");
                    CreateElement("td", "cars-statistics-tr" + filmsStatisticsTable[i]['film_id'] + "-td4", filmsStatisticsTable[i]['session_count'], "cars-statistics-tr" + i + "-body").classList.add("text-center");
                    CreateElement("td", "cars-statistics-tr" + filmsStatisticsTable[i]['film_id'] + "-td5", parseFloat(filmsStatisticsTable[i]['average_ticket_price']).toFixed(2), "cars-statistics-tr" + i + "-body").classList.add("text-center");
                    CreateElement("td", "cars-statistics-tr" + filmsStatisticsTable[i]['film_id'] + "-td6", filmsStatisticsTable[i]['total_tickets_sold'], "cars-statistics-tr" + i + "-body").classList.add("text-center");
                    CreateElement("td", "cars-statistics-tr" + filmsStatisticsTable[i]['film_id'] + "-td7", parseFloat(filmsStatisticsTable[i]['average_ticket_price']).toFixed(2) * filmsStatisticsTable[i]['total_tickets_sold'], "cars-statistics-tr" + i + "-body").classList.add("text-center");
            }
        });
   }
   else if (notOnLoad == 0) { // при изменении даты в периоде

        fetch('/getFilmIdsFromDB', {
             method: 'GET',
        })
             .then(result1 => result1.text())
             .then(result1 => {
                  let filmIdsTable = JSON.parse(result1);
                  for (let i = 0; i < filmIdsTable.length; i++) {
                        if (document.getElementById("cars-statistics-tr" + filmIdsTable[i]['film_id'] + "-td4"))
                            document.getElementById("cars-statistics-tr" + filmIdsTable[i]['film_id'] + "-td4").innerText = 0;
                        if (document.getElementById("cars-statistics-tr" + filmIdsTable[i]['film_id'] + "-td5"))
                            document.getElementById("cars-statistics-tr" + filmIdsTable[i]['film_id'] + "-td5").innerText = 0;
                        if (document.getElementById("cars-statistics-tr" + filmIdsTable[i]['film_id'] + "-td6"))
                            document.getElementById("cars-statistics-tr" + filmIdsTable[i]['film_id'] + "-td6").innerText = 0;
                        if (document.getElementById("cars-statistics-tr" + filmIdsTable[i]['film_id'] + "-td7"))
                            document.getElementById("cars-statistics-tr" + filmIdsTable[i]['film_id'] + "-td7").innerText = 0;

                  }

                  fetch('/getFilmsStatisticsForThePeriodFromDB', {
                       method: 'POST',
                       body: JSON.stringify({
                            "startDate": startDate,
                            "endDate": endDate,
                       })
                  })
                       .then(result2 => result2.text())
                       .then(result2 => {
                            let filmsStatisticsTable = JSON.parse(result2);
                            for (let i = 0; i < filmsStatisticsTable.length; i++) {
                                document.getElementById("cars-statistics-tr" + filmsStatisticsTable[i]['film_id'] + "-td4").innerText = filmsStatisticsTable[i]['session_count'];
                                document.getElementById("cars-statistics-tr" + filmsStatisticsTable[i]['film_id'] + "-td5").innerText = parseFloat(filmsStatisticsTable[i]['average_ticket_price']).toFixed(2);
                                document.getElementById("cars-statistics-tr" + filmsStatisticsTable[i]['film_id'] + "-td6").innerText = filmsStatisticsTable[i]['total_tickets_sold'];
                                document.getElementById("cars-statistics-tr" + filmsStatisticsTable[i]['film_id'] + "-td7").innerText = parseFloat(filmsStatisticsTable[i]['average_ticket_price']).toFixed(2) * filmsStatisticsTable[i]['total_tickets_sold'];
                            }
                       });
             });
   }
   else if (notOnLoad == 1) { // при возврате на весь период
        fetch('/getFilmsStatisticsFromDB', {
            method: 'GET',
        })
        .then(result2 => result2.text())
        .then(result2 => {
            let filmsStatisticsTable = JSON.parse(result2);
            for (let i = 0; i < filmsStatisticsTable.length; i++) {
                document.getElementById("cars-statistics-tr" + filmsStatisticsTable[i]['film_id'] + "-td4").innerText = filmsStatisticsTable[i]['session_count'];
                document.getElementById("cars-statistics-tr" + filmsStatisticsTable[i]['film_id'] + "-td5").innerText = parseFloat(filmsStatisticsTable[i]['average_ticket_price']).toFixed(2);
                document.getElementById("cars-statistics-tr" + filmsStatisticsTable[i]['film_id'] + "-td6").innerText = filmsStatisticsTable[i]['total_tickets_sold'];
                document.getElementById("cars-statistics-tr" + filmsStatisticsTable[i]['film_id'] + "-td7").innerText = parseFloat(filmsStatisticsTable[i]['average_ticket_price']).toFixed(2) * filmsStatisticsTable[i]['total_tickets_sold'];
            }
        });
   }
}

function FillInClientsStatisticsTable(startDate = 0, endDate = 0, notOnLoad = 0) {

}



function FillInTables(startDate = 0, endDate = 0, notOnLoad = 0) {
    FillInFilmsStatisticsTable(startDate, endDate, notOnLoad);
    //FillInClientsStatisticsTable(startDate, endDate, notOnLoad);
}

function OnChangeDates() {
    var startDate = document.getElementById("start-date").value;
    var endDate = document.getElementById("end-date").value;
    fetch('/getSumOfAllVisitorsForThePeriodFromDB', {
         method: 'POST',
         body: JSON.stringify({
              "startDate": startDate,
              "endDate": endDate,
         })
    })
         .then(result => result.text())
         .then(result => {
              document.getElementById("b-sales-amount").innerText = "Загальна кількість відвідувачів за период з " + startDate + " до " + endDate + " становить: " + result;
         });
    FillInTables(startDate, endDate);
}

function PeriodChanged() {
    if (document.getElementById("period").value === "Весь період") {
         fetch('/getSumOfAllVisitorsFromDB', {
              method: 'GET',
         })
              .then(result => result.text())
              .then(result => {
                   if (document.getElementById("b-sales-amount") == undefined)
                        CreateElement("b", "b-sales-amount", "Загальна кількість відвідувачів: " + result, "sales-amount").setAttribute('style', "font-size: 1.5em;");
                   else
                        document.getElementById("b-sales-amount").innerText = "Загальна кількість відвідувачів: " + result;
              });
         if (document.getElementById("start-date-div") == undefined)
              FillInTables();
         else {
              document.getElementById("start-date-div").remove();
              document.getElementById("end-date-div").remove();
              FillInTables(0, 0, 1);
         }
    }
    else if (document.getElementById("period").value === "Певний період") {
         if (!document.getElementById("start-date")) {
              CreateElement("div", "start-date-div", "", "periodStartEnd").classList.add("col-md-4", "mb-3");
              CreateElement("label", "start-date-label", "Початкова дата: ", "start-date-div").setAttribute('style', "font-size: 1.4em;");
              document.getElementById("start-date-label").classList.add("pt-3");
              CreateElement("input", "start-date", "", "start-date-div").classList.add("form-control");
              document.getElementById("start-date").setAttribute('type', "date");
              document.getElementById("start-date").value = "2023-11-01";
              document.getElementById("start-date").setAttribute('onchange', "OnChangeDates()");

              CreateElement("div", "end-date-div", "", "periodStartEnd").classList.add("col-md-4", "mb-3");
              CreateElement("label", "end-date-label", "Кінцева дата: ", "end-date-div").setAttribute('style', "font-size: 1.4em;");
              document.getElementById("end-date-label").classList.add("pt-3");
              CreateElement("input", "end-date", "2023-11-01", "end-date-div").classList.add("form-control");
              document.getElementById("end-date").setAttribute('type', "date");
              document.getElementById("end-date").value = new Date().toISOString().slice(0, 10);
              document.getElementById("end-date").setAttribute('onchange', "OnChangeDates()");
         }
         OnChangeDates();
    }
}

PeriodChanged();