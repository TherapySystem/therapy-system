const db = require('../fb_config/fb_config');
const snapshotParser = require('./snapshotParser');

const notifNode = 'notifications';

const saveNotif = async (notifInfo) => {
    try {
        await db.ref(notifNode).child(notifInfo.id).set(notifInfo);
        return true;
    } catch (error) {
        return false;
    }
}

const getNotifByChild = async (id) => {
    const notifs = snapshotParser.snapshotParserWithIds(await db.ref(notifNode).once('value')).filter(notif => notif.childId == id);
    return notifs;
}

module.exports = {
    saveNotif,
    getNotifByChild
}