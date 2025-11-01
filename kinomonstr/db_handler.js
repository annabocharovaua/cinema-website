var mysql = require('mysql');

var config = {
	host: "localhost",
	user: "root",
	database: "cinemadb",
	password: "root",
     port: 3307
} 

function ConnectToDB(config) {
    const connection = mysql.createConnection(config);
    connection.connect(function (err) {
         if (err) {
              return console.error("Ошибка: " + err.message);
         }
         else {
              console.log("Подключение к серверу MySQL успешно установлено");
         }
    });
    return connection;
}
var connection = ConnectToDB(config);
module.exports = connection; 