// Function to handle command execution
function runCommand(event) {
    if (event.key === 'Enter') {
        const command = document.getElementById('command').value;
        let output = '';

        // Simulate commands
        if (command === 'ls') {
            output = 'home  bin  usr  var\n';
        } else if (command === 'help') {
            output = 'Available commands: ls, help, date, clear\n';
        } else if (command === 'date') {
            output = new Date().toString() + '\n';
        } else if (command === 'clear') {
            document.getElementById('output').innerHTML = ''; // Clear the terminal output
            return; // Exit early to prevent adding a line of 'clear' output
        } else if (command == "cowsay") {
            executeCommand()

        } else {
            output = `command not found: ${command}\n`;
        }

        // Display the output and move the cursor down
        document.getElementById('output').textContent += `user@site:~$ ${command}\n${output}`;
        
        // Clear the input field after command execution
        document.getElementById('command').value = '';
        document.getElementById('output').scrollTop = document.getElementById('output').scrollHeight; // Scroll to the bottom
    }
}

function executeCommand() {

    fetch("http://localhost:80/terminal", { // Update with your actual server URL
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        }
    })
    .then(response => response.json())
    .then(data => {
        // Display the output in the <pre> element
        document.getElementById('output').innerText = data.output;
    })
    .catch(error => {
        console.error('Error fetching data:', error);
    });
}
