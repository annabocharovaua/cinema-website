var mysql = require('mysql');

var config = {
	host: '127.0.0.1',
	user: "root",
	database: "cinemadb",
	password: "root",
     port: 3306
} 

function ConnectToDB(config) {
    const connection = mysql.createConnection(config);
    connection.connect(function (err) {
         if (err) {
              return console.error("Помилка: " + err.message);
         }
         else {
              console.log("Підключення до сервера MySQL успішно встановлено");
         }
    });
    return connection;
}

var connection = ConnectToDB(config);
module.exports = connection; 