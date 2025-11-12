const path = require('path');
const cache = require('memory-cache');
const express = require('express');
const app = express();

var cookieParser = require('cookie-parser');
var session = require('express-session');
var bodyParser = require('body-parser');

var jsonParser = bodyParser.json();
app.use(jsonParser);

// создание хранилища для сессий 
var sessionHandler = require('./session_handler');
var store = sessionHandler.createStore();

// создание сессии 
app.use(cookieParser());
//app.use(session({
//    store: store,
//    resave: false,
//    saveUninitialized: true,
//    secret: 'supersecret'
//}));

var handlers = require('./queries');
var signup = require('./signup');
var routes_hangler = 
require('./routes')(app);

app.get('/all', handlers.get_users);

app.post('/login', handlers.check_user);
app.post('/login', handlers.check_pass);
app.post('/signOut', handlers.singOut);

// регистрация пользователя 
app.post('/signup', signup.addUser);

// ограничение доступа к контенту на основе авторизации 
app.get('/check', function (req, res) {
    var username = cache.get("username")
    if (username) {
        res.send('hello, user ' + username);
   } else {
        res.send('Not logged in(');
    }
});




app.use(express.static(path.join(__dirname, 'pages')))
app.get('/', (request, response) => {
     res.sendFile(`${__dirname}/pages/index.html`);
});

const hostname = '127.0.0.1';
const port = 5555;
app.listen(port, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
    console.log(`Application listening on port ${port}!`);
});


const config = require('./config'); 

const mysql = require("mysql");
const mysql2 = require("mysql2/promise");

function ConnectToDB(config) {
     const connection = mysql.createConnection(config);
     connection.connect(function (err) {
          if (err) {
               return console.error("Помилка: " + err.message);
          }
          else {
               console.log("Підключення до серверу MySQL успішне");
          }
     });
     return connection;
}

function CloseConnectionToDB(connection) {
     connection.end(function (err) {
          if (err) {
               return console.log("Помилка: " + err.message);
          }
           console.log("Підключенння завершено");
     });
}
app.get('/getFilmsFromDB', (request, response) => {
    const connection = ConnectToDB(config);


    let film_genres = [];
    let query_genre = `SELECT fg.film_id, REPLACE(GROUP_CONCAT(g.name SEPARATOR ', '), ',', ', ') AS genre_names 
    FROM film_genres fg 
    JOIN genres g ON fg.genre_id = g.genre_id
    GROUP BY fg.film_id;`;

    connection.query(query_genre, (err, result, field) => {
        result.forEach(function (item, i, arr) {
            film_genres[item['film_id']] = item['genre_names'];
        });
        
    });

    let query = "SELECT * FROM films";
    let queryResult = {};

    connection.query(query, (err, result, field) => {
        queryResult = result;
        result.forEach(function (item, i, arr) {
            queryResult[i] = { "film_id": item['film_id'], "name": item['name'], "director": item['director'], "duration": item['duration'], 
            "description": item['description'], "poster": item['poster'], "trailer": item['trailer'], "rating": item['rating']
            , "count_ratings": item['count_ratings'], "film_genres": film_genres[item['film_id']]};
        });
        response.send(queryResult);
    });

    CloseConnectionToDB(connection);
});


app.get('/getPosterNewFilmsFromDB', (request, response) => {
    const connection = ConnectToDB(config);    

    let query = "SELECT film_id, name, poster FROM films;";
    let queryResult = {};

    connection.query(query, (err, result, field) => {
        queryResult = result;
        result.forEach(function (item, i, arr) {
            queryResult[i] = { "film_id": item['film_id'], "name": item['name'], "poster": item['poster']};
        });
       response.send(queryResult);
    });

    CloseConnectionToDB(connection);
});

app.get('/getFilmDetails/:filmId', (request, response) => {
    const filmId = request.params.filmId;
    console.log(filmId); 

    const connection = ConnectToDB(config);    

    let film_genres = "";
    let query_genre = `SELECT fg.film_id, REPLACE(GROUP_CONCAT(g.name SEPARATOR ', '), ',', ', ') AS genre_names 
    FROM film_genres fg 
    JOIN genres g ON fg.genre_id = g.genre_id
    WHERE fg.film_id = ${filmId}
    GROUP BY fg.film_id;`;

    connection.query(query_genre, (err, result, field) => {
        result.forEach(function (item, i, arr) {
            film_genres = item['genre_names'];
        });
        
    });


    let film_reviews = [];
    let query_reviews = `SELECT fr.review_id, fr.id_film, fr.id_user, fr.rating, fr.review_date, fr.review_text, u.first_name, u.last_name
    FROM film_reviews fr
    JOIN users1 u ON fr.id_user = u.user_id
    WHERE fr.id_film = ${filmId} AND fr.review_text IS NOT NULL AND TRIM(fr.review_text) != '';`

    connection.query(query_reviews, (err, result, field) => {
        if (err) {
            console.error(err);            
        } else {
            result.forEach(function (item, i, arr) {
                film_reviews.push(item);
            });
        }
        
    });

    let query = "SELECT * FROM films WHERE film_id = " + filmId + " ;";
    let queryResult = {};

    connection.query(query, (err, result, field) => {
        queryResult = result;
        result.forEach(function (item, i, arr) {
            queryResult[i] = { "film_id": item['film_id'], "name": item['name'], "director": item['director'], "duration": item['duration'], 
            "description": item['description'], "poster": item['poster'], "trailer": item['trailer'], "rating": item['rating']
            , "count_ratings": item['count_ratings'], "film_genres": film_genres, "film_reviews": film_reviews};
        });
        //console.log(queryResult);
        response.send(queryResult);
    });

    CloseConnectionToDB(connection);    
});

app.get('/getRatingFilmsFromDB', (request, response) => {
    const filmId = request.params.filmId;
    console.log(filmId); 

    const connection = ConnectToDB(config);    

    let query = "SELECT film_id, name, rating FROM films ORDER BY rating DESC;";
    let queryResult = {};

    connection.query(query, (err, result, field) => {
        queryResult = result;
        result.forEach(function (item, i, arr) {
            queryResult[i] = { "film_id": item['film_id'], "name": item['name'], "rating": item['rating']};
        });
        //console.log(queryResult);
        response.send(queryResult);
    });

    CloseConnectionToDB(connection);    
});

app.get('/getRatingAllFilmsFromDB', (request, response) => {
    const filmId = request.params.filmId;
    console.log(filmId);

    const connection = ConnectToDB(config);    

    let film_genres = [];
    let query_genre = `SELECT fg.film_id, REPLACE(GROUP_CONCAT(g.name SEPARATOR ', '), ',', ', ') AS genre_names 
    FROM film_genres fg 
    JOIN genres g ON fg.genre_id = g.genre_id
    GROUP BY fg.film_id; `;

    connection.query(query_genre, (err, result, field) => {
        result.forEach(function (item, i, arr) {
            film_genres[item['film_id']] = item['genre_names'];
        });
        
    });


    let query = "SELECT film_id, name, poster, rating FROM films ORDER BY rating DESC;";
    let queryResult = {};

    connection.query(query, (err, result, field) => {
        queryResult = result;
        result.forEach(function (item, i, arr) {
            queryResult[i] = { "film_id": item['film_id'], "name": item['name'], "rating": item['rating'], "poster": item['poster'], "film_genres": film_genres[item['film_id']] };
        });
        //console.log(queryResult);
        response.send(queryResult);
    });

    CloseConnectionToDB(connection);    
});


app.get('/getUsernameAndId', (request, response) => {
    let result;
    console.log("cache.get(username)", cache.get("username"));
    if (cache.get("username") == null)
        result = 0;
    else if (cache.get("username") == '')
        result = 0;
    else  
        result = { "id_username": cache.get("id_username"), "username": cache.get("username")};

    console.log("cache.get(result)", result);
    response.send(JSON.stringify(result));   
});


app.get('/getFirstAndLastName', (request, response) => {
    let result = "0";
    //console.log("cache.get(username)", cache.get("username"));
    if (cache.get("username") == null) {
        result = "0";
        response.send(result);
    }
    else if (cache.get("username") == '') {
        result = "0";
        response.send(result);
    }
    else  {
        const connection = ConnectToDB(config);  
        let query = "SELECT user_id, first_name, last_name FROM users1 WHERE user_id = " + cache.get("id_username") + ";";
        connection.query(query, (err, res, field) => {
            result = { "user_id": res[0]['user_id'], "first_name": res[0]['first_name'], "last_name": res[0]['last_name']};
            console.log("res::: ", result);
            console.log(err);   
            response.send(result);  
        });
        CloseConnectionToDB(connection);   
    }
});

app.post('/postReviewToDB', (req, res, next) =>  { 
    //console.log(req.body);
    var inserts = {
        film_id: req.body.film_id,
        user_id: req.body.user_id,
        grade: req.body.grade,
        comment: req.body.comment
    }; 

    const today = new Date(new Date().getTime() - (new Date().getTimezoneOffset() * 60000)).toISOString().slice(0, 10);
    //console.log("DATE-today: ", today);

    const connection = ConnectToDB(config);  
    let query = "INSERT INTO `cinemadb`.`film_reviews` (`id_film`, `id_user`, `rating`, `review_date`, `review_text`) VALUES ('" + inserts.film_id + "', '" + inserts.user_id + "', '" + inserts.grade + "', '" + today + "', '" + inserts.comment + "');"
    connection.query(query, (err, result, field) => {
        console.log("ERR", err);
        if (!err) {
            console.log(query);
            res.status(200).send('Your comment has been successfully added!'); 
        } 
        else {
            res.status(409).send('Error while making a comment!'); 
        } 
    });		
    CloseConnectionToDB(connection);
})

app.get('/getDaysWithSessions/:filmId', (request, response) => {
    const filmId = request.params.filmId;
    console.log("filmId:", filmId); 
    let result = {}
    const connection = ConnectToDB(config);  
    let query = `SELECT DISTINCT DATE_FORMAT(start_date, '%Y-%m-%d') start_date FROM sessions WHERE film_id = ${filmId} AND (start_date > CURRENT_DATE OR (start_date = CURRENT_DATE AND start_time > CURRENT_TIME)) ORDER BY start_date;`;
    connection.query(query, (err, res, field) => {
        response.send(res);  
    });
    CloseConnectionToDB(connection);   
});

app.get('/getSessions/:filmId/:date', (request, response) => {
    const filmId = request.params.filmId;
    const date = request.params.date;
    console.log("date:", date); 
    let result = {}
    const connection = ConnectToDB(config);  
    let query = `SELECT DISTINCT TIME_FORMAT(start_time, '%H:%i:%s') AS start_time FROM sessions WHERE (film_id = ${filmId} AND ((current_date = '${date}' AND (start_date = '${date}' AND start_time > CURRENT_TIME)) OR (current_date != '${date}' AND start_date = '${date}'))) ORDER BY start_time;`;
    connection.query(query, (err, res, field) => {
        console.log("RES:", res);
        response.send(res);
    });
    CloseConnectionToDB(connection);   
});

app.get('/getSeats/:filmId/:date/:time', (request, response) => {
    const filmId = request.params.filmId;
    const date   = request.params.date;
    const time   = request.params.time;
    console.log(time);
    let result = {}
    const connection = ConnectToDB(config);  
    let query = `SELECT row_num, seat_number, is_available FROM seats WHERE session_id = (SELECT session_id FROM sessions WHERE film_id = ${filmId} AND start_date = '${date}' AND start_time = '${time}');`;
    connection.query(query, (err, res, field) => {
        response.send(res);
    });
    CloseConnectionToDB(connection);   
});



function getSession_id() {
    const connection = ConnectToDB(config);  

    CloseConnectionToDB(connection);
}

app.post('/postBuyTicket', (request, response) => {
    let body = '';
    request.on('data', chunk => {
         body += chunk.toString();
    });
    request.on('end', async () => {
        let receivedFromServer = JSON.parse(body);
        console.log("receivedFromServer", receivedFromServer);

        let session_id, seat_id;

        let query = `SELECT session_id FROM sessions WHERE film_id = ${receivedFromServer.film_id} AND start_date = '${receivedFromServer.date}' AND start_time = '${receivedFromServer.time}';`;
        const connection = await mysql2.createConnection(config);
        const [rows, fields] = await connection.execute(query);
        session_id = rows[0]['session_id'];
        
        let query2 = `SELECT seat_id FROM seats WHERE session_id = ${session_id} AND seat_number = ${receivedFromServer.seat_number};`;
        const [rows2, fields2] = await connection.execute(query2);
        seat_id = rows2[0]['seat_id'];

        let query3 = `INSERT INTO order_payments (user_id, session_id, seat_id) VALUES ('${receivedFromServer.user_id}', '${session_id}', '${seat_id}');`;
        const [rows3, fields3] = await connection.execute(query3);
        console.log("query3,", query3);
        connection.end();
    });
});

app.get('/isAdmin', (request, response) => {
    //response.send("1");
    let result = "0";
    //console.log("cache.get(username)", cache.get("username"));
    if (cache.get("username") == null) {
        result = "0";
        response.send(result);
    }
    else if (cache.get("username") == '') {
        result = "0";
        response.send(result);
    }
    else  {
        const connection = ConnectToDB(config);  
        let query = "SELECT user_id, is_admin FROM users1 WHERE user_id = " + cache.get("id_username") + ";";
        connection.query(query, (err, res, field) => {
            result = (res[0]['is_admin']).toString();
            console.log("res::: ", result);
            console.log(err);   
            response.send(result);  
        });
        CloseConnectionToDB(connection);   
    }
});

app.get('/getSumOfAllVisitorsFromDB', async (request, response) => {
    let query = "SELECT COUNT(*) AS totalVisitors FROM order_payments";
    const connection = await mysql2.createConnection(config);
    const [rows, fields] = await connection.execute(query);
    response.send((rows[0]['totalVisitors']).toString());
    connection.end();
}); 

app.get('/getFilmsStatisticsFromDB', async (request, response) => {
    let query = `SELECT f.film_id, f.name AS film_name, f.rating AS film_rating, COUNT(DISTINCT s.session_id) AS session_count,
    AVG(s.ticket_price) AS average_ticket_price, COALESCE(ss.total_tickets_sold, 0) AS total_tickets_sold
    FROM films f JOIN sessions s ON f.film_id = s.film_id
    LEFT JOIN order_payments op ON s.session_id = op.session_id
    LEFT JOIN ( SELECT s.film_id, SUM(ss.total_tickets_sold) AS total_tickets_sold
    FROM sessions s JOIN sales_statictics ss ON s.session_id = ss.session_id
    GROUP BY s.film_id ) ss ON f.film_id = ss.film_id GROUP BY f.film_id, f.name, f.rating;`;
    
    const connection = await mysql2.createConnection(config);
    const [rows, fields] = await connection.execute(query);
    //console.log(rows);
    response.send(rows);
    connection.end();
});


app.post('/getSumOfAllVisitorsForThePeriodFromDB', async (request, response, next) => {
    let body = '';
    request.on('data', chunk => {
         body += chunk.toString();
    });
    request.on('end', async () => {
        let receivedFromServer = JSON.parse(body);
        let query = `SELECT COUNT(*) AS totalVisitors FROM order_payments op JOIN sessions s ON op.session_id = s.session_id WHERE s.start_date BETWEEN '${receivedFromServer.startDate}' AND '${receivedFromServer.endDate}';`;
        const connection = await mysql2.createConnection(config);
        const [rows, fields] = await connection.execute(query);
        response.send((rows[0]['totalVisitors']).toString());
        connection.end();
    }); 
});

app.post('/getFilmsStatisticsForThePeriodFromDB', async (request, response, next) => {
    let body = '';
    request.on('data', chunk => {
         body += chunk.toString();
    });
    request.on('end', async () => {
        let receivedFromServer = JSON.parse(body);
        let query = `SELECT f.film_id, f.name AS film_name, f.rating AS film_rating, COUNT(DISTINCT s.session_id) AS session_count,
        AVG(s.ticket_price) AS average_ticket_price, COALESCE(COUNT(op.session_id), 0) AS total_tickets_sold
        FROM films f JOIN sessions s ON f.film_id = s.film_id
        LEFT JOIN order_payments op ON s.session_id = op.session_id
        LEFT JOIN ( SELECT s.film_id, SUM(ss.total_tickets_sold) AS total_tickets_sold FROM sessions s
        JOIN sales_statictics ss ON s.session_id = ss.session_id
        GROUP BY s.film_id ) ss ON f.film_id = ss.film_id WHERE s.start_date 
        BETWEEN '${receivedFromServer.startDate}' AND '${receivedFromServer.endDate}'  GROUP BY f.film_id, f.name, f.rating;`;
        
        const connection = await mysql2.createConnection(config);
        const [rows, fields] = await connection.execute(query);
        response.send(rows);
        connection.end();
    }); 
});

app.get('/getFilmIdsFromDB', async (request, response) => {
    let query = "SELECT film_id FROM films;";
    
    const connection = await mysql2.createConnection(config);
    const [rows, fields] = await connection.execute(query);
    //console.log(rows);
    response.send(rows);
    connection.end();
});

app.get('/getFilmNamesFromDB', async (request, response) => {
    let query = "SELECT name FROM films;";
    
    const connection = await mysql2.createConnection(config);
    const [rows, fields] = await connection.execute(query);
    //console.log(rows);
    response.send(rows);
    connection.end();
});

app.get('/getGenresFromDB', async (request, response) => {
    let query = "SELECT name FROM genres;";
    
    const connection = await mysql2.createConnection(config);
    const [rows, fields] = await connection.execute(query);
    //console.log(rows);
    response.send(rows);
    connection.end();
});

app.post('/AddNewFilmToDB', async (request, response, next) =>  { 
    var receivedFromServer = {
        filmName: request.body.filmName,
        filmDirector: request.body.filmDirector,
        filmDuration: request.body.filmDuration,
        filmDescription: request.body.filmDescription,
        filmPoster: request.body.filmPoster,
        filmTrailer: request.body.filmTrailer
    }; 
    let query = `INSERT INTO films (name, director, duration, description, poster, trailer)
    VALUES (
        '${receivedFromServer.filmName}',
        '${receivedFromServer.filmDirector}',
        '${receivedFromServer.filmDuration}',
        '${receivedFromServer.filmDescription}',
        '${receivedFromServer.filmPoster}',
        '${receivedFromServer.filmTrailer}');`;
    
    const connection = ConnectToDB(config);  
    connection.query(query, (err, result, field) => {
        console.log("ERR", err);
        if (!err) {
            //console.log(query);
            response.status(200).send('Film successfully added!'); 
        } 
        else {
            response.status(409).send('Error while adding film!'); 
        } 
    });		
    CloseConnectionToDB(connection);
});

app.post('/AddNewSessionToDB', async (request, response, next) =>  { 

    var receivedFromServer = {
        selectFilm: request.body.selectFilm,
        startDate: request.body.startDate,
        startTime: request.body.startTime,
        price: request.body.price
    }; 

    const connection = ConnectToDB(config);  

    let query1 = `SELECT film_id FROM films WHERE name='${receivedFromServer.selectFilm}'`; 
    connection.query(query1, (err, result1, field) => {
        //console.log("result1", result1);
        let query2 = `INSERT INTO sessions (film_id, start_date, start_time, ticket_price)
        VALUES ('${result1[0]['film_id']}',
            '${receivedFromServer.startDate}',
            '${receivedFromServer.startTime}:00',
            '${receivedFromServer.price}');`;
        
        connection.query(query2, (err2, result2, field) => {
            //console.log("ERR", err2);
            if (!err) {
                //console.log(query2);
                response.status(200).send('Session successfully added!'); 
            } 
            else {
                response.status(409).send('Error while adding session!'); 
            } 
            CloseConnectionToDB(connection);
        });		
    });	
});

app.post('/AddNewGenreToDB', async (request, response, next) =>  { 
    var receivedFromServer = {
        name: request.body.name
    }; 
    let query = `INSERT INTO genres (name)
    VALUES ('${receivedFromServer.name}');`;
    
    const connection = ConnectToDB(config);  
    connection.query(query, (err, result, field) => {
        console.log("ERR", err);
        if (!err) {
            //console.log(query);
            response.status(200).send('Genre successfully added!'); 
        } 
        else {
            response.status(409).send('Error while adding genre!'); 
        } 
    });		
    CloseConnectionToDB(connection);
});

app.post('/DeleteFilmFromDB', async (request, response, next) =>  { 
    var receivedFromServer = {
        name: request.body.name
    }; 
    let query = `DELETE FROM films WHERE name = '${receivedFromServer.name}';`;
    
    const connection = ConnectToDB(config);  
    connection.query(query, (err, result, field) => {
        console.log("ERR", err);
        if (!err) {
            //console.log(query);
            response.status(200).send('Film successfully deleted!'); 
        } 
        else {
            response.status(409).send('Error during deletion film!'); 
        } 
    });		
    CloseConnectionToDB(connection);
});

app.post('/DeleteGenreFromDB', async (request, response, next) =>  { 
    var receivedFromServer = {
        name: request.body.name
    }; 
    let query = `DELETE FROM genres WHERE name = '${receivedFromServer.name}';`;
    
    const connection = ConnectToDB(config);  
    connection.query(query, (err, result, field) => {
        console.log("ERR", err);
        if (!err) {
            //console.log(query);
            response.status(200).send('Genre successfully deleted!'); 
        } 
        else {
            response.status(409).send('Error during deletion genre!'); 
        } 
    });		
    CloseConnectionToDB(connection);
});

app.get('/getSessionsFromDB', async (request, response, next) =>  { 

    const connection = ConnectToDB(config);  

    let query1 = `SELECT film_id, name FROM films`; 
    let queryResult = {};
    connection.query(query1, (err, result1, field) => {
        //console.log("result1", result1);
        result1.forEach(function (item, i, arr) {
            queryResult[item['film_id']] = { "name": item['name'] };
        });
        console.log("queryResult", queryResult);
        let query2 = `SELECT DISTINCT film_id, DATE_FORMAT(start_date, '%Y-%m-%d') AS start_date, start_time, ticket_price FROM sessions;`;
        
        let queryResult2 = {};
        connection.query(query2, (err2, result2, field) => {
            //console.log("ERR", err2);
            result2.forEach(function (item, i, arr) {
                queryResult2[i] = { "film_name": queryResult[item['film_id']]['name'], "start_date": item['start_date'], "start_time":item["start_time"], "ticket_price":item["ticket_price"] };
            });
            response.send(queryResult2); 
            CloseConnectionToDB(connection);
        });		
    });	
});


app.post('/DeleteSessionFromDB', async (request, response, next) =>  { 
    var receivedFromServer = {
        film_name : request.body.film_name,
        start_date : request.body.start_date,
        start_time : request.body.start_time,
        ticket_price : request.body.ticket_price
    }; 
    let query1 = `SELECT film_id FROM films WHERE name = '${receivedFromServer.film_name}'`; 
    const connection = ConnectToDB(config);  
    connection.query(query1, (err, result, field) => {
        let query2 = `DELETE FROM sessions WHERE film_id = '${result[0]['film_id']}' AND start_date = '${receivedFromServer.start_date}' AND start_time = '${receivedFromServer.start_time}' AND ticket_price = '${receivedFromServer.ticket_price}';`;
        connection.query(query2, (err, result2, field) => {
            //console.log("ERR", err);
            if (!err) {
                //console.log(query);
                response.status(200).send('Session successfully deleted!'); 
            } 
            else {
                response.status(409).send('Error during deletion session!'); 
            } 
            CloseConnectionToDB(connection);
        });
    });		
});