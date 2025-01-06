#!/usr/bin/env node

const crypto = require('crypto');

function generateTOTP(secret) {
    // Get current timestamp rounded to the nearest 30 seconds
    const timestamp = Math.floor(Date.now() / 1000 / 30) * 30;
  
    // Concatenate the secret and timestamp
    const data = secret + timestamp;
  
    // Hash the concatenated data using SHA-256
    const hash = crypto.createHash('sha256').update(data).digest('hex');
  
    // Extract the first 6 numeric characters from the hash
    const code = hash.replace(/[^\d]/g, '').slice(0, 6);
  
    console.log('Generated TOTP:', code);

    return code;
}

// Hardcoded secret
const SECRET = 'frailVictorianChild';

generateTOTP(SECRET);