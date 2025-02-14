const { authenticator } = require('otplib');
const qrcode = require('qrcode');

authenticator.options = { window: 1 };

// Your existing function
function generateTOTP(secret) {
    return authenticator.generate(secret); // Uses `otplib` to generate TOTP correctly
}

// Hardcoded secret
const SECRET = 'M6GXIIRCNYTCY5JD';
const username = 'admin';

// Generate and print the TOTP code using your function
console.log('Generated TOTP:', generateTOTP(SECRET));

// Generate the OTP Auth URL for the user
const otpauthUrl = authenticator.keyuri(username, 'YourAppName', SECRET);

// Generate and display the QR code
qrcode.toString(otpauthUrl, { type: 'terminal' }, (err, qr) => {
    if (err) {
        console.log("Error generating QR code:", err);
        return;
    }
    console.log("Scan this QR code with Google Authenticator:\n");
    //console.log(qr);
});
