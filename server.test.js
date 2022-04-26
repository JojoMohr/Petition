const { TestWatcher } = require('jest');
const supertest = require('supertest');
const app = require('./server.js');

test("GET /petition -> renders RegisterPage", function() {
    return supertest(app)
        .get("/petition")
        .expect(200);
});

// test("POST / -> redirects to /thanks", ( ) => {
//     return supertest(app)

// })