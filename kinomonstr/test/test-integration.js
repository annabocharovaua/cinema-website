const request = require('supertest');
const express = require('express');
const app = require('../database.js');
const { expect } = require('chai');

describe('API Integration Tests', () => {
    let originalLog;

    before(() => {
        originalLog = console.log;
        console.log = () => {};
    });

    it('should log in successfully with correct credentials', (done) => {
        request(app)
            .post('/login')
            .send({ username: 'mykolaS', password: 'mykolaS#1' })
            .expect(200)
            .expect((res) => {
                expect(res.text).to.include('logged in');
            })
            .end(done);
    });

    it('should return 404 for incorrect password', (done) => {
        request(app)
            .post('/login')
            .send({ username: 'mykolaS', password: 'NotPassword' })
            .expect(404)
            .expect((res) => {
                expect(res.text).to.equal('wrong password!');
            })
            .end(done);
    });

    it('should return 409 for non-existing user', (done) => {
        request(app)
            .post('/login')
            .send({ username: 'nonExistingUser', password: 'somePassword' })
            .expect(409)
            .expect((res) => {
                expect(res.text).to.equal('user not found!');
            })
            .end(done);
    });

    it('should return film details, genres, and reviews', (done) => {
        const filmId = 8;

        request(app)
            .get(`/getFilmDetails/${filmId}`)
            .expect('Content-Type', /json/)
            .expect(200)
            .end((err, res) => {
                if (err) return done(err);

                expect(res.body).to.be.an('array').that.is.not.empty;
               
                const filmDetails = res.body[0]; 

                expect(filmDetails).to.have.property('film_id');
                expect(filmDetails).to.have.property('name');
                expect(filmDetails).to.have.property('director');
                expect(filmDetails).to.have.property('duration');
                expect(filmDetails).to.have.property('description');
                expect(filmDetails).to.have.property('poster');
                expect(filmDetails).to.have.property('trailer');
                expect(filmDetails).to.have.property('rating');
                expect(filmDetails).to.have.property('count_ratings');
                expect(filmDetails).to.have.property('film_genres');
                expect(filmDetails).to.have.property('film_reviews');

                expect(filmDetails.film_genres).to.be.a('string');
                
                expect(filmDetails.film_reviews).to.be.an('array');
               
                if (filmDetails.film_reviews.length > 0) {
                    expect(filmDetails.film_reviews[0]).to.have.property('review_id');
                    expect(filmDetails.film_reviews[0]).to.have.property('id_film');
                    expect(filmDetails.film_reviews[0]).to.have.property('id_user');
                    expect(filmDetails.film_reviews[0]).to.have.property('rating');
                    expect(filmDetails.film_reviews[0]).to.have.property('review_date');
                    expect(filmDetails.film_reviews[0]).to.have.property('review_text');
                    expect(filmDetails.film_reviews[0]).to.have.property('first_name');
                    expect(filmDetails.film_reviews[0]).to.have.property('last_name');
                }

                done();
            });
    });

    it('GET /getSessions/:filmId/:date should return film sessions', (done) => {
        request(app)
            .get('/getSessions/9/2024-11-03')
            .expect('Content-Type', /json/)
            .expect(200)
            .end((err, res) => {
                if (err) return done(err);
                expect(res.body).to.be.an('array');
                done();
            });
    });
    
    it('POST /signOut should log out the user', (done) => {
        request(app)
            .post('/signOut')
            .expect(200)
            .end((err, res) => {
                if (err) return done(err);
                expect(res.text).to.equal('You have successfully logged out!'); // Ваше повідомлення про вихід
                done();
            });
    });

    it('should return the total number of visitors as a string', async () => {
        const res = await request(app).get('/getSumOfAllVisitorsFromDB');
        
        expect(res.status).to.equal(200);
        expect(res.text).to.match(/^\d+$/); // Перевіряємо, що відповідь є числом у вигляді рядка
    });

    it('should return the total profit as a string', async () => {
        const res = await request(app).get('/getTotalProfitFromDB');
        
        expect(res.status).to.equal(200);
        expect(res.text).to.match(/^\d+$/); // Перевіряємо, що відповідь є числом у вигляді рядка
    });

    it('should return the total number of visitors for a given period as a numeric string', async () => {
        const payload = {
            startDate: '2024-12-01',
            endDate: '2024-12-31'
        };

        const res = await request(app)
            .post('/getSumOfAllVisitorsForThePeriodFromDB')
            .send(payload)
            .set('Content-Type', '/json/');

        // Перевіряємо, що статус відповіді 200
        expect(res.status).to.equal(200);

        // Перевіряємо, що відповідь є числом у вигляді рядка
        expect(res.text).to.match(/^\d+$/);
    });

    it('should add a session successfully and return status 200', async () => {
        const payload = {
            selectFilm: 'Крижане серце', 
            startDate: '2024-11-01', 
            startTime: '18:00', 
            price: '100.00' 
        };

        const res = await request(app)
            .post('/AddNewSessionToDB') 
            .send(payload)
            .set('Content-Type', 'application/json');

        expect(res.status).to.equal(200);
        expect(res.text).to.equal('Session successfully added!'); 
    });

    it('should delete a session successfully and return status 200', async () => {
        var payload = {
            film_name : 'Крижане серце', 
            start_date : '2024-11-01', 
            start_time : '18:00', 
            ticket_price : '100.00' 
        };

        const deleteRes = await request(app)
            .post('/DeleteSessionFromDB')
            .set('Content-Type', 'application/json')
            .send(JSON.stringify(payload));

        expect(deleteRes.status).to.equal(200);
        expect(deleteRes.text).to.equal('Session successfully deleted!'); // Перевірка, що текст відповіді правильний
    });

    after(() => {
        console.log = originalLog;
    });
});

if (require.main === module) {
    require('mocha/bin/mocha');
}
