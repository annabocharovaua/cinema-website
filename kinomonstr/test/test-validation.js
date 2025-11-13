const chai = require('chai');
const expect = chai.expect;
const {validatePassword, validateForm} = require('../pages/registrationForm.js');

describe('Password Validation', () => {
    it('should return valid for a strong password', () => {
        const result = validatePassword('StrongP@ss1');
        expect(result).to.equal('valid');
    });

    it('should return error for password without uppercase', () => {
        const result = validatePassword('password1!');
        expect(result).to.equal('Пароль повинен містити принаймні одну велику літеру.');
    });

    it('should return error for password without lowercase', () => {
        const result = validatePassword('PASSWORD1!');
        expect(result).to.equal('Пароль повинен містити принаймні одну малу літеру.');
    });

    it('should return error for password without number', () => {
        const result = validatePassword('Password!');
        expect(result).to.equal('Пароль повинен містити принаймні одну цифру.');
    });

    it('should return error for password without special character', () => {
        const result = validatePassword('Password1');
        expect(result).to.equal('Пароль повинен містити принаймні один спеціальний символ.');
    });

    it('should return error for password too short', () => {
        const result = validatePassword('Short1!');
        expect(result).to.equal('Пароль повинен бути від 8 до 12 символів.');
    });

    it('should return error for password too long', () => {
        const result = validatePassword('ThisPasswordIsWayTooLong1!');
        expect(result).to.equal('Пароль повинен бути від 8 до 12 символів.');
    });
});

describe('Form Validation', () => {
    it('should return valid for a complete form', () => {
        const result = validateForm('John', 'Doe', 'john.doe@example.com', '+380123456789', 'johndoe', 'StrongP@ss1');
        expect(result).to.equal('valid');
    });

    it('should return error for empty fields', () => {
        const result = validateForm('', 'Doe', 'john.doe@example.com', '+380123456789', 'johndoe', 'StrongP@ss1');
        expect(result).to.equal('Будь ласка, заповніть всі поля');
    });

    it('should return error for invalid email', () => {
        const result = validateForm('John', 'Doe', 'invalidemail', '+380123456789', 'johndoe', 'StrongP@ss1');
        expect(result).to.equal('Будь ласка, введіть коректну електронну пошту');
    });

    it('should return error for invalid phone', () => {
        const result = validateForm('John', 'Doe', 'john.doe@example.com', '123456789', 'johndoe', 'StrongP@ss1');
        expect(result).to.equal('Будь ласка, введіть коректний номер телефону (+380XXXXXXXXX)');
    });

    it('should return password validation error', () => {
        const result = validateForm('John', 'Doe', 'john.doe@example.com', '+380123456789', 'johndoe', 'weak');
        expect(result).to.equal('Пароль повинен бути від 8 до 12 символів.');
    });
});
