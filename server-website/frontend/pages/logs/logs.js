
var parsedUrl = new URL(window.location.href);

function logs() {
    // Gets jwt cookie and saves it as JWT variable
    const JWT = document.cookie
        .split('; ')
        .find(row => row.startsWith('jwt='))
        ?.split('=')[1];

    console.log("Token in HOME.JS: ", JWT);
    console.log(parsedUrl.host);
    fetch("http://" + parsedUrl.host + "/logs", {
        method: "GET",
        credentials: "include", //Needed to pass cookies from session
        headers: {
            'Authorization': `Bearer ${JWT}` // JWT token from cookie
        },
        mode: "cors",
    })
    .then((resp) => resp.text())
    .then((data) => {
        document.getElementById("response").innerHTML = data;
    })
    .catch((err) => {
        console.log(err);
    })
}