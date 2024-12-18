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
    .then(data => console.log(data))
    .catch((error) => console.error('Error:', error));
}