CREATE DATABASE users;

use users;

CREATE TABLE users (
    username VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    email    VARCHAR(255) NOT NULL,
    salt     VARCHAR(255) NOT NULL,
    PRIMARY KEY (username)
);

INSERT INTO users
VALUES(
    "user",
    "$2b$04$8hQbkpQsUfcfwFE/KIbwQOtx4HiMuzFtBvVwBUKxGMRNsWaGHSj6i",
    "user@example.com",
    "$2b$04$8hQbkpQsUfcfwFE/KIbwQO"
);
