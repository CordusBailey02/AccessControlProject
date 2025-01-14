DROP DATABASE IF EXISTS stuff;
CREATE DATABASE stuff;

use stuff;

-- Need to track some data
CREATE TABLE things (
    username VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    salt     VARCHAR(255) NOT NULL,
    email    VARCHAR(255) NOT NULL,
    PRIMARY KEY (username)
);

-- Need to track some of that data
INSERT INTO things
VALUES("user", 
    "$2a$12$wUWUEeCBtZhpornft90MjOAlp.96R/xyiZJin8E3xYuE7Zsfr7D4C", 
    "3eb7", 
    "user@example.com");
