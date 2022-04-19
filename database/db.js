const spicedPg = require('spiced-pg');
const db = spicedPg('postgres:postgres:postgres@localhost:5432/places');

module.exports.getAllCities = () => db.query('SELECT * FROM cities');

module.exports.addCity = (city, pop, country) => {
    const query = `
        INSERT INTO cities (name, population, country)
        VALUES ($1, $2, $3)
        RETURNING *
    `;
    const params = [city, pop, country];
    return db.query(query, params);
}