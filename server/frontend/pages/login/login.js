var parsedUrl = new URL(window.location.href);

function login(username, password) {

    fetch("http://" + parsedUrl.host + "/login", {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
    body: JSON.stringify({
        username: username,
        password: password
    }),
    })
    .then(response => response.json())
    .then(data => {
        console.log(data)
        // Sets login to true and navigates to home page
        if(data.message == "success")
        {
            window.loggedIn = true;
            window.navigateTo('/home')
        }

    })
    .catch((error) => console.error('Error:', error));
}