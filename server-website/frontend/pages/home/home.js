console.log('Home page script loaded');

document.getElementById('welcome-button')?.addEventListener('click', () => {
  alert('Welcome to the Home Page!');
});

var parsedUrl = new URL(window.location.href);

function query() {
    //Get token from cookie and place in HTTP header
    fetch("http://" + parsedUrl.host + "/query", {
        method: "GET",
        eaders: {
            'Authorization': JWT // token from cookie
        },
        mode: "no-cors",
    })
    .then((resp) => resp.text())
    .then((data) => {
        document.getElementById("response").innerHTML = data;
    })
    .catch((err) => {
        console.log(err);
    })
}