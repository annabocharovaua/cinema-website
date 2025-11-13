const path = require('path');
const cache = require('memory-cache');
const express = require('express');
const app = express();

var cookieParser = require('cookie-parser');
var session = require('express-session');
var bodyParser = require('body-parser');

var jsonParser = bodyParser.json();
app.use(jsonParser);

// Створення сховища для сесій
var sessionHandler = require('./session_handler');
var store = sessionHandler.createStore();

//Створення сесії
app.use(cookieParser());


var handlers = require('./queries');
var signup = require('./signup');
var routes_hangler = 
require('./routes')(app);

app.get('/all', handlers.get_users);

app.post('/login', handlers.check_user);
app.post('/login', handlers.check_pass);
app.post('/signOut', handlers.singOut);

// реєстрація користувача
app.post('/signup', signup.addUser);

// обмеження доступу до контенту на основі авторизації
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

/**
 * Establishes a connection to the MySQL database using the provided configuration.
 *
 * @param {object} config - Configuration object containing connection details (e.g., host, user, password, database).
 * @returns {object} - The MySQL connection object.
 * @throws {Error} - Logs an error if unable to establish a connection to the database.
 */
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

/**
 * Closes an active MySQL database connection.
 *
 * @param {object} connection - The MySQL connection object to be closed.
 * @throws {Error} - Logs an error if unable to close the connection.
 */
function CloseConnectionToDB(connection) {
     connection.end(function (err) {
          if (err) {
               return console.log("Помилка: " + err.message);
          }
           console.log("Підключенння завершено");
     });
}

/**
 * Endpoint for retrieving a list of films from the database, including associated genres.
 *
 * @name GET /getFilmsFromDB
 * @function
 * @param {object} request - The Express request object.
 * @param {object} response - The Express response object used to send the list of films as a JSON object.
 * @returns {Array.<object>} - An array of film objects, each containing film details and associated genres.
 * @throws {Error} - Returns an error if there is an issue with database queries or connection handling.
 */
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

/**
 * Endpoint for retrieving a list of films with their IDs, names, and posters from the database.
 *
 * @name GET /getPosterNewFilmsFromDB
 * @function
 * @param {object} request - The Express request object.
 * @param {object} response - The Express response object used to send a JSON array of film objects.
 * @returns {Array.<object>} - An array of film objects, each containing `film_id`, `name`, and `poster`.
 * @throws {Error} - Returns an error if there is an issue with the database query or connection handling.
 */
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

/**
 * Endpoint for retrieving detailed information about a specific film by its ID.
 *
 * @name GET /getFilmDetails/:filmId
 * @function
 * @param {object} request - The Express request object containing `filmId` as a URL parameter.
 * @param {object} response - The Express response object used to send a JSON object with film details.
 * @returns {object} - An object containing film details, including genres and user reviews.
 * @throws {Error} - Returns an error if there is an issue with database queries or connection handling.
 */
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

/**
 * Endpoint for retrieving a list of films sorted by their ratings in descending order.
 *
 * @name GET /getRatingFilmsFromDB
 * @function
 * @param {object} request - The Express request object.
 * @param {object} response - The Express response object used to send a JSON array of film objects.
 * @returns {Array.<object>} - An array of film objects, each containing `film_id`, `name`, and `rating`.
 * @throws {Error} - Returns an error if there is an issue with the database query or connection handling.
 */
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
        response.send(queryResult);
    });

    CloseConnectionToDB(connection);    
});

/**
 * Endpoint for retrieving all films with their IDs, names, posters, ratings, and genres, ordered by rating.
 *
 * @name GET /getRatingAllFilmsFromDB
 * @function
 * @param {object} request - The Express request object.
 * @param {object} response - The Express response object used to send a JSON array of film objects.
 * @returns {Array.<object>} - An array of film objects, each containing `film_id`, `name`, `poster`, `rating`, and `film_genres`.
 * @throws {Error} - Returns an error if there is an issue with the database query or connection handling.
 */
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

/**
 * Endpoint for retrieving cached username and user ID.
 *
 * @name GET /getUsernameAndId
 * @function
 * @param {object} request - The Express request object.
 * @param {object} response - The Express response object used to send the cached user information.
 * @returns {object} - An object with `id_username` and `username` if available in the cache, or `0` if not.
 */
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

/**
 * Endpoint for retrieving the user's first and last name based on a cached user ID.
 *
 * @name GET /getFirstAndLastName
 * @function
 * @param {object} request - The Express request object.
 * @param {object} response - The Express response object used to send the user's name data.
 * @returns {object|string} - An object containing `user_id`, `first_name`, and `last_name` if user data is found, or "0" if not.
 * @throws {Error} - Returns an error if there is an issue with the database query or connection handling.
 */
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

/**
 * Endpoint to post a review for a film in the database.
 *
 * @name POST /postReviewToDB
 * @function
 * @param {object} req - The Express request object, expected to contain `film_id`, `user_id`, `grade`, and `comment` in `req.body`.
 * @param {object} res - The Express response object used to send a success or failure message.
 * @param {function} next - Middleware callback function for error handling.
 * @returns {string} - A success message if the review is added, or an error message if there is a conflict or other error.
 * @throws {Error} - Returns an error if there is an issue with the database query or connection handling.
 */
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

/**
 * Endpoint to retrieve available dates with film sessions for a specified film.
 *
 * @name GET /getDaysWithSessions/:filmId
 * @function
 * @param {object} request - The Express request object, expected to contain `filmId` as a URL parameter.
 * @param {object} response - The Express response object used to send an array of session dates.
 * @returns {Array.<string>} - An array of strings representing dates with available sessions for the specified film.
 * @throws {Error} - Returns an error if there is an issue with the database query or connection handling.
 */
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

/**
 * Endpoint to retrieve available session times for a specified film on a specified date.
 *
 * @name GET /getSessions/:filmId/:date
 * @function
 * @param {object} request - The Express request object, expected to contain `filmId` and `date` as URL parameters.
 * @param {object} response - The Express response object used to send an array of session times.
 * @returns {Array.<string>} - An array of strings representing session start times for the specified film on the specified date.
 * @throws {Error} - Returns an error if there is an issue with the database query or connection handling.
 */
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

/**
 * Endpoint to retrieve seat availability for a specified film session.
 *
 * @name GET /getSeats/:filmId/:date/:time
 * @function
 * @param {object} request - The Express request object, expected to contain `filmId`, `date`, and `time` as URL parameters.
 * @param {object} response - The Express response object used to send seat availability information.
 * @returns {Array.<object>} - An array of seat objects, each containing `row_num`, `seat_number`, and `is_available` status.
 * @throws {Error} - Returns an error if there is an issue with the database query or connection handling.
 */
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

/**
 * Endpoint to buy a ticket for a specified seat in a session.
 *
 * @name POST /postBuyTicket
 * @function
 * @param {object} request - The Express request object, expected to contain `film_id`, `date`, `time`, `seat_number`, and `user_id` in the request body.
 * @param {object} response - The Express response object.
 * @returns {string} - A success message or error message, indicating whether the ticket was successfully purchased.
 * @throws {Error} - Returns an error if there is an issue with the database query or connection handling.
 */
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
        
        let query2 = `SELECT seat_id FROM seats WHERE session_id = ${session_id} AND seat_number = ${receivedFromServer.seat_number} AND row_num = ${receivedFromServer.row_num};`;
        const [rows2, fields2] = await connection.execute(query2);
        seat_id = rows2[0]['seat_id'];

        let query3 = `INSERT INTO order_payments (user_id, session_id, seat_id) VALUES ('${receivedFromServer.user_id}', '${session_id}', '${seat_id}');`;
        const [rows3, fields3] = await connection.execute(query3);
        console.log("query3,", query3);
        connection.end();
    });
});

/**
 * Endpoint to check if the current user is an admin.
 *
 * @name GET /isAdmin
 * @function
 * @param {object} request - The Express request object.
 * @param {object} response - The Express response object.
 * @returns {string} - Returns `"1"` if the user is an admin, `"0"` otherwise.
 * @throws {Error} - Returns an error if there is an issue with the database query or connection handling.
 */
app.get('/isAdmin', (request, response) => {
    let result = "0";    
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
            console.log("res: ", result);
            console.log(err);   
            response.send(result);  
        });
        CloseConnectionToDB(connection);   
    }
});

/**
 * Endpoint to retrieve the total number of visitors by counting all entries in the order_payments table.
 *
 * @name GET /getSumOfAllVisitorsFromDB
 * @function
 * @param {object} request - The Express request object.
 * @param {object} response - The Express response object.
 * @returns {string} - The total number of visitors as a string.
 * @throws {Error} - Returns an error if there is an issue with the database query or connection handling.
 */
app.get('/getSumOfAllVisitorsFromDB', async (request, response) => {
    let query = "SELECT COUNT(*) AS totalVisitors FROM order_payments";
    const connection = await mysql2.createConnection(config);
    const [rows, fields] = await connection.execute(query);
    response.send((rows[0]['totalVisitors']).toString());
    connection.end();
}); 

/**
 * Endpoint to retrieve the total profit from all orders in the order_payments table.
 *
 * @name GET /getTotalProfitFromDB
 * @function
 * @param {object} request - The Express request object.
 * @param {object} response - The Express response object.
 * @returns {string} - The total profit as a string.
 * @throws {Error} - Returns an error if there is an issue with the database query or connection handling.
 */
app.get('/getTotalProfitFromDB', async (request, response) => {
    let query = "SELECT COUNT(*) AS totalVisitors FROM order_payments";
    const connection = await mysql2.createConnection(config);
    const [rows, fields] = await connection.execute(query);
    response.send((rows[0]['totalVisitors']).toString());
    connection.end();
}); 

/**
 * Endpoint to retrieve the total profit for a specific period.
 *
 * @name POST /getTotalProfitForThePeriodFromDB
 * @function
 * @param {object} request - The Express request object, expected to contain `startDate` and `endDate` in the request body as date strings.
 * @param {object} response - The Express response object.
 * @returns {string} - The total profit within the specified date range as a string.
 * @throws {Error} - Returns an error if there is an issue with the database query or connection handling.
 */
app.post('/getTotalProfitForThePeriodFromDB', async (request, response) => {
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

/**
 * Endpoint to retrieve statistics of films from the database.
 * Retrieves film information such as film ID, name, rating, session count, average ticket price, and total tickets sold.
 *
 * @name GET /getFilmsStatisticsFromDB
 * @function
 * @param {object} request - The Express request object.
 * @param {object} response - The Express response object.
 * @returns {array} - An array of objects containing the film statistics.
 * @throws {Error} - Returns an error if there is an issue with the database query or connection handling.
 */
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

/**
 * Endpoint to retrieve the total number of visitors within a specified period from the database.
 * Counts all visitors based on order payments for sessions within the date range.
 *
 * @name POST /getSumOfAllVisitorsForThePeriodFromDB
 * @function
 * @param {object} request - The Express request object, expected to contain `startDate` and `endDate` in the request body as date strings.
 * @param {object} response - The Express response object.
 * @returns {string} - The total number of visitors as a string.
 * @throws {Error} - Returns an error if there is an issue with the database query or connection handling.
 */
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

/**
 * Endpoint to retrieve statistics of films for a specified period from the database.
 * Retrieves film information such as film ID, name, rating, session count, average ticket price, and total tickets sold within the date range.
 *
 * @name POST /getFilmsStatisticsForThePeriodFromDB
 * @function
 * @param {object} request - The Express request object, expected to contain `startDate` and `endDate` in the request body as date strings.
 * @param {object} response - The Express response object.
 * @returns {array} - An array of objects containing the film statistics for the specified period.
 * @throws {Error} - Returns an error if there is an issue with the database query or connection handling.
 */
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

/**
 * Endpoint to retrieve all film IDs from the database.
 * Retrieves a list of all film IDs.
 *
 * @name GET /getFilmIdsFromDB
 * @function
 * @param {object} request - The Express request object.
 * @param {object} response - The Express response object.
 * @returns {array} - An array of objects containing film IDs.
 * @throws {Error} - Returns an error if there is an issue with the database query or connection handling.
 */
app.get('/getFilmIdsFromDB', async (request, response) => {
    let query = "SELECT film_id FROM films;";
    
    const connection = await mysql2.createConnection(config);
    const [rows, fields] = await connection.execute(query);
    //console.log(rows);
    response.send(rows);
    connection.end();
});

/**
 * Endpoint to retrieve all film names from the database.
 * Retrieves a list of all film names.
 *
 * @name GET /getFilmNamesFromDB
 * @function
 * @param {object} request - The Express request object.
 * @param {object} response - The Express response object.
 * @returns {array} - An array of objects containing film names.
 * @throws {Error} - Returns an error if there is an issue with the database query or connection handling.
 */
app.get('/getFilmNamesFromDB', async (request, response) => {
    let query = "SELECT name FROM films;";
    
    const connection = await mysql2.createConnection(config);
    const [rows, fields] = await connection.execute(query);
    //console.log(rows);
    response.send(rows);
    connection.end();
});

/**
 * Endpoint to retrieve all genre names from the database.
 * Retrieves a list of all genre names.
 *
 * @name GET /getGenresFromDB
 * @function
 * @param {object} request - The Express request object.
 * @param {object} response - The Express response object.
 * @returns {array} - An array of objects containing genre names.
 * @throws {Error} - Returns an error if there is an issue with the database query or connection handling.
 */
app.get('/getGenresFromDB', async (request, response) => {
    let query = "SELECT name FROM genres;";
    
    const connection = await mysql2.createConnection(config);
    const [rows, fields] = await connection.execute(query);
    //console.log(rows);
    response.send(rows);
    connection.end();
});

/**
 * Endpoint to add a new film to the database.
 * This endpoint receives film details such as name, director, duration, description, poster, trailer, and genres,
 * and inserts them into the films and film_genres tables in the database.
 *
 * @name POST /AddNewFilmToDB
 * @function
 * @param {object} request - The Express request object, expected to contain film details in the body, such as:
 *   - `filmName` (string): Name of the film.
 *   - `filmDirector` (string): Director of the film.
 *   - `filmDuration` (number): Duration of the film in minutes.
 *   - `filmDescription` (string): Description of the film.
 *   - `filmPoster` (string): URL or path to the film's poster image.
 *   - `filmTrailer` (string): URL or path to the film's trailer.
 *   - `filmGenres` (string): Comma-separated list of genres for the film.
 * @param {object} response - The Express response object.
 * @returns {string} - A success message if the film is added successfully, or an error message if an error occurs.
 * @throws {Error} - Returns an error if there is an issue with the database query, genre insertion, or connection handling.
 */
app.post('/AddNewFilmToDB', async (request, response, next) => { 
    try {
        var receivedFromServer = {
            filmName: request.body.filmName,
            filmDirector: request.body.filmDirector,
            filmDuration: request.body.filmDuration,
            filmDescription: request.body.filmDescription,
            filmPoster: request.body.filmPoster,
            filmTrailer: request.body.filmTrailer,
            filmGenres: request.body.filmGenres
        }; 
        //console.log(receivedFromServer);

        let query = `INSERT INTO films (name, director, duration, description, poster, trailer)
        VALUES (
            '${receivedFromServer.filmName}',
            '${receivedFromServer.filmDirector}',
            '${receivedFromServer.filmDuration}',
            '${receivedFromServer.filmDescription}',
            '${receivedFromServer.filmPoster}',
            '${receivedFromServer.filmTrailer}');`;

        const connection = ConnectToDB(config);  
        
        connection.query(query, async (err, result, field) => {
            if (err) {
                console.error("Error in main query:", err);
                response.status(500).send('Internal Server Error'); 
                CloseConnectionToDB(connection);
                return;
            }

            //console.log("newFilmId: ", result.insertId);

            let genresArray = receivedFromServer.filmGenres.split(',');
            //console.log("genresArray", genresArray);

            for (let genre of genresArray) {
                let query2 = `SELECT genre_id FROM genres WHERE name = '${genre}'`;
            
                try {
                    let res = await queryPromise(connection, query2);
                    let genreId = res[0]['genre_id'];
            
                    // Перевірка наявності запису перед вставкою
                    let query3Check = `SELECT * FROM film_genres WHERE film_id = '${result.insertId}' AND genre_id = '${genreId}'`;
                    let existingRecord = await queryPromise(connection, query3Check);
            
                    if (existingRecord.length === 0) {
                        let query3 = `INSERT INTO film_genres (film_id, genre_id) VALUES ('${result.insertId}', '${genreId}');`;
                        await queryPromise(connection, query3);
                    }
                } catch (error) {
                    console.error("Error in genre query:", error);
                    response.status(409).send('Error while adding film!');
                    CloseConnectionToDB(connection);
                    return;
                }
            }

            response.status(200).send('Film successfully added!');
            CloseConnectionToDB(connection);
        });
    } catch (error) {
        console.error("Unexpected error:", error);
        response.status(500).send('Internal Server Error');
    }
});

/**
 * A helper function that wraps database queries in a promise to be used with async/await syntax.
 *
 * @function queryPromise
 * @param {object} connection - The database connection object.
 * @param {string} sql - The SQL query string to be executed.
 * @returns {Promise} - A promise that resolves with the query result or rejects with an error.
 */
function queryPromise(connection, sql) {
    return new Promise((resolve, reject) => {
        connection.query(sql, (err, result, fields) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
}

/**
 * Adds a new session to the database for a selected film, including the start date, start time, and ticket price.
 * The film ID is fetched first based on the film name, and then a new session is created.
 *
 * @function AddNewSessionToDB
 * @param {string} selectFilm - The name of the film for which the session is being added.
 * @param {string} startDate - The start date of the session in `YYYY-MM-DD` format.
 * @param {string} startTime - The start time of the session in `HH:MM` format.
 * @param {number} price - The price of the session ticket.
 * @returns {void} - Sends a response indicating whether the session was successfully added or an error occurred.
 */
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

/**
 * Adds a new genre to the database.
 * This function inserts a new genre name into the `genres` table.
 *
 * @function AddNewGenreToDB
 * @param {string} name - The name of the genre to be added.
 * @returns {void} - Sends a response indicating whether the genre was successfully added or an error occurred.
 */
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

/**
 * Deletes a film from the database based on the film's name.
 * The function deletes the film entry from the `films` table.
 *
 * @function DeleteFilmFromDB
 * @param {string} name - The name of the film to be deleted.
 * @returns {void} - Sends a response indicating whether the film was successfully deleted or an error occurred.
 */
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

/**
 * Deletes a genre from the database based on the genre's name.
 * This function deletes the genre entry from the `genres` table.
 *
 * @function DeleteGenreFromDB
 * @param {string} name - The name of the genre to be deleted.
 * @returns {void} - Sends a response indicating whether the genre was successfully deleted or an error occurred.
 */
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

/**
 * Retrieves all sessions from the database, including film names, session dates, times, and ticket prices.
 * The results are formatted into a JSON object with session details.
 *
 * @function getSessionsFromDB
 * @returns {void} - Sends a response containing session data in JSON format.
 */
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

/**
 * Deletes a session from the database based on the film's name, session date, time, and ticket price.
 * This function deletes the session entry from the `sessions` table.
 *
 * @function DeleteSessionFromDB
 * @param {string} film_name - The name of the film for which the session is being deleted.
 * @param {string} start_date - The start date of the session in `YYYY-MM-DD` format.
 * @param {string} start_time - The start time of the session in `HH:MM` format.
 * @param {number} ticket_price - The ticket price of the session to be deleted.
 * @returns {void} - Sends a response indicating whether the session was successfully deleted or an error occurred.
 */
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
            if (!err) {
                
                response.status(200).send('Session successfully deleted!'); 
            } 
            else {
                response.status(409).send('Error during deletion session!'); 
            } 
            CloseConnectionToDB(connection);
        });
    });		
});

/**
 * Retrieves order payment information for a specific user and film, if sessions exist for the given film.
 * The results are formatted into a JSON object with order details.
 *
 * @function getOrderPaymentsForUserAndFilm
 * @param {number} user_id - The ID of the user.
 * @param {number} film_id - The ID of the film.
 * @returns {void} - Sends a response containing order payment data in JSON format.
 */
app.get('/getOrderPaymentsForUserAndFilm', async (request, response, next) => {
    let result = "0";

    const { user_id, film_id } = request.query;
    if (!user_id || !film_id) {
        return response.status(400).send({ error: 'user_id and film_id are required' });
    }

    const connection = ConnectToDB(config);

    let query = `
        SELECT * 
        FROM cinemadb.order_payments op
        WHERE op.user_id = ? 
        AND EXISTS (
            SELECT 1
            FROM cinemadb.sessions s
            WHERE s.film_id = ? AND s.session_id = op.session_id
        );
    `;

    connection.query(query, [user_id, film_id], (err, result, field) => {
        if (result.length > 0) {
            response.send(result);
        } else {
            result = "0";        
        }
        CloseConnectionToDB(connection);
    });
});

module.exports = app;

/**
 * A function that transforms a function into its curried version.
 * Currying allows a function to be called with one argument at a time, 
 * and it returns a function that can be invoked with additional arguments 
 * until all required arguments are provided.
 *
 * @function curry
 * @param {Function} func - The function to be curried.
 * @returns {Function} - A new function that accepts arguments in a curried manner.
 *
 * @example
 * function add(a, b) {
 *     return a + b;
 * }
 * const curriedAdd = curry(add);
 * curriedAdd(1)(2); // returns 3
 */
function curry(func) {
    return function curried(...args) {
         if (args.length >= func.length) {
              return func.apply(this, args);
         } 
         else {
              return function(...args2) {
                   return curried.apply(this, args.concat(args2));
              }
         }
    };
}
