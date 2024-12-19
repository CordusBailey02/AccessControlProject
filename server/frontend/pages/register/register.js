var parsedUrl = new URL(window.location.href);

function register(firstname, lastname, username, password)
{
    fetch("http://" + parsedUrl.host + "/register", 
    {
        method: 'POST',
        headers: 
        {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify(
        {
            username: username,
            password: password
        }),
    }).then((response) => 
    {
        // If response is 200, success login
        if(response.status == 200)
            {
                window.loggedIn = true;
                alert("Successfully Registered!")
                window.navigateTo('/home')
            }
            // If response is 401, password or username was incorrect
            else if(response.status == 401) {
                alert("Username or password incorrect")
            }
            // If response is 500, server error occured, check server logs
            else if(response.status == 500) {
                alert("Server Error")
            }
            // Else an unhandled error occurs
            else {
                alert("Unknown Error")
            }
    }).catch((error) => 
    {
        console.log(error);
    });
}