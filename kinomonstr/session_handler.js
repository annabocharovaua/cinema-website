var cookieParser = require('cookie-parser');
var session = require('express-session');

//Підключення модуля connect-mysql
const MySQLStore = require('express-mysql-session')(session);
var mysql = require('mysql'); 


module.exports = {
    createStore: function () {
        var config = {
            host: '127.0.0.1',
            user: "root",
            database: "cinemadb",
            password: "root",
            port: 3306
        } 
        return new MySQLStore(config); 
    }
}