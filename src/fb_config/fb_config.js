const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// const serviceAccount = require('../../keys/therapysystem-da6bd-firebase-adminsdk-pxhgg-47af7b9f27.json');

const isRender = process.env.DEV_ENV === 'production';
let serviceAccount;

if (isRender) {
    serviceAccount = JSON.parse(fs.readFileSync('/etc/secrets/pk.json', 'utf8'));
} else {
    serviceAccount = JSON.parse(fs.readFileSync(path.join(__dirname, '/keys/pk.json')));
}

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://therapysystem-da6bd-default-rtdb.asia-southeast1.firebasedatabase.app'
});

const database = admin.database();

module.exports = database;