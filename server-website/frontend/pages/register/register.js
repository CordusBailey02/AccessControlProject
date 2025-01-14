var parsedUrl = new URL(window.location.href);

function register(username, password, email)
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
            password: password,
            email: email
        }),
    }).then((response) => 
    {
        // If response is 200, success login
        if(response.status == 200)
            {
                window.loggedIn = true;
                alert("Successfully Registered!");
                window.navigateTo('/home');
            }
            // If response is 500, server error occured, check server logs
            else if(response.status == 500) {
                alert("Server Error");
            }
            // Else an unhandled error occurs
            else {
                alert("Unknown Error");
            }
    }).catch((error) => 
    {
        // console.log(error);
        // response.status(500);
        // alert("Network Error");
    });
}