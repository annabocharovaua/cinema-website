const path = require('path');
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
var routes_hangler = require('./routes')(app);

app.get('/all', handlers.get_users);

app.post('/login', handlers.check_user);
app.post('/login', handlers.check_pass);

// регистрация пользователя 
app.post('/signup', signup.addUser);

// ограничение доступа к контенту на основе авторизации 
app.get('/check', function (req, res) {
    if (req.session.username) {
        res.send('hello, user ' + req.session.username);
   } else {
        res.send('Not logged in(');
    }
});




app.use(express.static(path.join(__dirname, 'pages')))
app.get('/', (request, response) => {
     res.sendFile(`${__dirname}/pages/index.html`);
});

const hostname = '127.0.0.1';
const port = 3333;
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
    WHERE fr.id_film = ${filmId} AND fr.review_text IS NOT NULL;`

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
        console.log(queryResult);
        response.send(queryResult);
    });

    CloseConnectionToDB(connection);    
});



