const admin = require('firebase-admin');

// const serviceAccount = require('../../keys/therapysystem-da6bd-firebase-adminsdk-pxhgg-47af7b9f27.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://therapysystem-da6bd-default-rtdb.asia-southeast1.firebasedatabase.app'
});

const database = admin.database();

module.exports = database;