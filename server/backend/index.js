const { response } = require("express");
const express = require("express");
const mysql = require("mysql2");
const path = require("path");


const PORT = String(process.env.PORT);
const HOST = String(process.env.HOST);
const MYSQLHOST = String(process.env.MYSQLHOST);
const MYSQLUSER = String(process.env.MYSQLUSER);
const MYSQLPASS = String(process.env.MYSQLPASS);
const SQL = "SELECT * FROM users;";
const USER_TABLE_QUERY_PREFIX = "SELECT * FROM users;";
// const loginQuery = "SELECT * FROM users WHERE username = 'user' AND password = 'pass';"

const app = express();
app.use(express.json());


let connection = mysql.createConnection({
  host: MYSQLHOST,
  user: MYSQLUSER,
  password: MYSQLPASS,
  database: "users"
});


app.use("/", express.static(path.join(__dirname, '../frontend')));

app.get("/query", function (request, response) {
  connection.query(SQL, [true], (error, results, fields) => {
    if (error) {
      console.error(error.message);
      response.status(500).send("database error");
    } else {
      console.log(results);
      response.send(results);
    }
  });
})

// Route for login page
app.post("/login", function(request, response) {
	const { username, password } = request.body;
	const loginQuery = "SELECT username, password FROM users WHERE username = \'" + username + "\' AND password = \'" + password + "\';";
	connection.query(loginQuery,
			function(error, results, fields){
				if(error) {
					console.error(error.message);
					response.status(500);
					response.send("Database error");
				}
				// User found
				else if(results.length > 0) {
					console.log("Returned results:", results);
					response.send(results);
				}
				// User not found
				else {
					console.log('Failed Login, Invalid Credentials');
					response.status(400);
					response.send("invalid credentials");
				}
	    		}
	);
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});


app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);
