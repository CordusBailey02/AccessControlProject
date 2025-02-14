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

CREATE TABLE linux_thoughts (
    id VARCHAR(255) NOT NULL,
    message1 VARCHAR(255) NOT NULL,
    message2 VARCHAR(255) NOT NULL,
    message3 VARCHAR(255) NOT NULL,
    message4 VARCHAR(255) NOT NULL,
    message5 VARCHAR(255) NOT NULL,
    message6 VARCHAR(255) NOT NULL,
    message7 VARCHAR(255) NOT NULL,
    message8 VARCHAR(255) NOT NULL,
    message9 VARCHAR(255) NOT NULL,
    message10 VARCHAR(255) NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE trashing_windows (
    id VARCHAR(255) NOT NULL,
    message1 VARCHAR(255) NOT NULL,
    message2 VARCHAR(255) NOT NULL,
    message3 VARCHAR(255) NOT NULL,
    message4 VARCHAR(255) NOT NULL,
    message5 VARCHAR(255) NOT NULL,
    message6 VARCHAR(255) NOT NULL,
    message7 VARCHAR(255) NOT NULL,
    message8 VARCHAR(255) NOT NULL,
    message9 VARCHAR(255) NOT NULL,
    message10 VARCHAR(255) NOT NULL,
    PRIMARY KEY (id)
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



INSERT INTO linux_thoughts
VALUES(1,
    "Linux: Open-source, secure, and customizable",
    "sudo rm -rf / -- just kidding, only Windows would do that",
    "Linux: Where the real power users work",
    "No viruses? Thanks, Linux!",
    "apt-get install coolstuff -- I can do that on Linux",
    "Linux users don't need to reboot every update",
    "In Linux, everything is a file",
    "Linux: The only OS that doesn't need constant reboots",
    "I do more with my terminal than you do with your GUI",
    "Linux - because Windows is for gamers");


INSERT INTO trashing_windows
VALUES(1,
    "$ grep 'stability' /etc/linux - Windows folder not found",
    "Linux: Where the magic happens, Windows: Where the crashes happen",
    "Kernel panic? Only in Windows",
    "Windows 11? More like Windows 10 with extra steps",
    "Windows Defender vs Linux - Guess who wins?",
    "Windows 10: Updates that never end, crashes that never stop",
    "Windows: More updates, works worse",
    "Not even Windows Defender can stop Linux from being awesome",
    "chmod 777 everything - Windows users cry",
    "Whats a matter windows boy? Scared to see a terminal?");
