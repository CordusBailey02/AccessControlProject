var parsedUrl = new URL(window.location.href);

function send_totp_code(totp) {
    console.log('SENDING TOTP code: ', totp)

    // Make a HTTP POST request to the /login endpoint in the backend
    // Set the headers to pass json data
    // Pass the json data in the body using JSON.stringify
    fetch("http://" + parsedUrl.host + "/totp", {
    method: 'POST',
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
        if(response.status == 200)
        {
            window.loggedIn = true;
            alert("Successfully Logged In")
            window.navigateTo('/home')
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
            alert("Unknown Error")
        }

    })
    .catch((error) => {
        //console.log(error);
    });
}