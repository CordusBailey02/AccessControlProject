const { response } = require("express"); // Import the `response` object from Express (unused in this code)
const express = require("express"); // Import Express for creating the server
const mysql = require("mysql2"); // Import MySQL2 for connecting to the database
const path = require("path"); // Import `path` for handling file paths

// Define environment variables for server and database configuration
const PORT = String(process.env.PORT); // Port on which the server will run
const HOST = String(process.env.HOST); // Host address for the server
const MYSQLHOST = String(process.env.MYSQLHOST); // MySQL database host
const MYSQLUSER = String(process.env.MYSQLUSER); // MySQL username
const MYSQLPASS = String(process.env.MYSQLPASS); // MySQL password
const SQL = "SELECT * FROM users;"; // Query to select all users
const USER_TABLE_QUERY_PREFIX = "SELECT * FROM users;"; // Placeholder for table-specific queries (currently unused)
const loginQuery = "SELECT * FROM users WHERE username = 'user' AND password = 'pass';"; // Hardcoded login query (not dynamic)

const app = express(); // Create an Express application
app.use(express.json()); // Middleware to parse JSON payloads in requests

// Create a connection to the MySQL database
let connection = mysql.createConnection({
  host: MYSQLHOST, // Use the MySQL host from environment variables
  user: MYSQLUSER, // Use the MySQL username from environment variables
  password: MYSQLPASS, // Use the MySQL password from environment variables
  database: "users" // Specify the database name
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
  connection.query(
    "SELECT username, password FROM users WHERE username = ? AND password = ?", 
	[username, password],  
    function (error, results, fields) { // Execute the query
      if (error) {
        console.error(error.message); // Log the error if the query fails
        response.status(500); // Set the response status to 500
        response.send("Database error"); // Respond with an error message
      } 
      // User found
      else if (results.length > 0) {
        console.log("Returned results:", results); // Log the query results
        response.send(results); // Send the query results as the response
      } 
      // User not found
      else {
        console.log('Failed Login, Invalid Credentials'); // Log an invalid login attempt
        response.status(400); // Set the response status to 400
        response.send("invalid credentials"); // Respond with an error message
      }
    }
  );
});

// Catch-all route to serve the main frontend HTML file for any undefined paths
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html')); // Serve the frontend index.html file
});

// Start the server on the specified HOST and PORT
app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`); // Log the server address when it starts
