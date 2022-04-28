DROP TABLE IF EXISTS profiles;

DROP TABLE IF EXISTS signatures;

DROP TABLE IF EXISTS users;

CREATE TABLE users (
    id             SERIAL PRIMARY KEY,
    firstname      VARCHAR(255) NOT NULL,
    lastname       VARCHAR(255) NOT NULL,
    email           VARCHAR(50) NOT NULL UNIQUE,
    passwordhash   VARCHAR NOT NULL,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE signatures (
    id          SERIAL PRIMARY KEY,    
    user_id     INTEGER NOT NULL UNIQUE REFERENCES users(id),
    signature   TEXT NOT NULL CHECK (signature != '')
);


CREATE TABLE profiles (
  id SERIAL PRIMARY KEY,
  age INT,
  city VARCHAR,
  url VARCHAR,
  user_id INT NOT NULL UNIQUE REFERENCES users(id)
);
/* 
SELECT users.firstname, users.lastname, profiles.city, profiles.url
FROM users 
FULL OUTER JOIN  profiles ON users.id = profiles.user_id 
INNER JOIN signatures ON users.id = signatures.user_id */