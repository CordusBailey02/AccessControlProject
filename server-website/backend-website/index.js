const { response } = require("express"); // Import the `response` object from Express (unused in this code)
const express = require("express");      // Import Express for creating the server
const mysql = require("mysql2");         // Import MySQL2 for connecting to the database
const path = require("path");            // Import `path` for handling file paths
const unirest = require("unirest")
const cors = require('cors');

// Define environment variables for server and database configuration
const PORT = String(process.env.PORT); 
const HOST = String(process.env.HOST); 
const MYSQLHOST = String(process.env.MYSQLHOST); 
const MYSQLUSER = String(process.env.MYSQLUSER);
const MYSQLPASS = String(process.env.MYSQLPASS);	

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

// Unirest call to verify the JWT with the auth service
async function verifyJWT(JWT) {
	try {
		const response = await unirest
			.post('http://server-users:80/jwt') // 'http://localhost:8001/jwt' would do the same
			.header({
				'Content-Type': 'application/json',
				'Accept': 'application/json',
				'Origin': '*'
			})
			.send(JSON.stringify({"JWT": JWT}))

		// If an error, log it and return null
		if(response.error) {
			console.error("Error verifying JWT:", response.error)
			return null;
		}
		// Else, return the decoded JWT
		else {
			console.log("Response from JWT verifcation:", response.body)
			return response.body
		}
	}
	// Catch any errors, return null
	catch(error) {
		console.error("Unexpected error during JWT verification:", error)
		return null;
	}
}

//function to get the MYSQL formated datetime
function datetime() {
	const now = new Date();
  
	const year = now.getFullYear();
	// getMonth() returns a zero-indexed month so we add 1 and pad with a leading zero if needed
	const month = String(now.getMonth() + 1).padStart(2, '0');
	const day = String(now.getDate()).padStart(2, '0');
	const hours = String(now.getHours()).padStart(2, '0');
	const minutes = String(now.getMinutes()).padStart(2, '0');
	const seconds = String(now.getSeconds()).padStart(2, '0');
  
	return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }

// Connects to the logs table and queries log data
async function insertLogs(log_date, log_data, is_success) {
	try {
		const response = await unirest
			.post('http://server-users:80/log_entry') // 'http://localhost:8001/jwt' would do the same
			.header({
				'Content-Type': 'application/json',
				'Accept': 'application/json',
				'Origin': '*'
			})
			.send(JSON.stringify({"log_date": log_date, "log_data": log_data, "is_success": is_success}))

		// If an error, log it and return null
		if(response.error) {
			console.error("Error sending logs:", response.error)
			return null;
		}
		// Else, return the decoded message
		else {
			console.log("Response from log entry:", response.body)
			return response.body
		}
	}
	// Catch any errors, return null
	catch(error) {
		console.error("Unexpected error during log entry:", error)
		return null;
	}
}

app.get("/query", async function (request, response) {
	try {
		//Extract token from Authorization header
		const authHeader = request.headers['authorization'];
		if(!authHeader) {
			return response.status(401).send("Missing Authorization Header");
		}

		const JWT = authHeader.split(' ')[1];
		if(!JWT) {
			return response.status(401).send("Invalid Authorization Header Format");
		}

		// Verify the JWT
		const verificationResult = await verifyJWT(JWT);
		if(!verificationResult || !verificationResult.role) {
			return response.status(403).send("Token verification failed");
		}

		// List roles allowed to use this query
		const allowedRoles = ['user'];
		console.log("User role:", verificationResult.role);



////////////////////////////////////////////////////////////////////////
		
		//Call /log_entry 
			//Send over the data for
				//log_date   'when'     DATETIME      "YYYY-MM-DD HH:MM:SS"
				//log_data   'what'     VARCHAR(255)
				//is_success 'success'  TINYINT(1)    "1 = True, 0 = False"

		//log_date variable creation
		var log_date = datetime();  
		console.log(log_date);

		//log_data variable creation
		var log_data = "query_1_data";

		//is_success variable creation
		if(allowedRoles.includes(verificationResult.role)) {
			var is_success = 1;
		}
		else{
			var is_success = 0;
		}

		// Log to sql logs
		insertLogs(log_date, log_data, is_success);
////////////////////////////////////////////////////////////////////////


		// Check if the user has the correct role
		if(allowedRoles.includes(verificationResult.role)) {
			const SQL_QUERY = "SELECT * FROM things;";

			//Execute the sql query
			connection.query(SQL_QUERY, function (error, results) {
				// If error, return a 500 response
				if(error) {
					console.log("Database error:", error.message);
					response.status(500).send("database error");
				}
				// Else, success and return a 200 status and the query results
				else {
					console.log("Query Results:", results); // Log the query results
					response.status(200).send(results); // Send the query results as the response
				}
			});
		}
		// Send a 403 status and insuffcient permissons if user doesnt have correct role
		else {
			response.status(403).send("Insufficient permissions to perform this action");
		}
	}
	// Catch any unexpected errors, return status 500 and internal server error
	catch(error) {
		console.error("Unexpected error in /query route:", error);
		response.status(500).send("Internal server error");

	}
});

app.get("/query2", async function (request, response) {
	try {
		//Extract token from Authorization header
		const authHeader = request.headers['authorization'];
		if(!authHeader) {
			return response.status(401).send("Missing Authorization Header");
		}

		const JWT = authHeader.split(' ')[1];
		if(!JWT) {
			return response.status(401).send("Invalid Authorization Header Format");
		}

		// Verify the JWT
		const verificationResult = await verifyJWT(JWT);
		if(!verificationResult || !verificationResult.role) {
			return response.status(403).send("Token verification failed");
		}

		// List roles allowed to use this query
		const allowedRoles = ['admin', 'user'];
		console.log("User role:", verificationResult.role);


////////////////////////////////////////////////////////////////////////
		
		//Call /log_entry 
			//Send over the data for
				//log_date   'when'     DATETIME      "YYYY-MM-DD HH:MM:SS"
				//log_data   'what'     VARCHAR(255)
				//is_success 'success'  TINYINT(1)    "1 = True, 0 = False"

		//log_date variable creation
		var log_date = datetime();  
		console.log(log_date);

		//log_data variable creation
		var log_data = "query_2_data";

		//is_success variable creation
		if(allowedRoles.includes(verificationResult.role)) {
			var is_success = 1;
		}
		else{
			var is_success = 0;
		}

		// Log to sql logs
		insertLogs(log_date, log_data, is_success);
////////////////////////////////////////////////////////////////////////

		// Check if the user has the correct role
		if(allowedRoles.includes(verificationResult.role)) {
			const SQL_QUERY = "SELECT * FROM normal_secrets;";

			//Execute the sql query
			connection.query(SQL_QUERY, function (error, results) {
				// If error, return a 500 response
				if(error) {
					console.log("Database error:", error.message);
					response.status(500).send("database error");
				}
				// Else, success and return a 200 status and the query results
				else {
					console.log("Query Results:", results); // Log the query results
					response.status(200).send(results); // Send the query results as the response
				}
			});
		}
		// Send a 403 status and insuffcient permissons if user doesnt have correct role
		else {
			response.status(403).send("Insufficient permissions to perform this action");
		}
	}
	// Catch any unexpected errors, return status 500 and internal server error
	catch(error) {
		console.error("Unexpected error in /query route:", error);
		response.status(500).send("Internal server error");

	}
});

app.get("/query3", async function (request, response) {
	try {
		//Extract token from Authorization header
		const authHeader = request.headers['authorization'];
		if(!authHeader) {
			return response.status(401).send("Missing Authorization Header");
		}

		const JWT = authHeader.split(' ')[1];
		if(!JWT) {
			return response.status(401).send("Invalid Authorization Header Format");
		}

		// Verify the JWT
		const verificationResult = await verifyJWT(JWT);
		if(!verificationResult || !verificationResult.role) {
			return response.status(403).send("Token verification failed");
		}

		// List roles allowed to use this query
		const allowedRoles = ['admin'];
		console.log("User role:", verificationResult.role);


////////////////////////////////////////////////////////////////////////
		
		//Call /log_entry 
			//Send over the data for
				//log_date   'when'     DATETIME      "YYYY-MM-DD HH:MM:SS"
				//log_data   'what'     VARCHAR(255)
				//is_success 'success'  TINYINT(1)    "1 = True, 0 = False"

		//log_date variable creation
		var log_date = datetime();  

		//log_data variable creation
		var log_data = "query_3_data";

		//is_success variable creation
		if(allowedRoles.includes(verificationResult.role)) {
			var is_success = 1;
		}
		else{
			var is_success = 0;
		}

		// Log to sql logs
		insertLogs(log_date, log_data, is_success);
////////////////////////////////////////////////////////////////////////


		// Check if the user has the correct role
		if(allowedRoles.includes(verificationResult.role)) {
			const SQL_QUERY = "SELECT * FROM super_secrets;";

			//Execute the sql query
			connection.query(SQL_QUERY, function (error, results) {
				// If error, return a 500 response
				if(error) {
					console.log("Database error:", error.message);
					response.status(500).send("database error");
				}
				// Else, success and return a 200 status and the query results
				else {
					console.log("Query Results:", results); // Log the query results
					response.status(200).send(results); // Send the query results as the response
				}
			});
		}
		// Send a 403 status and insuffcient permissons if user doesnt have correct role
		else {
			response.status(403).send("Insufficient permissions to perform this action");
		}
	}
	// Catch any unexpected errors, return status 500 and internal server error
	catch(error) {
		console.error("Unexpected error in /query route:", error);
		response.status(500).send("Internal server error");

	}
});

app.get("/logs", async function (request, response) {
	try {
		//Extract token from Authorization header
		const authHeader = request.headers['authorization'];
		if(!authHeader) {
			return response.status(401).send("Missing Authorization Header");
		}

		const JWT = authHeader.split(' ')[1];
		if(!JWT) {
			return response.status(401).send("Invalid Authorization Header Format");
		}

		// Verify the JWT
		const verificationResult = await verifyJWT(JWT);
		if(!verificationResult || !verificationResult.role) {
			return response.status(403).send("Token verification failed");
		}

		// List roles allowed to use this query
		const allowedRoles = ['admin'];
		console.log("User role:", verificationResult.role);


////////////////////////////////////////////////////////////////////////
		
		//Call /log_entry 
			//Send over the data for
				//log_date   'when'     DATETIME      "YYYY-MM-DD HH:MM:SS"
				//log_data   'what'     VARCHAR(255)
				//is_success 'success'  TINYINT(1)    "1 = True, 0 = False"

		//log_date variable creation
		var log_date = datetime();  

		//log_data variable creation
		var log_data = "log_page_data";

		//is_success variable creation
		if(allowedRoles.includes(verificationResult.role)) {
			var is_success = 1;
		}
		else{
			var is_success = 0;
		}

		// Log to sql logs
		insertLogs(log_date, log_data, is_success);
////////////////////////////////////////////////////////////////////////


		// Check if the user has the correct role
		if(allowedRoles.includes(verificationResult.role)) {
			const logResponse = await unirest
				.post('http://server-users:80/log_retrieve') // 'http://localhost:8001/jwt' would do the same
				.header({
					'Content-Type': 'application/json',
					'Accept': 'application/json',
					'Origin': '*'
				})
				.send(JSON.stringify({"log_date": log_date}))
		
			// If an error, log it and return null
			if(logResponse.error) {
				console.error("Error retrieving logs:", response.error)
				return null;
			}
			// Else, return the decoded message
			else {
				console.log("Response from log retrieve " + logResponse)
				response.status(200).send(logResponse.body);
			}
		}
		// Send a 403 status and insuffcient permissons if user doesnt have correct role
		else {
			response.status(403).send("Insufficient permissions to perform this action");
		}
	}
	// Catch any unexpected errors, return status 500 and internal server error
	catch(error) {
		console.error("Unexpected error in /log_retrieve route:", error);
		response.status(500).send("Internal server error");

	}
});

// Start the server on the specified HOST and PORT
app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`); // Log the server address when it starts

