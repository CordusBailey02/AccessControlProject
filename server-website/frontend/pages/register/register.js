var parsedUrl = new URL(window.location.href);

function register(username, password, email)
{
    fetch("http://" + parsedUrl.host + ":8001/register", 
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
    }).then(async (response) => 
    {
        // If response is 200, success login
        if(response.status == 200)
            {   
                let generatedQrCodeUrl;
                await response.json().then(data => {
                    // If QR Code URL is returned, display it
                    if (data.qrCodeUrl) {
                        generatedQrCodeUrl = data.qrCodeUrl;
                    }
                });
                window.loggedIn = true;
                alert("Successfully Registered!");
                showQrCodeModal(generatedQrCodeUrl)
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

// Add listener to close modal and redirect to login
document.getElementById('closeModal').addEventListener('click', function() {
    qrModal.style.display = 'none'; // Close the modal
    navigateTo('/login') // Redirect to login page
});

// Show QR Code Modal
function showQrCodeModal(qrCodeUrl) {
    const qrModal = document.getElementById('qrModal');
    const qrImage = document.getElementById('qrCode');
    qrImage.src = qrCodeUrl; // Set the QR code URL
  
    // Display the modal
    qrModal.style.display = 'block'; 
}
  
  