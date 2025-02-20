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
const { authenticator } = require('otplib');
const qrcode = require('qrcode');

// Define environment variables for server and database configuration
const PORT = String(process.env.PORT); 
const HOST = String(process.env.HOST); 
const MYSQLHOST = String(process.env.MYSQLHOST); 
const MYSQLUSER = String(process.env.MYSQLUSER);
const MYSQLPASS = String(process.env.MYSQLPASS);
const PEPPER = String(process.env.PEPPER);
const JWTSECRET = String(process.env.JWTSECRET);
const SQL = "SELECT * FROM users;";

authenticator.options = { window: 1 };

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
	database: "users",
	keepAliveInitialDelay: 60000, // Send keep-alive packet every 60s
	enableKeepAlive: true 
});

// Route for inserting logs
app.post("/log_entry", function (request, response) {

	const { username, log_date, log_data, is_success } = request.body;
	console.log("requestbody log_entry: ", request.body);
	console.log("Logs Received: ", username, log_date, log_data, is_success);

	//Store data as new entry in SQL log table
	connection.connect(function(err) {
		if (err) throw err;
		console.log("Connected to logs");

		// Send log data
		var query = "INSERT INTO logs (username, log_date, log_data, is_success) VALUES ?";
		var querydata = [[username, log_date, log_data, is_success]];
		connection.query(query, [querydata], function (err, result) {
			if (err) throw err;
			console.log("Query Data: " + querydata);
		});
	});

});

// Route for retrieving logs
app.post("/log_retrieve", function (request, response) {
	
	const { log_date } = request.body;
	
	const authHeader = request.headers['authorization'];
	if(!authHeader) {
		console.log("No Auth Header from logs");
	}

	connection.connect(function(err) {
		if (err) throw err;
		console.log("Connected to logs for receive");
		
		// Send log data
		var query = "SELECT * FROM logs";
		connection.query(query, function (err, result) {
			if (err) throw err;
			console.log("Logs selected");

			if(err) {
				console.log("Error occurred")
				response.status(500);
				// Have to send back json (dictionary)
				response.send("Server Error"); 
			}
			// if result exists, we return logs
			else if(result) {
				console.log("Sending: " + response.send(result));
			}
		});
	});

});

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
						console.log(storedPassword);
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

app.post("/totp", async function (request, response) {
    const { totp } = request.body;

	// Gets the username from the session cookie
	var username = request.session.username;

	// Get users stored totp secret
	const user_totp_secret = await getUserTotpSecret(username);

	const isValid = authenticator.verify({
		token: totp,
		secret: user_totp_secret
	});

    if (isValid) {
		
        console.log("username: ", username);
        // Query the user database for user details
        const query = 'SELECT username, email, role FROM users WHERE username = ?';
        connection.query(query, [username], (error, results) => {
            if (error) {
                console.error('Database error:', error.message);
                return response.status(500).json({ 
                    message: 'Database error' 
                });
            }

            if (results.length > 0) {
                const { username, email, role } = results[0];

                // Generate a JWT containing the username and email
                const token = jwt.sign(
                    { username, email, role },
                    JWTSECRET,
                    { expiresIn: '1h' } // Token expiration time
                );

				console.log('Token created successfully: ' , token);
				//If created token successfully send 200 response with the token
                return response.status(200).json({
                    message: 'TOTP verified successfully',
                    token: token,
					username: username
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

// Create a promise-based query function
function getUserTotpSecret(username) {
    return new Promise((resolve, reject) => {
        const query = "SELECT totp_secret FROM users WHERE username = ?";
        
        connection.query(query, [username], function (error, results, fields) {
            if (error) {
                reject(error); // Reject the promise if there's an error
            } else if (results.length > 0) {
                resolve(results[0].totp_secret); // Resolve the promise with the totp_secret
            } else {
                resolve(null); // Resolve with null if no result is found
            }
        });
    });
}

// Function to generate a TOTP secret for user registration
function generateTOTPSecret() {
    // Generate a random TOTP secret
    const secret = authenticator.generateSecret();
    
    console.log('Generated TOTP Secret:', secret);
    
    return secret;
}

app.post("/jwt", function (request, response) {
    //Verify that the token is current and was made by this server
	const { JWT } = request.body;
	console.log("JWT Received: ", JWT);

	try {
		//decodes JWT with JWTSECRET
		const decodedJWT = jwt.verify(JWT, JWTSECRET);
		//console.log("Decoded Value",decodedJWT);
		console.log("JWT is valid.")
		return response.status(200).json(decodedJWT);

	} catch (err) {
		// Handle errors
		if (err.name === 'TokenExpiredError') {
			console.error("Token has expired!");
		} else if (err.name === 'JsonWebTokenError') {
			console.error("Invalid token!");
		} else {
			console.error("Token verification failed:", err.message);
		}
		return response.status(401).json({ 
            message: err.name
        });
	}

})


app.post("/register", function (request, response) {
	const { username, password, email } = request.body; // Extract username and password from the request body
	console.log("\nREGISTER Request: ", request.body);
	// Dynamically construct the SQL query with user-provided credentials

	const registerQuery = "INSERT INTO users VALUES (?, ?, ?, ?, ?, ?);";


	bcrpyt.genSalt(1, function(err, salt) {
		if(err) {
			console.log("Salt generation error:\n\t", err.message);
		}
		else {
			console.log("[Register] salt: ", salt);
		}
		const combinedPass = salt + password + PEPPER;
		console.log("[REGISTER] Combined pass: ", combinedPass);
		bcrpyt.hash(combinedPass, 12, function(err, hash) {
			if(err) {
				console.log("Hash generation error:\n\t", err.message);
			}
			const newTotpSecret = generateTOTPSecret();
			connection.query(registerQuery, [username, hash, 'user', salt, email, newTotpSecret], 
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
						// Generate the OTP Auth URL for the user
						const otpauthUrl = authenticator.keyuri(username, 'YourAppName', newTotpSecret);

						// Generate the QR code from the OTP Auth URL
						qrcode.toDataURL(otpauthUrl, function(err, dataUrl) {
							if (err) {
								console.log("Error generating QR code:", err);
								response.status(500).send("Error generating QR code.");
							} else {
								// Send the QR code URL to the client
								response.status(200).json({
									message: 'Registration complete.',
									qrCodeUrl: dataUrl // Send the base64-encoded QR code image
								});
							}
						});
					}
				}
			)
		})
	})
})

// Start the server on the specified HOST and PORT
app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`); // Log the server address when it starts

