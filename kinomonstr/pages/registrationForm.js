

window.onload = function () {
    var registration_btn = document.getElementById('registration-btn');
    var entrance_btn = document.getElementById('entrance-btn');


    entrance_btn.onclick = function () {
        if (document.getElementById('sing-in-login').value.length == 0 || 
              document.getElementById('sing-in-password').value.length == 0) {
              alert('invalid data in form!');
              return false; 
          }

          var userData = {
              username: document.getElementById('sing-in-login').value, 
              password: document.getElementById('sing-in-password').value
          };
          var xhr = new XMLHttpRequest(); 
          xhr.open('POST', '/login'); 
           

          xhr.setRequestHeader('Content-Type', 'application/json'); 
          xhr.send(JSON.stringify(userData)); 

          xhr.onload = function() {
            if (xhr.status === 200) {
                  alert(this.responseText); 
                  location.reload();
            }
            else if (xhr.status === 409) {
                alert('user not found!');
            }
            else if (xhr.status === 404) {
                alert('wrong password!');
            }
          }; 

          xhr.onerror = function() {
              alert('server error!'); 
          }

      }

      registration_btn.onclick = function () {
        console.log("AAAAAAAAAAAAAASFDAFDSFDSFGDSFGDS");
        //alert("AAAAAAAAAAAAAASFDAFDSFDSFGDSFGDS");
        const firstName = document.getElementById("firstName").value;
    const lastName = document.getElementById("lastName").value;
    const email = document.getElementById("email").value;
    const phone = document.getElementById("phone").value;
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    // Валідація пошти за допомогою регулярного виразу
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.match(emailRegex)) {
        alert("Будь ласка, введіть коректну електронну пошту");
        return;
    }

    // Валідація телефону за допомогою регулярного виразу
    const phoneRegex = /^\+380\d{9}$/;
    if (!phone.match(phoneRegex)) {
        alert("Будь ласка, введіть коректний номер телефону (+380XXXXXXXXX)");
        return;
    }

    // Перевірка, чи всі поля заповнені
    if (!firstName || !lastName || !email || !phone || !username || !password) {
        alert("Будь ласка, заповніть всі поля");
        return;
    }

    // Якщо ви дійшли до цього моменту, дані введені коректно

    const formData = {
        firstName: firstName,
        lastName: lastName,
        email: email,
        phone: phone,
        username: username,
        password: password
    };

        /*if (document.getElementById('username').value.length == 0 || 
            document.getElementById('password').value.length == 0) {
            alert('invalid data in form!');
            return false; 
        }*/
        var data = {
          firstName: document.getElementById('firstName').value, 
          lastName: document.getElementById('lastName').value, 
          email: document.getElementById('email').value, 
          phone: document.getElementById('phone').value, 
          username: document.getElementById('username').value, 
          password: document.getElementById('password').value
        }

        var xhr = new XMLHttpRequest();
        xhr.open('POST', '/signup'); 

        xhr.setRequestHeader('Content-Type', 'application/json'); 
        xhr.send(JSON.stringify(data));

        xhr.onload = function () {
            if (xhr.status === 200) {
                alert('user successfully created!'); 
                location.reload();
            } else if (xhr.status === 409) {
                alert('User with the same username already exists!');
            } else {
                // Другие случаи ответов
                console.error('Error:', xhr.status);
            }  
        };
    }
}
