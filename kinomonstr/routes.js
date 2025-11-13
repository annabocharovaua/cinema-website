const cache = require('memory-cache');

module.exports = function (app) {
	app.get('/logout', function(req, res) {
		var username = cache.put("username", '');
		console.log('logged out'); 
		res.send('logged out!');  
	}); 

// обмеження доступу до контенту на основі авторизації
	app.get('/admin', function (req, res) {
		var username = cache.get("username")
			// сторінка доступна тільки для адміністратора 
		if (username == 'admin') {
			console.log(username + ' requested admin page');
			res.render('admin_page');
		} else {
			res.status(403).send('Access Denied!');
		}

	}); 

	app.get('/user', function (req, res) {
		var username = cache.get("username");
			// сторінка доступна для будь-якого залогіненого користувача
		if (username.length > 0) {
			console.log(username + ' requested user page');
		} else {
			res.status(403).send('Access Denied!');
		}

	});

	app.get('/guest', function (req, res) {
		// сторінка без обмежень доступу
		res.render('guest_page'); 
	})
}

