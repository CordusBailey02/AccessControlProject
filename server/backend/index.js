const { response } = require("express"); // Import the `response` object from Express (unused in this code)
const express = require("express");      // Import Express for creating the server
const mysql = require("mysql2");         // Import MySQL2 for connecting to the database
const path = require("path");            // Import `path` for handling file paths
const bcrpyt = require('bcrypt');

// Define environment variables for server and database configuration
const PORT = String(process.env.PORT); 
const HOST = String(process.env.HOST); 
const MYSQLHOST = String(process.env.MYSQLHOST); 
const MYSQLUSER = String(process.env.MYSQLUSER);
const MYSQLPASS = String(process.env.MYSQLPASS); 
const SQL = "SELECT * FROM users;"; 		

const app = express(); // Create an Express application
app.use(express.json()); // Middleware to parse JSON payloads in requests

// Create a connection to the MySQL database
let connection = mysql.createConnection({
	host: MYSQLHOST, 
	user: MYSQLUSER, 
	password: MYSQLPASS, 
	database: "users" 
});

// Serve static files from the frontend directory
app.use("/", express.static(path.join(__dirname, '../frontend')));

// Route to fetch all users
app.get("/query", function (request, response) {
	connection.query(SQL, [true], (error, results, fields) => { // Execute the SQL query
		if (error) {
			console.error(error.message); // Log the error if the query fails
			response.status(500).send("database error"); // Respond with a 500 status and an error message
		} else {
			console.log(results); // Log the query results
			response.send(results); // Send the query results as the response
		}
	});
});

// Route for login page
app.post("/login", function (request, response) {
	const { username, password } = request.body; // Extract username and password from the request body

	// Dynamically construct the SQL query with user-provided credentials
	const loginQuery = "SELECT * FROM users WHERE username = ?"
	connection.query(loginQuery, [username],
			async function (error, results, fields) { // Execute the query
				if (error) {
					console.error(error.message); 
					// Update response type and send error message
					response.status(500); 
          // Have to send back json (dictionary)
					response.send({"message": "Database error"}); 
				}
				// User found
				else if (results.length > 0) {
					console.log("Returned results:", results);

          // Get stored information for the user
          const storedUsername = results[0].username;
          const storedPassword = results[0].password;
          const storedSalt = results[0].salt;

          // Hash inputted password with salt
          const hashedPassword = await hashPassword(password, storedSalt);
          console.log(hashedPassword)
          console.log(storedSalt)

          // Make sure username matches and stored password matches inputted hashed password with stored salt
          if(username == storedUsername && storedPassword == hashedPassword)
          {
            response.status(200); 
					  response.send({"message": "success"});
          }
				}
				// User not found
				else {
					console.log('Failed Login, Invalid Credentials');
					// Update response type and send response message
					response.status(401);
          // Have to send back json (dictionary)
					response.send({"message" :"invalid credentials"}); 
				}

        return {"message": "Failed..."} 
			}
	);
});

// Start the server on the specified HOST and PORT
app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`); // Log the server address when it starts

async function hashPassword(password, salt) {
  //const salt = await bcrpyt.genSalt(4);
  const PEPPER = "$2b$04$8hQbkpQsUfcfwFE/KIbwQO";
  const pepperedPassword = password + PEPPER;

  const hashedPassword = await bcrpyt.hash(password, salt);
  return hashedPassword;
}

