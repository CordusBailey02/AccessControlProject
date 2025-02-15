var parsedUrl = new URL(window.location.href);

function login(username, password) {

    // Make a HTTP POST request to the /login endpoint in the backend
    // Set the headers to pass json data
    // Pass the json data in the body using JSON.stringify
    console.log(username);
    console.log(password);
    fetch("http://" + parsedUrl.host + ":8001/login", {
    method: 'POST',
    mode: "cors",
    credentials: "include", //Needed to pass session cookies
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
    body: JSON.stringify({
        username: username,
        password: password
    }),
    })
    .then((response) => {
        console.log(response);
        console.log(response.status);
        // If response is 200, success login
        if(response.status == 200)
        {
            window.loggedIn = true;
            alert("Successfully Logged In")
            window.navigateTo('/totp')
        }
        // If response is 401, password or username was incorrect
        else if(response.status == 401) {
            alert("Username or password incorrect");
        }
        // If response is 500, server error occured, check server logs
        else if(response.status == 500) {
            alert("Server Error");
        }
        // Else an unhandled error occurs
        else {
            alert("Unknown Error")
        }

    })
    .catch((error) => {
        //console.log(error);
    });
}