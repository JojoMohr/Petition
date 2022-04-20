const spicedPg = require('spiced-pg');
const db = spicedPg('postgres:postgres:postgres@localhost:5432/petition');

// module.exports.getAllCities = () => db.query('SELECT * FROM cities');

module.exports.addSign = (firstName, lastName, signature) => {
    const query = `
        INSERT INTO signatures (firstName, lastName, signature)
        VALUES ($1, $2, $3)
        RETURNING *
    `;
    const params = [firstName, lastName, signature];
    return db.query(query, params);
}