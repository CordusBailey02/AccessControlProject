DROP DATABASE IF EXISTS users;
CREATE DATABASE users;

use users;

CREATE TABLE users (
    username VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    salt     VARCHAR(255) NOT NULL,
    email    VARCHAR(255) NOT NULL,
    PRIMARY KEY (username)
);

INSERT INTO users
VALUES(
    "user",
    "$2a$12$7pvJ83QfxWSFdiIOqaoSJucaa8HnJgpJ/wGT.CHbLlddA/fAPk5ay",
    "3eb7",
    "user@example.com",
);
