// Get the current script element
const scriptSrc = document.currentScript.src;
// Extract just the file name
const scriptFileName = scriptSrc.substring(scriptSrc.lastIndexOf('/') + 1);

console.log(scriptFileName, " script was loaded...");

var parsedUrl = new URL(window.location.href);

function query3() {
    // Gets jwt cookie and saves it as JWT variable
    const JWT = document.cookie
        .split('; ')
        .find(row => row.startsWith('jwt='))
        ?.split('=')[1];

    console.log("Token in HOME.JS: ", JWT);
    console.log(parsedUrl.host);
    fetch("http://" + parsedUrl.host + "/query3", {
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