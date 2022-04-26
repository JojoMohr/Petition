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


module.exports.newProfile = ({ age, city, url }, userId) => {
    console.log("last: ", { age, city, url }, userId);
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
module.exports.getSignersByCity = ({ city }) => {
    console.log('City in db file ->', city)
    const query = `SELECT users.firstname AS first_name, users.lastname AS last_name, profiles.city AS city, profiles.url AS url
        FROM users 
        JOIN signatures
        ON users.id = signatures.user_id
        FULL OUTER JOIN profiles
        ON users.id = profiles.user_id
        WHERE LOWER(profiles.city) = LOWER($1);`

    const params = [city]
    return db.query(query, params);
}

module.exports.getUserProfileById = (userId) => {
    console.log("This us the user_id", userId)
    const query = `SELECT users.firstname AS first_name, users.lastname AS last_name, profiles.city AS city, profiles.url AS url, users.email,  profiles.age, profiles.city 
        FROM users 
         LEFT JOIN profiles
        ON users.id = profiles.user_id
        WHERE users.id = $1`

    const params = [userId]
    return db.query(query, params);
}

module.exports.updateUser = (firstname, lastname, email, user_id) => {
    const query = `UPDATE users
        SET firstname = $1, lastname = $2, email = $3
        WHERE id = $4;`

    const params = [firstname, lastname, email, user_id]
    return db.query(query, params);
}


module.exports.updateUserProfile = (age, url, city, user_id) => {
    const query =
        `INSERT INTO profiles (age, url, city, user_id)
        VALUES ($1,$2,$3, $4)
        ON CONFLICT (user_id)
        DO UPDATE SET age = $1, url = $2, city= $3;`

    const params = [age, url, city, user_id]
    return db.query(query, params);
}



module.exports.deleteSignature = (sessionId) => {
    const query =
        `DELETE signature FROM signatures WHERE id = ${sessionId};`

    const params = [sessionId]
    return db.query(query, params);
}



// module.exports.updateUserWithPassword = (password, first_name, last_name, email, age, city, url) => {
//     console.log("DATA AND ID", first_name, last_name, email, age, city, url)
//     `
// UPDATE users.passwordhash, users.firstname, users.lastname, profiles.city, profiles.url, users.email, profiles.age, profiles.city
//         IN users 
//          LEFT JOIN profiles
//         ON users.id = profiles.user_id
//         WHERE users.id = $1`

//     const params = [userId]
//     return db.query(query, params);
// }