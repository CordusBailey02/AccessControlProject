#!/usr/bin/env node

const crypto = require('crypto');

function generateTOTP(secret) {
    // Get current timestamp rounded to nearest 30 seconds
    const roundedTimestamp = Math.round(Date.now() / 30000) * 30000;

    // Concatenate secret with timestamp
    const concatenatedString = secret + roundedTimestamp.toString();

    // Hash the concatenated string
    const hash = crypto.createHmac('sha256', Buffer.from(secret)).update(concatenatedString).digest();

    // Extract first 6 numeric characters from the hash
    const totp = hash.slice(0, 6).toString('hex').replace(/\D/g, '');

    console.log('Generated TOTP:', totp);

    return totp;
}

// Hardcoded secret
const SECRET = 'frailVictorianChild';

generateTOTP(SECRET);

