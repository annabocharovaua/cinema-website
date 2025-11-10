var mysql = require('mysql'); 

var connection = require('./db_handler'); 
var pass_handler = require('./password_handler'); 

module.exports = {
	addUser: function(req, res) { 

		var inserts = {
			firstName: req.body.firstName, 
			lastName: req.body.lastName, 
			email: req.body.email, 
			phone: req.body.phone, 
			username: req.body.username, 
			password_hash: pass_handler.encrypt_pass(req.body.password)
		  }

		console.log(inserts.username);
		let query = "INSERT INTO `users1` (`first_name`, `last_name`, `phone`, `email`, `username`, `password`) VALUES ('" + inserts.firstName + "', '" + inserts.lastName + "', '" 
																														   + inserts.phone + "', '" + inserts.email + "', '" 
																														   + inserts.username + "', '" + inserts.password_hash + "')";
		connection.query(query, (err, result, field) => {
			if (!err) res.status(200).send('user created successfully!'); 
			else if (err.code == 'ER_DUP_ENTRY')
				res.status(409).send('User with the same username already exists!');
			 console.log(err);
			 //res.send(result);
		});
		//CloseConnectionToDB(connection);

		/*connection.prepare("INSERT INTO deluxeauto.users (id, username, password) VALUES (" + "1" + "," + inserts.username + ", " + inserts.password_hash + ")", function(err) {
			if (err) console.log(err); 
			
			connection.execute(inserts, function(err, rows) {
				if (!err) res.status(200).send('user created successfully!'); 
				else console.log(err); 
				connection.unprepare(); 
			})
		})*/
	}
}