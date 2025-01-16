const { response } = require("express"); // Import the `response` object from Express (unused in this code)
const express = require("express");      // Import Express for creating the server
const mysql = require("mysql2");         // Import MySQL2 for connecting to the database
const path = require("path");            // Import `path` for handling file paths
const bcrpyt = require('bcrypt');
const crypto = require('crypto');
const session = require('express-session');
const {createHmac} = require("crypto")
const jwt = require("jsonwebtoken")
const cors = require('cors');



// Define environment variables for server and database configuration
const PORT = String(process.env.PORT); 
const HOST = String(process.env.HOST); 
const MYSQLHOST = String(process.env.MYSQLHOST); 
const MYSQLUSER = String(process.env.MYSQLUSER);
const MYSQLPASS = String(process.env.MYSQLPASS);
const PEPPER = String(process.env.PEPPER);
const TOTP_SECRET = String(process.env.TOTP_SECRET);
const JWTSECRET = String(process.env.JWTSECRET);
const SQL = "SELECT * FROM users;"; 	

const app = express(); // Create an Express application
app.use(express.json()); // Middleware to parse JSON payloads in requests
app.use(
	cors({ //enables cors for all origins with credentials
	  	origin: true,
	  	credentials: true
	})
);

app.use( //session to store username to use in totp route
    session({
        secret: 'DontTellAnyoneThisSecretKey',
        resave: false,
        saveUninitialized: false,
        cookie: { 
			secure: false
		}
    })
);


// Create a connection to the MySQL database
let connection = mysql.createConnection({
	host: MYSQLHOST, 
	user: MYSQLUSER, 
	password: MYSQLPASS, 
	database: "users" 
});

// Serve static files from the frontend directory
//app.use("/", express.static(path.join(__dirname, '../frontend')));

// Route to fetch all users 
/*
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
*/

// Doesnt need to change just need to reach out with a different port number
// Route for login page
app.post("/login", function (request, response) {
	const { username, password } = request.body; // Extract username and password from the request body
	console.log("\nLOGIN Request: ", request.body)
	//Record username in session cookie
	request.session.username = username;
	// Dynamically construct the SQL query with user-provided credentials
	const loginQuery = "SELECT * FROM users WHERE username = ?";
	connection.query(loginQuery, [username],
			function (error, results, fields) { // Execute the query

				if (error) {
					console.error("Database Error:\n", error.message); 
					// Update response type and send error message
					response.status(500); 
          			// Have to send back json (dictionary)
					response.send("Server Error"); 
				}
				else if(results.length == 0) {
					console.log('User not found');
					// Update response type and send response message
					response.status(401);
          			// Have to send back json (dictionary)
					response.send("Unauthorized"); 
				}
				// User found
				else {
					// Get stored information for the user
					const storedPassword = results[0].password;
					const storedSalt = results[0].salt;
					// Construct password with stored salt from user, inputted password for login, and the PEPPER
					const combinedPass = storedSalt + password + PEPPER;

					// Use bcrypt to compare the combinedPassword with the stored password
					bcrpyt.compare(combinedPass, storedPassword, function(err, result) {
						// If we get an error, then there is a password mismatch
						if(err) {
							console.log("Error occurred")
							response.status(500);
							// Have to send back json (dictionary)
							response.send("Server Error"); 
						}
						// if result exists, we get a success login
                        else if(result) {
                            console.log(username, " logged in")
                            response.status(200)
                            response.send("Success")
                        }
						// Otherwise a unsuccessful login
						else {
							console.log("Password mismatch")
							response.status(401);
							// Have to send back json (dictionary)
							response.send("Unauthorized"); 
							console.log("[Login] sql result:\n", results);
						}
					})
				}
				
			}
	);
});

app.post("/totp", function (request, response) {
    const { totp } = request.body;
    const generatedCode = generateTOTP();
    console.log('Server generated code: ', generatedCode)
    console.log('Inputted code: ', totp)

    if (generatedCode === totp) {
        // CGets the username from the session cookie
        const username = request.session.username;
        
        // Query the user database for user details
        const query = 'SELECT username, email FROM users WHERE username = ?';
        connection.query(query, [username], (error, results) => {
            if (error) {
                console.error('Database error:', error.message);
                return response.status(500).json({ 
                    message: 'Database error' 
                });
            }

            if (results.length > 0) {
                const { username, email } = results[0];

                // Generate a JWT containing the username and email
                const token = jwt.sign(
                    { username, email },
                    JWTSECRET,
                    { expiresIn: '1h' } // Token expiration time
                );

				console.log('Token created successfully: ' , token);
				//If created token successfully send 200 response with the token
                return response.status(200).json({
                    message: 'TOTP verified successfully',
                    token: token
                });
            } else {
				console.log('404');
                return response.status(404).json({ 
                    message: 'User not found' 
                });
            }
        });
    } else {
		console.log("Invalid TOTP Code")
        response.status(401).json({ 
            message: 'Invalid code' 
        });
    }
});


function generateTOTP() {
    // Get current timestamp rounded to the nearest 30 seconds
    const timestamp = Math.floor(Date.now() / 1000 / 30) * 30;

    // Concatenate the secret and timestamp
    const data = TOTP_SECRET + timestamp;
  
    // Hash the concatenated data using SHA-256
    const hash = crypto.createHash('sha256').update(data).digest('hex');
  
    // Extract the first 6 numeric characters from the hash
    const code = hash.replace(/[^\d]/g, '').slice(0, 6);
  
    console.log('Generated TOTP:', code);

    return code;
}

app.post("/jwt", function (request, response) {
    //Verify that the token is current and was made by this server
	const { jwt } = request.body;
	console.log("verifyJWT value: ", jwt);
	return response.status(200);
	//return response.send("Verification Successful.")
})


app.post("/register", function (request, response) {
	const { username, password, email } = request.body; // Extract username and password from the request body
	console.log("\nREGISTER Request: ", request.body);
	// Dynamically construct the SQL query with user-provided credentials

	const registerQuery = "INSERT INTO users VALUES (?, ?, ?, ?);";
	const combinedPass = password + PEPPER;

	console.log("[REGISTER] Combined pass: ", combinedPass);

	bcrpyt.genSalt(1, function(err, salt) {
		if(err) {
			console.log("Salt generation error:\n\t", err.message);
		}
		else {
			console.log("[Register] salt: ", salt);
		}
		bcrpyt.hash(combinedPass, salt, function(err, hash) {
			if(err) {
				console.log("Hash generation error:\n\t", err.message);
			}
			connection.query(registerQuery, [username, hash, salt, email], 
				function (error, results, fields) 
				{ // Execute the query
					if (error) {
						console.error("Database Error:\n", error.message); 
						// Update response type and send error message
						response.status(500); 
						// Have to send back json (dictionary)
						response.send("Server Error"); 
					}
					else
					{
						response.status(200);
						response.send("Registration complete.")
					}
				}
			)
		})
	})
	
	
})

// Start the server on the specified HOST and PORT
app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`); // Log the server address when it starts

