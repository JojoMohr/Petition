// REQUIERE THE $1 SYNTAX FOR SECURITY MATTERS
const spicedPg = require('spiced-pg');

// db equals your Petition Postgres Server ////////
const db = spicedPg('postgres:postgres:postgres@localhost:5432/petition');

// module.exports.getAllCities = () => db.query('SELECT * FROM cities');


////////// INSERT NEW ROW IN SIGNITURES TABLE /////////////
module.exports.addSign = (firstName, lastName, signature) => {
    const query = `
        INSERT INTO signatures (firstName, lastName, signature)
        VALUES ($1, $2, $3)
        RETURNING *
    `;
    const params = [firstName, lastName, signature];
    return db.query(query, params);
}

module.exports.getSign = () => {
    return db.query("SELECT * FROM signatures")
}

module.exports.getSigCount = () => {
    return db.query("SELECT COUNT(id) FROM signatures")
}

module.exports.getSigById = (sessionId) => {
    return db.query(`SELECT * FROM signatures WHERE id = ${sessionId}`);
}