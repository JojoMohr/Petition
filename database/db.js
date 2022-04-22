// REQUIERE DRIVER
const spicedPg = require('spiced-pg');

// db equals your Petition Postgres Server ////////
const db = spicedPg('postgres:postgres:postgres@localhost:5432/petition');

// module.exports.getAllCities = () => db.query('SELECT * FROM cities');
const bcrypt = require("bcryptjs");

function hashPassword(password) {
    return bcrypt.genSalt().then((salt) => {
        return bcrypt.hash(password, salt);
    });
}




////////// INSERT NEW ROW IN SIGNITURES TABLE /////////////
module.exports.addSign = (userId, signature) => {
    const query = `
        INSERT INTO signatures (user_id, signature)
        VALUES ($1, $2)
        RETURNING *
    `;
    const params = [userId, signature];
    return db.query(query, params);
}

module.exports.getSign = () => {
    return db.query(
        `SELECT users.firstname, users.lastname, profiles.city, profiles.url
FROM users 
FULL OUTER JOIN  profiles ON users.id = profiles.user_id 
INNER JOIN signatures ON users.id = signatures.user_id;`)
}

module.exports.getSigCount = () => {
    return db.query("SELECT COUNT(id) FROM signatures")
}

module.exports.getSigById = (sessionId) => {
    return db.query(`SELECT * FROM signatures WHERE id = ${sessionId}`);
}

module.exports.createUser = ({ firstname, lastname, email, password }) => {
    return hashPassword(password).then(passwordhash => {
            const query = `
        INSERT INTO users (firstname, lastname, email, passwordhash)
        VALUES ($1, $2, $3, $4)
        RETURNING *
    `;
            const params = [firstname, lastname, email, passwordhash];
            return db.query(query, params);
        })
        // hash the password from the parameters
        // then insert the relevant data into the database
        // remember RETURNING * at the end of the query!
        // return the right created row
}


module.exports.newProfile = (age, city, url, userId) => {
    const query = `
        INSERT INTO profiles (age, city, url, user_id)
        VALUES ($1, $2, $3, $4)
        RETURNING *
    `;
    const params = [age, city, url, userId];
    return db.query(query, params);
};

module.exports.login = ({ email, password }) => {
    //// first check if we have a user with the given email in the password
    return this.getUserByEmail({ email }).then(user => {
            if (!user) {
                return false
            }
            console.log(user)
            return bcrypt.compare(password, user.passwordhash).then(match => {
                if (!match) {
                    return false;
                } else {
                    return user
                }
            })
        })
        // (you may want to write a getUserByEmail function)
        // if not, return null
        // then check if the found user password_hash matches the given password
        // if not, return null
        // else, return the user
}

module.exports.getUserByEmail = ({ email }) => {
    return db.query(`SELECT * FROM users WHERE email = $1`, [email]).then(result => {
        return result.rows[0];
    })

}