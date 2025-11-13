/**
 * Validates a password based on specific criteria:
 * - Minimum length of 8 characters
 * - Maximum length of 12 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character from the set [!@#$%^&*]
 *
 * @function validatePassword
 * @param {string} password - The password to be validated.
 * @returns {string} - A message indicating whether the password is valid or a specific validation error.
 * - 'Пароль повинен бути від 8 до 12 символів.' if password length is not within the required range.
 * - 'Пароль повинен містити принаймні одну велику літеру.' if password doesn't contain at least one uppercase letter.
 * - 'Пароль повинен містити принаймні одну малу літеру.' if password doesn't contain at least one lowercase letter.
 * - 'Пароль повинен містити принаймні одну цифру.' if password doesn't contain at least one digit.
 * - 'Пароль повинен містити принаймні один спеціальний символ.' if password doesn't contain at least one special character.
 * - 'valid' if the password meets all criteria.
 */
function validatePassword(password) {
    const minLength = 8;
    const maxLength = 12;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /[0-9]/.test(password);
    const hasSpecialCharacters = /[!@#$%^&*]/.test(password);
    const isValidLength = password.length >= minLength && password.length <= maxLength;

    if (!isValidLength) {
        return 'Пароль повинен бути від 8 до 12 символів.';
    }
    if (!hasUpperCase) {
        return 'Пароль повинен містити принаймні одну велику літеру.';
    }
    if (!hasLowerCase) {
        return 'Пароль повинен містити принаймні одну малу літеру.';
    }
    if (!hasNumbers) {
        return 'Пароль повинен містити принаймні одну цифру.';
    }
    if (!hasSpecialCharacters) {
        return 'Пароль повинен містити принаймні один спеціальний символ.';
    }

    return 'valid';
}

/**
 * Validates form inputs for user registration:
 * - Ensures all fields (firstName, lastName, email, phone, username, password) are filled.
 * - Validates the email format (should be in the form of `username@domain.com`).
 * - Validates the phone number format (should match the pattern `+380XXXXXXXXX`).
 * - Calls the validatePassword function to validate the password based on the set criteria.
 *
 * @function validateForm
 * @param {string} firstName - The user's first name.
 * @param {string} lastName - The user's last name.
 * @param {string} email - The user's email address.
 * @param {string} phone - The user's phone number.
 * @param {string} username - The user's username.
 * @param {string} password - The user's password.
 * @returns {string} - A message indicating whether the form is valid or an error message for the specific field:
 * - 'Будь ласка, введіть коректну електронну пошту' if email format is incorrect.
 * - 'Будь ласка, введіть коректний номер телефону (+380XXXXXXXXX)' if phone number format is incorrect.
 * - 'Будь ласка, заповніть всі поля' if any field is empty.
 * - Returns the message from `validatePassword` if the password is invalid.
 * - 'valid' if all form fields are valid.
 */
function validateForm(firstName, lastName, email, phone, username, password) {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const phoneRegex = /^\+380\d{9}$/;

    if (!email.match(emailRegex)) {
        return 'Будь ласка, введіть коректну електронну пошту';
    }

    if (!phone.match(phoneRegex)) {
        return 'Будь ласка, введіть коректний номер телефону (+380XXXXXXXXX)';
    }

    if (!firstName || !lastName || !email || !phone || !username || !password) {
        return 'Будь ласка, заповніть всі поля';
    }

    const validationPasswordMessage = validatePassword(password);

    if (validationPasswordMessage !== 'valid') {        
        return validationPasswordMessage;
    }

    return 'valid';
}


if (typeof window !== 'undefined') {
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
            const firstName = document.getElementById("firstName").value;
            const lastName = document.getElementById("lastName").value;
            const email = document.getElementById("email").value;
            const phone = document.getElementById("phone").value;
            const username = document.getElementById("username").value;
            const password = document.getElementById("password").value;

            const validationMessage = validateForm(firstName, lastName, email, phone, username, password);

            if (validationMessage !== 'valid') {
                alert(validationMessage);
                return;
            }

            const formData = {
                firstName: firstName,
                lastName: lastName,
                email: email,
                phone: phone,
                username: username,
                password: password
            };

            
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
                    console.error('Error:', xhr.status);
                }  
            };
        }
    }
}
else {
    module.exports = {
        validatePassword,
        validateForm
    };
}