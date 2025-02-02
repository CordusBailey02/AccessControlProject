
var parsedUrl = new URL(window.location.href);

function logs() {
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
    fetch("http://" + parsedUrl.host + "/logs", {
        method: "GET",
        credentials: "include", //Needed to pass cookies from session
        headers: {
            'Authorization': `Bearer ${JWT} ${user}`, // JWT token from cookie
        },
        mode: "cors",
    })
    .then((resp) => {
        if (resp.status === 403) {
            document.getElementById("response").innerHTML = "<p>Insufficient permissions to perform this action</p>";
            return Promise.reject("Forbidden");
        }
        return resp.json();
    })
    .then((data) => {
        
        let dataView = data;
        
    
        console.log(dataView);
        // Build the table header and start the table HTML
        let tableHTML = `
        <table border="1" style="border-collapse: collapse; width: 100%;">
            <thead>
                <tr>
                    <th>UID</th>
                    <th>Username</th>
                    <th>Log Date</th>
                    <th>Log Data</th>
                    <th>Is Success</th>
                </tr>
            </thead>
            <tbody>
        `;

        // Loop through each log entry and create a table row
        dataView.forEach(log => {
        tableHTML += `
            <tr>
                <td>${log.uid}</td>
                <td>${log.username}</td>
                <td>${new Date(log.log_date).toLocaleString()}</td>
                <td>${log.log_data}</td>
                <td>${log.is_success}</td>
            </tr>
        `;
        });

        // Close the table body and table tags
        tableHTML += `
            </tbody>
        </table>
        `;

        // Insert the table into the DOM
        document.getElementById("response").innerHTML = tableHTML;
        //document.getElementById("response").innerHTML = data;


    })
    .catch((err) => {
        console.log(err);
    })
}