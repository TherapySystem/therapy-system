const db = require('../fb_config/fb_config');

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


module.exports = {
    addEnrollee
}