var parsedUrl = new URL(window.location.href);

function send_totp_code(totp) {
    console.log('SENDING TOTP code: ', totp)

    // Make a HTTP POST request to the /login endpoint in the backend
    // Set the headers to pass json data
    // Pass the json data in the body using JSON.stringify
    fetch("http://" + parsedUrl.host + ":8001/totp", {
        method: 'POST',
        mode: "cors",
        credentials: "include", //Needed to pass cookies from session
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({
            totp: totp
        }),
    })
    .then((response) => {

        // If response is 200, success login
        if(response.status == 200) {
            return response.json().then(data => {
                // Get token from response and save as JWT constant
                const JWT = data.token;
                const user = data.username;
                console.log("Token in TOTP.JS: ", JWT);
                // Sets JWT token value into jwt cookie 
                document.cookie = `jwt=${JWT}; path=/;`;
                document.cookie = `user=${user}; path=/;`;
                window.loggedIn = true;
                alert("Successfully Logged In")
                toggleNavbarLoginRegister();
                window.navigateTo('/home')
            });
        }
        // If response is 401, password or username was incorrect
        else if(response.status == 401) {
            alert("TOTP incorrect")
        }
        // If response is 500, server error occured, check server logs
        else if(response.status == 500) {
            alert("Server Error")
        }
        // Else an unhandled error occurs
        else {
            //Take JWT that is given to you as part of 200 response and place it in a cookie
            location.href = "http://" + parsedUrl.host + "/query.html";
            //alert("Unknown Error")
        }

    })
    .catch((error) => {
        //console.log(error);
    });
}