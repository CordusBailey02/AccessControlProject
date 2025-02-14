
let sequence = [];

function buildSequence(number) {
    sequence.push(number)

    if(sequence.length == 6) {
        sendSequence(sequence)
        sequence = []
    }
}

function sendSequence(sequence) {
    console.log('Sequence:', sequence);

    fetch("http://localhost:80/checkSequence", { // Update with your actual server URL
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ sequence: sequence })
    })
    .then(response => response.text()) // Expecting HTML response
    .then(data => {
        if (data.includes("<div")) { // Basic check if we received HTML
            document.getElementById("images").innerHTML = data; // Insert into page
        } else {
            console.log("Server Response:", data);
        }
    })
    .catch(error => {
        console.error("Error sending sequence:", error);
    });
}