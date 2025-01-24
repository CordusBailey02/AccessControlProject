DROP DATABASE IF EXISTS users;
CREATE DATABASE users;

use users;

CREATE TABLE users (
    username VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role     ENUM('admin', 'user') NOT NULL DEFAULT 'user',
    salt     VARCHAR(255) NOT NULL,
    email    VARCHAR(255) NOT NULL,
    PRIMARY KEY (username)
);

INSERT INTO users
VALUES("user", 
    "$2a$12$wUWUEeCBtZhpornft90MjOAlp.96R/xyiZJin8E3xYuE7Zsfr7D4C",
    "user",
    "3eb7", 
    "user@example.com");

INSERT INTO users
VALUES("admin",
    "$2a$12$I4TNqxOKutDxXWF76ORf0elFIpTuHOoMw8zKWtjVfq2L9nnTgYAGu", -- Password is really 'example'
    "admin",
    "8c9a",
    "admin@example.com")
