const cache = require('memory-cache');

module.exports = function (app) {
	app.get('/logout', function(req, res) {
		var username = cache.put("username", '');
		//req.session.username = '';
		console.log('logged out'); 
		res.send('logged out!');  
	}); 

	// ограничение доступа к контенту на основе авторизации 
	app.get('/admin', function (req, res) {
		var username = cache.get("username")
		// страница доступна только для админа 
		if (username == 'admin') {
			console.log(username + ' requested admin page');
			res.render('admin_page');
		} else {
			res.status(403).send('Access Denied!');
		}

	}); 

	app.get('/user', function (req, res) {
		var username = cache.get("username");
		// страница доступна для любого залогиненного пользователя 
		if (username.length > 0) {
			console.log(username + ' requested user page');
			//res.render('films.html');
		} else {
			res.status(403).send('Access Denied!');
		}

	});

	app.get('/guest', function (req, res) {

		// страница без ограничения доступа 
		res.render('guest_page'); 
	})
}

