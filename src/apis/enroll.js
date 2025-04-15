const db = require('../fb_config/fb_config');
const children = require('./children');
const snapshotParser = require('./snapshotParser');

const enrollNode = 'enrollees';

const addEnrollee = async (enrolleeInformation) => {
    try {
        await db.ref(enrollNode).child(enrolleeInformation.id).set(enrolleeInformation);
        return true;
    } catch (error) {
        console.log('error in enroll: ' + error.message);
        return false;
    }
};

const getAllEnrollees = async (keyword = '') => {
    const enrollees = await db.ref(enrollNode).once('value', (snapshot) => {
        return snapshot.val();
    });
    
    const parsedData = snapshotParser.snapshotParserWithIds(enrollees);

    if (!keyword.trim()) {
        return parsedData;
    }

    const filteredEnrollees = parsedData.filter((enrollee) => {
        const allName = `${ enrollee.childFirstName } ${ enrollee.childMiddleName } ${ enrollee.childLastName } ${ enrollee.parentFirstName } ${ enrollee.parentMiddleName }  ${ enrollee.parentLastName } `;
        return allName.toLowerCase().includes(keyword.toLowerCase());
    });

    return filteredEnrollees;
};

const acceptEnrollee = async (id, service, therapistId) => {
    const enrollee = await db.ref(enrollNode).child(id).once('value', (snapshot) => {
        return snapshot.val();
    });

    const parsedData = snapshotParser.snapshotParseObject(enrollee);

    parsedData.service = service;
    parsedData.therapistId = therapistId;

    const response = await children.addChild(parsedData);

    if (response) {
        await db.ref(enrollNode).child(id).remove();
        return true;
    } else {
        return false;
    }
};

const rejectEnrollee = async (id) => {
    try {
        await db.ref(enrollNode).child(id).remove();
        return true;
    } catch (error) {
        console.log('error in rejecting child: ' + error.message);
        return false;
    }
};

const checkChildCredentials = async (username, password) => {
    const enrollees = await getAllEnrollees();
    const enrollee = enrollees.find((enrollee) => {
        return enrollee.parentUsername.toLowerCase() === username.toLowerCase() && enrollee.parentPassword === password;
    });

    return enrollee;
}

module.exports = {
    addEnrollee,
    getAllEnrollees,
    acceptEnrollee,
    rejectEnrollee,

    checkChildCredentials
}