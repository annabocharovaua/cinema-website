var cookieParser = require('cookie-parser');
var session = require('express-session');

// подключение модуля connect-mysql
const MySQLStore = require('express-mysql-session')(session);
var mysql = require('mysql'); 


module.exports = {
    createStore: function () {
        var config = {
            host: "localhost",
            user: "root",
            database: "cinemadb",
            password: "root",
            port: 3307
        } 
        return new MySQLStore(config); 
    }
}