const { response } = require("express"); // Import the `response` object from Express (unused in this code)
const express = require("express");      // Import Express for creating the server
const mysql = require("mysql2");         // Import MySQL2 for connecting to the database
const path = require("path");            // Import `path` for handling file paths
const unirest = require("unirest")
const cors = require('cors');

// Removed bbcrypt and crypto
// Removed pepper TOTP 

// Define environment variables for server and database configuration
const PORT = String(process.env.PORT); 
const HOST = String(process.env.HOST); 
const MYSQLHOST = String(process.env.MYSQLHOST); 
const MYSQLUSER = String(process.env.MYSQLUSER);
const MYSQLPASS = String(process.env.MYSQLPASS);
const SQL = "SELECT * FROM things;"; 		

const app = express(); // Create an Express application
app.use(express.json()); // Middleware to parse JSON payloads in requests
app.use(
	cors({ //enables cors for all origins with credentials
	  	origin: true,
	  	credentials: true
	})
);

// Create a connection to the MySQL database
// New SQL database for "Stuff"
let connection = mysql.createConnection({
	host: MYSQLHOST, 
	user: MYSQLUSER, 
	password: MYSQLPASS, 
	database: "stuff" 
});

// Serve static files from the frontend directory
app.use("/", express.static(path.join(__dirname, '../frontend')));

// Unirest fetch call to verify JWT token
async function verifyJWT(JWT){
	return new Promise((result) => {
		let validJWT = false;
		unirest
			.post('http://server-users:80/jwt')
			.headers({
				'Content-Type': 'application/json',
				'Accept': 'application/json',
				'Origin': '*'
			})
			.send(JSON.stringify({"JWT": JWT}))
			.then((response) => {
				if (response.error){
					console.log("Error: ", response.error);
					return result(validJWT);
				}
				else {
					console.log("Response: ", response.body);
					validJWT = true;
					return result(validJWT);

				}
			})
		})
}

// Route to fetch all users
app.get("/query", async function (request, response) {
	// PART WE GOTTA FIGURE OUT with UNIREST
	// Get token from header of http request
	//console.log("Headers: " , request.headers);
	const JWT = request.headers['authorization'].split(' ')[1];
	// Send token to users server for verification (checks if token is not expired and was created by that server) "/verifyJWT"
	
	let validFlag = await verifyJWT(JWT);
	
	if (validFlag === true){
		connection.query(SQL, [true], (error, results, fields) => { // Execute the SQL query
			if (error) {
				console.error(error.message); // Log the error if the query fails
				response.status(500).send("database error"); // Respond with a 500 status and an error message
			} else {
				console.log(results); // Log the query results
				response.send(results); // Send the query results as the response
			}
		});
	}
	else {

		
	}
});


// Start the server on the specified HOST and PORT
app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`); // Log the server address when it starts

