
var parsedUrl = new URL(window.location.href);

function query3() {
    // Gets jwt cookie and saves it as JWT variable
    const JWT = document.cookie
        .split('; ')
        .find(row => row.startsWith('jwt='))
        ?.split('=')[1];

    const user = document.cookie
        .split('; ')
        .find(row => row.startsWith('user='))
        ?.split('=')[1];

    console.log("Token in HOME.JS: ", JWT);
    console.log(parsedUrl.host);
    fetch("http://" + parsedUrl.host + "/query3", {
        method: "GET",
        credentials: "include", //Needed to pass cookies from session
        headers: {
            'Authorization': `Bearer ${JWT} ${user}`, // JWT token from cookie
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