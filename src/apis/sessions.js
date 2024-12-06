const db = require('../fb_config/fb_config');
const children = require('./children');
const accounts = require('./accounts');
const snapshotParser = require('./snapshotParser');

const sessionNode = 'sessions';

const saveSession = async (sessionInfo) => {
    try {
        await db.ref(sessionNode).child(sessionInfo.id).set(sessionInfo);
        return true;
    } catch (error) {
        return false;
    }
}

const getSessions = async (keyword) => {
    const sessions = await db.ref(sessionNode).once('value');
    const unfilteredSessionsData = snapshotParser.snapshotParserWithIds(sessions);

    const sessionsData = [];

    for (var i = 0; i < unfilteredSessionsData.length; i++) {
        if (unfilteredSessionsData[i].status) {
            continue;
        }
        sessionsData.push(unfilteredSessionsData[i]);
    }
    

    for (let i = 0; i < sessionsData.length; i++) {
        sessionsData[i].child = snapshotParser.snapshotParseObject(await children.getChildById(sessionsData[i].childId));
        sessionsData[i].therapist = snapshotParser.snapshotParseObject(await accounts.getAccountById(sessionsData[i].therapistId));
    }

    if (!keyword.trim()) {
        return sessionsData;
    }

    return sessionsData.filter(session => {
        const names = `
        ${ session.child.childLastName } 
        ${ session.child.childFirstName } 
        ${ session.child.childMiddleName }
        ${ session.therapist.name }`;
        return names.toLowerCase().includes(keyword.toLowerCase());
    });
}

const sessionDone = async (id) => {
    try {
        await db.ref(sessionNode).child(id).child('status').set('done');
        return true;
    } catch (error) {
        return false;
    }
}

const sessionCancelled = async (id) => {
    try {
        await db.ref(sessionNode).child(id).child('status').set('cancelled');
        return true;
    } catch (error) {
        return false;
    }
}

const getSessionsByTherapist = async (keyword, id) => {
    const sessions = await getSessions(keyword);

    return sessions.filter(session => session.therapistId === id);
}

module.exports = {
    saveSession,
    getSessions,
    getSessionsByTherapist,
    sessionDone,
    sessionCancelled
}