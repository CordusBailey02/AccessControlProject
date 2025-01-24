DROP DATABASE IF EXISTS stuff;
CREATE DATABASE stuff;

use stuff;

-- Need to track some data
CREATE TABLE things (
    thing1 VARCHAR(255) NOT NULL,
    thing2 VARCHAR(255) NOT NULL,
    thing3 VARCHAR(255) NOT NULL,
    thing4 VARCHAR(255) NOT NULL,
    PRIMARY KEY (thing1)
);

CREATE TABLE super_secrets (
    secret1 VARCHAR(255) NOT NULL,
    PRIMARY KEY (secret1)
);

CREATE TABLE normal_secrets (
    secret1 VARCHAR(255) NOT NULL,
    PRIMARY KEY (secret1)
);

-- Need to track some of that data
INSERT INTO things
VALUES("thing1","thing2","thing3","thing4");

INSERT INTO things
VALUES("thing11","thing22","thing33","thing44");

INSERT INTO things
VALUES("thing111","thing222","thing333","thing444");

INSERT INTO things
VALUES("thing1111","thing2222","thing3333","thing4444");



INSERT INTO super_secrets
VALUES("Super secret #1");

INSERT INTO normal_secrets
VALUES("Normal secret #1");
