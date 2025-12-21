const speakeasy = require('speakeasy');
const QRCode = require('qrcode');

const generateSecret = (email) => {
    return speakeasy.generateSecret({
        name: `Diva's Kloset (${email})`,
        length: 20
    });
};

const verifyToken = (secret, token) => {
    return speakeasy.totp.verify({
        secret: secret,
        encoding: 'base32',
        token: token,
        window: 1
    });
};

const generateQRCode = async (otpauthUrl) => {
    try {
        return await QRCode.toDataURL(otpauthUrl);
    } catch (err) {
        console.error('Error generating QR code:', err);
        return null;
    }
};

module.exports = { generateSecret, verifyToken, generateQRCode };