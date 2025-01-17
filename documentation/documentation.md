# Table of Contents

[toc]

# NodeJS Application Structure and Data Flow

The web application depends on the following modules
1. MySQL
2. Express
3. Bcrypt

As per the `const SQL = "SELECT * FROM users;"` instruction on line 10 of `index.js`, the web application queries the MySQL database for all rows from the users table. This query is made when the button defined by lines 14-18 of the `index.html` file is clicked. 

## Endpoints

The file named `index.js` in the ++backend++ directory defines the endpoints. There are 2 endpoints:
| Endpoint | Information |
| - |
| /query | This is the endpoint for querying the MySQL database for all rows in the *users* table. |
| /login  |  This is the endpoint for sending POST requests containing user sign-in information. The client receives a response in accordance the validity of their sign-in credentials. <br><br> If the user sends invalid credentials, they receive a response reading "invalid credentials"| 
| /totp | Handles a POST request containing a TOTP code entered by the user for the user to check and verify. Response determined by if the TOTP code matches what the server has. |

The endpoints are defined as such:
```js
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
```

# Docker Compose

The Docker Compose file as-provided is insufficient to launch the services. Initially, the configuration file correlates port 80 for the container with port 80 for the host, permitting HTTP traffic; however, it does not do the same for traffic over port 3306. The initial configuration also does not ensure that the MySQL server container starts before the NodeJS application, likewise it is possible that the NodeJS application starts first, then immediately crashes because its connection to the MySQL database is refused.

The configuration needs to be modified such that the NodeJS application does not start until the MySQL server container starts, and such that port 3306 on the host is correlated with port 3306 in the container.  The NodeJS container can be configured such that it only starts when the MySQL server container starts by adding the following keys the NodeJS container's configuration:
```yml
depends_on:
	mysql:
		condition: service_healthy
```

The MySQL server container's configuration must also be changed so that the status `condition: service_healthy` can be ascertained. This is done by adding a `healthcheck` key to the MySQL server container's configuration:
```docker
healthcheck:
	test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
	interval: 10s
	timeout: 5s
	retries: 3
```

The specific values for the interval, timeout, and retries are more-or-less negligible in the context of this assignment.  

## Adding Pepper to Passwords

The pepper used by the web server is defined by an environment variable called `PEPPER`. This environment variable is defined in the docker compose file as such:
```docker
server:
	build: ./server
    restart: always
    environment:
      - HOST=0.0.0.0
      - PORT=80
      - MYSQLHOST=mysql
      - MYSQLUSER=root
      - MYSQLPASS=example
      - PEPPER=ef79
```

## Bcrypt

The web server depends on the bcrypt library to compare salted and peppered passwords. The addition of bcrypt is reflected in the `server/package.json` file. The *dependencies* key of the JSON now includes bcrypt, as follows:
```json
"dependencies": {
        "bcrypt": "^5.1.1",
        "express": "4.18.2",
        "mysql2": "2.3.3"
    }
```

# Application Structure Overview

**Containers:** The application consists of 4 containers
1. server-website
2. server-users
3. sql-users
4. sql-website

### server-website

"server-website" contains the frontend of the server container and has been restructured to allow for dynamic loading of page content to the index.html. This means when the user navigates or loads in new content, it gets loaded into the index.html page.

The new structure is as follows. We retain the index.html for our main webpage to display to the user, our index.js to handle interactions to this main webpage as well as loading in other JavaScript files when necessary, our styles.css which contains our CSS for the entire site, and finally our /pages folder to contain new contents we can load into the main index.html.

The pages folder contains folders of the different contents or pages we can display. Each folder inside of pages contains an .html and .js file to design the webpage and give functionality to the functions the html can call. As of now, we currently have four folders in the /pages directory: 'home', 'login', 'register', and 'totp'.

The 'home' folder contains the .html code to have the user click the query button and return the data. The 'login' folder contains the .html for the login input from the user and the .js file to send the login API call to the backend to verify credentials. The 'register' folder container the .html code to collect registration information from the user and a .js file to send an API call to the backend endpoint /register to register a user.
The 'totp' folder contains the page and sending logic to send off the TOTP code to the backend for it be verified.

### server-users

The backend of the user authentication service is in "server-users," and it depends on the Express framework, jsonwebtoken, and  the brcypt module. Additionally, the backend how defines the API endpoints for the login, registration, and TOTP processes.

### sql-users

The sql-users container runs a MySQL server to be accessed by the web application. This container utilizes the file users.sql to create a database and a *users* table with some predefined data.

### sql-website

Similarly, the sql-website container is also a MySQL servers accessed by the web application. This container holds a database called 'stuff' with the table 'things.'  The table contains some unique data.

# Steps Required to Access the Information

1. Run the Docker containers by executing `docker compose up` in a terminal.
2. Open a web browser and visit *localhost.*
3. Click the *login* button in the top-right of the user interface.
4. Enter a valid username and password. The page will automatically redirect after successful sign-in.
5. Generate TOTP with standalone NodeJS script to get a TOTP code.
6. Enter the TOTP code on the webpage the user is redirected to after successful login.
7. Click the *Query* button.
8. Terminate the Docker containers by executing `docker compose down`.
