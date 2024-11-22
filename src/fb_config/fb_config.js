const admin = require('firebase-admin');

const serviceAccount = require('../../therapysystem-4c459-firebase-adminsdk-gg8hm-66ef117a1f.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://therapysystem-4c459-default-rtdb.asia-southeast1.firebasedatabase.app'
});

const database = admin.database();

module.exports = database;